// Shared constants for the /presentations/message-house passphrase gate.
//
// Same shape as the RISE deck's gate (lib/rise-deck-gate.ts), with its own
// cookie, path and env var so the two decks can be shared with different
// people and rotated independently. The point is to keep an internal working
// draft out of search indexes and out of casual sharing, not to defend
// against a determined actor. Nothing about the passphrase lives in the repo
// -- not the string, not a digest of it. MESSAGE_HOUSE_PASSWORD in the Vercel
// project env is the only source, and when it is unset the gate denies
// everyone rather than falling open.
//
// To rotate the passphrase: change MESSAGE_HOUSE_PASSWORD in the Vercel
// project env (Production and Preview) and redeploy. Existing cookies stop
// matching, so viewers simply enter the new passphrase.

export const MESSAGE_HOUSE_COOKIE = "message_house"
export const MESSAGE_HOUSE_PATH = "/presentations/message-house"

// SHA-256, via Web Crypto rather than node:crypto so the same helper runs in
// the route handler and in the proxy, which has no Node built-ins.
export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

// The cookie value a successful unlock sets: the digest of the configured
// passphrase, so a cookie cannot be forged without knowing it. Null when
// MESSAGE_HOUSE_PASSWORD is unset -- callers must read that as "nobody is
// let in".
export async function messageHouseToken(): Promise<string | null> {
  const password = process.env.MESSAGE_HOUSE_PASSWORD
  if (!password) return null
  return sha256(password)
}
