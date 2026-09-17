// Shared constants for the /demos/chip-registry passphrase gate.
//
// Same shape as the RISE deck's gate (lib/rise-deck-gate.ts), with its own
// cookie, path and env var so the demo can be shared and rotated
// independently of the decks. The point is to keep a pre-release demo out
// of search indexes and out of casual sharing, not to defend against a
// determined actor. Nothing about the passphrase lives in the repo -- not
// the string, not a digest of it. CHIP_REGISTRY_PASSWORD in the Vercel
// project env is the only source, and when it is unset the gate denies
// everyone rather than falling open. The unlock API checks a submitted
// passphrase against that env value; the proxy then checks for the
// resulting cookie.
//
// To rotate the passphrase: change CHIP_REGISTRY_PASSWORD in the Vercel
// project env (Production and Preview) and redeploy. Existing cookies stop
// matching, so viewers simply enter the new passphrase.

export const CHIP_REGISTRY_COOKIE = "chip_registry"
export const CHIP_REGISTRY_PATH = "/demos/chip-registry"

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
// CHIP_REGISTRY_PASSWORD is unset -- callers must read that as "nobody is
// let in".
export async function chipRegistryToken(): Promise<string | null> {
  const password = process.env.CHIP_REGISTRY_PASSWORD
  if (!password) return null
  return sha256(password)
}
