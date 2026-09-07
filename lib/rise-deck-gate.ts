// Shared constants for the /presentations/rise-design-01 passphrase gate.
//
// Same soft-gate shape as the OS / Geovation deck (lib/os-poc-gate.ts): the
// point is to keep an unreleased deck out of search indexes and out of casual
// sharing, not to defend against a determined actor. The difference is that
// nothing about this passphrase lives in the repo -- not the string, not a
// digest of it. RISE_DECK_PASSWORD in the Vercel project env is the only
// source, and when it is unset the gate denies everyone rather than falling
// open. The unlock API checks a submitted passphrase against that env value;
// the proxy then checks for the resulting cookie.
//
// To rotate the passphrase: change RISE_DECK_PASSWORD in the Vercel project
// env (Production and Preview) and redeploy. Existing cookies stop matching,
// so viewers simply enter the new passphrase.

export const RISE_DECK_COOKIE = "rise_deck"
export const RISE_DECK_PATH = "/presentations/rise-design-01"

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
// RISE_DECK_PASSWORD is unset -- callers must read that as "nobody is let in".
export async function riseDeckToken(): Promise<string | null> {
  const password = process.env.RISE_DECK_PASSWORD
  if (!password) return null
  return sha256(password)
}
