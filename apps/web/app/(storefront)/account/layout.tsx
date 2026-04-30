import type { ReactNode } from "react"

import { Navbar } from "@/components/storefront/navbar"
import { Footer } from "@/components/storefront/footer"
import { requireCustomer } from "@/lib/customer-auth"

export const dynamic = "force-dynamic"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  // Redirects to /login if unauthenticated
  await requireCustomer()

  return (
    <main>
      <Navbar />
      <section className="relative min-h-[80vh]">
        {/* Atmospheric mesh gradient */}
        <div className="mesh-bg absolute inset-0 -z-10" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[--accent-tint-soft] blur-[120px]"
          aria-hidden="true"
        />
        <div className="container-shell py-6 sm:py-10 lg:py-14">
          {children}
        </div>
      </section>
      <Footer />
    </main>
  )
}
