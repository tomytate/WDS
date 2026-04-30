import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"

import { siteConfig } from "@/lib/site"
import { MetaPixel } from "@/components/marketing/meta-pixel"
import { GoogleAnalytics } from "@/components/marketing/google-analytics"

import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "digital products",
    "premium subscriptions",
    "social media boosting",
    "Wong Digital Shop",
    "wongdigital.shop",
    "worldwide delivery",
    "QRPH",
    "Binance Pay",
    "Alipay",
    "ChatGPT Pro",
    "Canva Pro",
    "Spotify Premium",
    "digital shop Philippines",
    "online shop Philippines",
    "trusted digital seller PH",
  ],
  authors: [{ name: "Wong Digital Shop", url: siteConfig.url }],
  creator: "Wong Digital Shop",
  publisher: "Wong Digital Shop",
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Scroll progress bar — pure CSS, zero JS */}
        <div className="scroll-progress" aria-hidden="true" />
        {children}
        <Analytics />
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
