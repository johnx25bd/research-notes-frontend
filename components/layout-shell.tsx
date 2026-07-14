import type React from "react"
import { Header } from "./header"
import { Footer } from "./footer"

interface LayoutShellProps {
  children: React.ReactNode
  noteSlugs?: string[]
  /** Widen the header and footer containers to match wide-layout pages
      (e.g. /research). Default keeps the site's narrow reading column. */
  wide?: boolean
}

export function LayoutShell({ children, noteSlugs, wide = false }: LayoutShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header wide={wide} />
      <main className="flex-1">{children}</main>
      <Footer noteSlugs={noteSlugs} wide={wide} />
    </div>
  )
}
