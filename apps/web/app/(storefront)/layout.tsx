import { SpeedInsights } from "@vercel/speed-insights/next"
import type { ReactNode } from "react"

import { ChatWidget } from "@/components/storefront/chat-widget"
import { ScrollToTop } from "@/components/storefront/scroll-to-top"

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[--bg-surface] focus:px-4 focus:py-2 focus:text-[--text-primary] focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[--accent]">
        Skip to main content
      </a>
      {children}
      <ScrollToTop />
      <ChatWidget />
      <SpeedInsights />
    </>
  )
}
