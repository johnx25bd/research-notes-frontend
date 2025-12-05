"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/", label: "Garden" },
  { href: "/notes", label: "Map" },
  { href: "/about", label: "About" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-sans text-xl text-foreground hover:text-primary transition-colors">
            Garden
          </Link>

          <nav className="flex items-center gap-6" style={{ fontFamily: "var(--font-ui)" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
