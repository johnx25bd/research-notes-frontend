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
  if (!apiKey) {
    console.error("[deck-request] RESEND_API_KEY missing")
    return NextResponse.json({ ok: false, error: "server_config" }, { status: 500 })
  }

  // Send from the verified johnx.co domain so Resend lifts its testing restriction
  // (which otherwise only allows delivery to the account owner). The notification
  // to John uses a transactional-looking sender; the deck delivery to the submitter
  // comes from John's personal address so it reads as a note from him.
  const notificationFrom = process.env.DECK_REQUEST_FROM ?? "johnx <noreply@johnx.co>"
  const deliveryFrom = "John <john@johnx.co>"
  const deckUrl = "https://johnx.co/presentations/ai-agents"

  const resend = new Resend(apiKey)

  const [notification, delivery] = await Promise.all([
    resend.emails.send({
      from: notificationFrom,
      to: "john@johnx.co",
      replyTo: email,
      subject: `New deck request: ${email}`,
      text: [
        `${email} requested the "Building with agents" deck.`,
        "",
        `Link delivered: ${deckUrl}`,
        "",
        `IP: ${ip}`,
      ].join("\n"),
    }),
    resend.emails.send({
      from: deliveryFrom,
      to: email,
      replyTo: "john@johnx.co",
      subject: "Building with agents",
      text: [
        `Hey -- thanks for your interest in Building with agents. The deck on AI agent fundamentals you requested is here: ${deckUrl}`,
        "",
        "It's a short pass through foundational concepts in agentic systems, meant to help build an accurate mental model.",
        "",
        "If anything in it sparks a question, or if you want to talk through how it lands for what you're working on, just reply to this email.",
        "",
        "Best,",
        "John",
      ].join("\n"),
    }),
  ])

  if (notification.error) {
    console.error("[deck-request] notification error", notification.error)
  }
  if (delivery.error) {
    console.error("[deck-request] delivery error", delivery.error)
  }

  // Only hard-fail if both sends failed -- the form's success state still gives
  // the submitter the link inline, so partial success is acceptable.
  if (notification.error && delivery.error) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
