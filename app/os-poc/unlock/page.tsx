import type { Metadata } from "next"
import { UnlockGate } from "./unlock-gate"

export const metadata: Metadata = {
  title: "Protected",
  robots: { index: false, follow: false },
}

// Rendered (via middleware rewrite) in place of the OS / Geovation POC deck for
// visitors who haven't entered the passphrase. The browser URL stays on the
// deck path; a correct passphrase sets the gate cookie and reloads into it.
export default function OsPocUnlockPage() {
  return <UnlockGate />
}
