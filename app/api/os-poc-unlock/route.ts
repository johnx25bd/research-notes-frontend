import { createHash } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import { OS_POC_COOKIE, OS_POC_PATH, OS_POC_TOKEN } from "@/lib/os-poc-gate"

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

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

// The digest to check a submitted passphrase against. An env override lets the
// passphrase be rotated without a code change; otherwise the committed digest
// (SHA-256 of "geovation") is used.
function expectedDigest(): string {
  const override = process.env.OS_POC_PASSWORD
  return override ? sha256(override) : OS_POC_TOKEN
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

  const password = typeof body.password === "string" ? body.password : ""
  if (sha256(password) !== expectedDigest()) {
    return NextResponse.json({ ok: false, error: "wrong_passphrase" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(OS_POC_COOKIE, OS_POC_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: OS_POC_PATH,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
