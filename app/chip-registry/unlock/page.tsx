import type { Metadata } from "next"
import { UnlockGate } from "./unlock-gate"

export const metadata: Metadata = {
  title: "Protected",
  robots: { index: false, follow: false },
}

// Rendered (via proxy rewrite) in place of the chip registry demo for
// visitors who haven't entered the passphrase. The browser URL stays on the
// demo path; a correct passphrase sets the gate cookie and reloads into it.
export default function ChipRegistryUnlockPage() {
  return <UnlockGate />
}
