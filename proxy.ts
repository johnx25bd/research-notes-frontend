import { type NextRequest, NextResponse } from "next/server"
import { OS_POC_COOKIE, OS_POC_TOKEN } from "@/lib/os-poc-gate"

// Gate the OS / Geovation POC deck behind a passphrase. This proxy runs before
// the next.config rewrite that maps /presentations/os-poc -> index.html, so it
// covers both the bare path and every asset under it. Unauthenticated requests
// are rewritten (URL preserved) to the unlock screen.
export function proxy(req: NextRequest) {
  if (req.cookies.get(OS_POC_COOKIE)?.value === OS_POC_TOKEN) {
    return NextResponse.next()
  }
  const url = req.nextUrl.clone()
  url.pathname = "/os-poc/unlock"
  url.search = ""
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/presentations/os-poc", "/presentations/os-poc/:path*"],
}
