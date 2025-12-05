"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/notes", label: "Index" },
  { href: "/about", label: "About" },
]

function GlobalTriangle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      className="text-primary opacity-75"
    >
      <path d="M6 1 L11 10 H1 Z" />
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="relative flex items-center font-sans text-foreground hover:text-primary transition-colors"
          >
            <span className="absolute hidden lg:block" style={{ left: "calc(-1.25rem)" }}>
              <GlobalTriangle />
            </span>
            <span className="lg:hidden mr-1.5">
              <GlobalTriangle />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold leading-5">Research Notes</span>
          </Link>

          <nav className="flex items-center gap-6 leading-5" style={{ fontFamily: "var(--font-ui)" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground tracking-[0.02em]",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
        <div className="relative hidden lg:block" style={{ marginLeft: "calc(-1.25rem + 6px)" }}>
          <div
            className="h-px"
            style={{
              background: "var(--header-border)",
            }}
          />
          <div
            className="absolute left-0 top-0 w-px"
            style={{
              height: "6px",
              background: "var(--header-tick)",
            }}
          />
        </div>
        <div
          className="h-px w-full lg:hidden"
          style={{
            background: "var(--header-border)",
          }}
        />
      </div>
    </header>
  )
}
