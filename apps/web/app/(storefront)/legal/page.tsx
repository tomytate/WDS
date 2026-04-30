import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent, SectionHeading, buttonStyles } from "@wongdigital/ui"

import { Footer } from "@/components/storefront/footer"
import { Navbar } from "@/components/storefront/navbar"
import { legalDocuments } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Review the legal policies for Wong Digital Shop, including terms, refunds, privacy, and disclaimer notices.",
}

export default function LegalHubPage() {
  return (
    <main>
      <Navbar />
      <section className="container-shell py-10 sm:py-14">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Legal"
            title="Policies that support a clear, credible buying experience."
            description="Review the legal terms that apply to Wong Digital Shop orders, support requests, privacy, and third-party platform disclaimers."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {legalDocuments.map((document) => (
              <Card key={document.slug}>
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[--text-secondary]">
                      Effective {document.effectiveDate}
                    </p>
                    <h2 className="font-display text-3xl tracking-tight">{document.title}</h2>
                    <p className="text-sm leading-7 text-[--text-secondary]">
                      {document.summary}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <Link
                      className={buttonStyles({ className: "w-full justify-center" })}
                      href={`/legal/${document.slug}`}
                    >
                      Read Document
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
