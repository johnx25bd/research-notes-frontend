"use client"

import { useTheme } from "./theme-provider"
import { Sun, Moon, BookOpen } from "lucide-react"

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const getIcon = () => {
    if (theme === "light") return <Sun className="h-3.5 w-3.5" />
    if (theme === "dark") return <Moon className="h-3.5 w-3.5" />
    return <BookOpen className="h-3.5 w-3.5" />
  }

  const getLabel = () => {
    if (theme === "light") return "Switch to dark mode"
    if (theme === "dark") return "Switch to reading mode"
    return "Switch to light mode"
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}
