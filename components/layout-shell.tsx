import type React from "react"
import { Header } from "./header"
import { Footer } from "./footer"

interface LayoutShellProps {
  children: React.ReactNode
  noteSlugs?: string[]
}

export function LayoutShell({ children, noteSlugs }: LayoutShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer noteSlugs={noteSlugs} />
    </div>
  )
}
