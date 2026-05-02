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
        <div className="editorial-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_30%,transparent_90%)]" aria-hidden="true" />
        <div className="container-shell py-6 sm:py-10 lg:py-14">
          {children}
        </div>
      </section>
      <Footer />
    </main>
  )
}
