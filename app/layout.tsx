import type React from "react"
import type { Metadata } from "next"
import { Lora, Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://johnx.co'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "johnx — Research Notes",
    template: "%s | johnx",
  },
  description: "A digital garden of research notes, ideas, and explorations. Notes that grow and evolve over time.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'johnx Research Notes',
    title: 'johnx — Research Notes',
    description: 'A digital garden of research notes, ideas, and explorations',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'johnx Research Notes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'johnx — Research Notes',
    description: 'A digital garden of research notes, ideas, and explorations',
    images: [`${siteUrl}/og-image.png`],
    creator: '@x25bd',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
