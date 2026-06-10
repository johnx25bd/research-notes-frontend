import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs"

const RATE_WINDOW_MS = 60_000
const RATE_MAX_PER_WINDOW = 5

type RateHit = { count: number; resetAt: number }
const rateHits = new Map<string, RateHit>()

function withinRate(ip: string): boolean {
  const now = Date.now()
  const hit = rateHits.get(ip)
  if (!hit || now > hit.resetAt) {
    rateHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (hit.count >= RATE_MAX_PER_WINDOW) return false
  hit.count += 1
  return true
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: { email?: unknown; _gotcha?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  // Honeypot -- silently accept and drop. Bots fill hidden fields; humans don't.
  if (typeof body._gotcha === "string" && body._gotcha.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  if (!withinRate(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    console.error("[subscribe] RESEND_API_KEY or RESEND_AUDIENCE_ID missing")
    return NextResponse.json({ ok: false, error: "server_config" }, { status: 500 })
  }

  const welcomeFrom = process.env.SUBSCRIBE_FROM ?? "John <john@johnx.co>"

  const resend = new Resend(apiKey)

  // Add the contact to the audience. Resend owns the list, the unsubscribe
  // link, and compliance -- we just hand it the email. unsubscribed: false
  // makes a previously-unsubscribed address active again on re-subscribe.
  const contact = await resend.contacts.create({
    email,
    audienceId,
    unsubscribed: false,
  })

  if (contact.error) {
    // A duplicate (already-subscribed) email is a benign no-op -- treat it as
    // success. Anything else (bad/missing audience, auth, Resend outage) is a
    // real failure the form should reflect, not silently swallow.
    const message = String(contact.error.message ?? "").toLowerCase()
    const isDuplicate =
      contact.error.name === "validation_error" && message.includes("already")
    if (isDuplicate) {
      return NextResponse.json({ ok: true, already: true })
    }
    console.error("[subscribe] contact create error", contact.error)
    return NextResponse.json({ ok: false, error: "subscribe_failed" }, { status: 502 })
  }

  // Welcome note -- short, personal, from John so a reply lands in his inbox.
  // Best-effort: a failed welcome shouldn't undo a successful subscription.
  const welcome = await resend.emails.send({
    from: welcomeFrom,
    to: email,
    replyTo: "john@johnx.co",
    subject: "You're subscribed",
    text: [
      "Thanks for subscribing.",
      "",
      "I'll send a short note when I publish something new in the garden -- no schedule, no noise, just the occasional new piece of writing.",
      "",
      "If you ever want to talk through anything I write, just reply. This comes straight to me.",
      "",
      "John",
    ].join("\n"),
  })

  if (welcome.error) {
    console.error("[subscribe] welcome send error", welcome.error)
  }

  return NextResponse.json({ ok: true })
}
