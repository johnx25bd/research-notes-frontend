"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme, type ThemeProviderProps } from "next-themes"

export type Theme = "light" | "dark" | "reading"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark", "reading"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const { theme, setTheme } = useNextTheme()

  const cycleTheme = React.useCallback(() => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("reading")
    else setTheme("light")
  }, [theme, setTheme])

  return {
    theme: theme as Theme,
    setTheme,
    cycleTheme,
  }
}
