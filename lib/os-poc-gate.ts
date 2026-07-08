// Shared constants for the /presentations/os-poc passphrase gate.
//
// The deck is a soft-gated interview artifact: the goal is to keep it out of
// search indexes and casual sharing, not to defend against a determined actor
// reading this (public) repo. The passphrase itself is never committed --
// only the SHA-256 of it. The unlock API verifies a submitted passphrase
// against this digest; middleware then checks for the resulting cookie.
//
// To rotate the passphrase: set OS_POC_PASSWORD in the Vercel project env
// (the unlock route prefers it over this digest), or replace the digest below
// with `printf '%s' 'NEW-PASSPHRASE' | shasum -a 256`.

export const OS_POC_COOKIE = "os_poc"
export const OS_POC_PATH = "/presentations/os-poc"

// SHA-256 of "geovation"
export const OS_POC_TOKEN =
  "776d9c1f9c13d45c47f658f544ad75b32d8526538c20461f561c39e6de033fa4"
