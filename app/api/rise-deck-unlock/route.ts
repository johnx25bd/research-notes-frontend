import { type NextRequest, NextResponse } from "next/server"
import { RISE_DECK_COOKIE, RISE_DECK_PATH, riseDeckToken, sha256 } from "@/lib/rise-deck-gate"

export const runtime = "nodejs"

const RATE_WINDOW_MS = 60_000
const RATE_MAX_PER_WINDOW = 10

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

export async function POST(req: NextRequest) {
  let body: { password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  if (!withinRate(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  // Fail closed. With no RISE_DECK_PASSWORD configured there is no passphrase
  // to match, so no request can unlock the deck -- deliberately, rather than
  // falling back to a digest committed to this repo.
  const token = await riseDeckToken()
  if (!token) {
    return NextResponse.json({ ok: false, error: "gate_unconfigured" }, { status: 503 })
  }

  const password = typeof body.password === "string" ? body.password : ""
  if ((await sha256(password)) !== token) {
    return NextResponse.json({ ok: false, error: "wrong_passphrase" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(RISE_DECK_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: RISE_DECK_PATH,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
