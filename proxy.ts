import { type NextRequest, NextResponse } from "next/server"
import { OS_POC_COOKIE, OS_POC_TOKEN } from "@/lib/os-poc-gate"
import {
  CHIP_REGISTRY_COOKIE,
  CHIP_REGISTRY_PATH,
  chipRegistryToken,
} from "@/lib/chip-registry-gate"
import { RISE_DECK_COOKIE, RISE_DECK_PATH, riseDeckToken } from "@/lib/rise-deck-gate"
import {
  VAI_MESSAGE_HOUSE_COOKIE,
  VAI_MESSAGE_HOUSE_PATH,
  vaiMessageHouseToken,
} from "@/lib/vai-message-house-gate"

// Gate the passphrase-protected decks and demos. This proxy runs before the
// next.config rewrites that map /presentations/<deck> and /demos/<demo> ->
// index.html, so it covers both the bare paths and every asset under them.
// Unauthenticated requests are rewritten (URL preserved) to the relevant
// unlock screen.
export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith(RISE_DECK_PATH)) {
    // The RISE deck's token is derived from RISE_DECK_PASSWORD. With no
    // passphrase configured there is no token to match, so the gate denies
    // everyone rather than falling open.
    const token = await riseDeckToken()
    if (token && req.cookies.get(RISE_DECK_COOKIE)?.value === token) {
      return NextResponse.next()
    }
    return unlock(req, "/rise-design-01/unlock")
  }

  if (req.nextUrl.pathname.startsWith(VAI_MESSAGE_HOUSE_PATH)) {
    // Same fail-closed shape, its own passphrase: VAI_MESSAGE_HOUSE_PASSWORD.
    const token = await vaiMessageHouseToken()
    if (token && req.cookies.get(VAI_MESSAGE_HOUSE_COOKIE)?.value === token) {
      return NextResponse.next()
    }
    return unlock(req, "/vai-message-house/unlock")
  }

  if (req.nextUrl.pathname.startsWith(CHIP_REGISTRY_PATH)) {
    // Same fail-closed shape for the chip registry demo, its own passphrase:
    // CHIP_REGISTRY_PASSWORD. The demo is a client-routed SPA, so this covers
    // its deep links as well as its bundled assets.
    const token = await chipRegistryToken()
    if (token && req.cookies.get(CHIP_REGISTRY_COOKIE)?.value === token) {
      return NextResponse.next()
    }
    return unlock(req, "/chip-registry/unlock")
  }

  if (req.cookies.get(OS_POC_COOKIE)?.value === OS_POC_TOKEN) {
    return NextResponse.next()
  }
  return unlock(req, "/os-poc/unlock")
}

function unlock(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    "/presentations/os-poc",
    "/presentations/os-poc/:path*",
    "/presentations/rise-design-01",
    "/presentations/rise-design-01/:path*",
    "/presentations/vai-message-house",
    "/presentations/vai-message-house/:path*",
    "/demos/chip-registry",
    "/demos/chip-registry/:path*",
  ],
}
