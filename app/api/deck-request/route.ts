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

  // Default sender lets the route work before johnx.co is verified in Resend.
  // Once verified, swap to "John Hoopes <deck@johnx.co>" or similar.
  const from = process.env.DECK_REQUEST_FROM ?? "johnx deck <onboarding@resend.dev>"

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: "john@johnx.co",
    replyTo: email,
    subject: `New deck request: ${email}`,
    text: [
      `${email} requested the "Building with agents" deck.`,
      "",
      "Link they were shown: https://johnx.co/presentations/ai-agents",
      "",
      `IP: ${ip}`,
    ].join("\n"),
  })

  if (error) {
    console.error("[deck-request] resend error", error)
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
