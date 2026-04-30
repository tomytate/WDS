import Link from "next/link";

import {
  Card,
  CardContent,
  SectionHeading,
  buttonStyles,
} from "@wongdigital/ui";

import type { LegalDocument } from "@/lib/legal";
import { legalItems } from "@/lib/site";

import { Footer } from "./footer";
import { Navbar } from "./navbar";

type LegalDocumentPageProps = {
  document: LegalDocument;
};

export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  return (
    <main>
      <Navbar />
      <section className="container-shell py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_0.28fr]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Legal"
              title={document.title}
              description={document.summary}
            />

            <Card className="mesh-panel">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[--accent] bg-[--accent-tint-soft] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[--accent]">
                    Effective {document.effectiveDate}
                  </span>
                  <span className="rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[--text-secondary]">
                    Wong Digital Shop
                  </span>
                </div>

                {document.notice ? (
                  <div className="rounded-2xl border border-[--accent] bg-[--accent-tint-soft] p-5">
                    <p className="text-sm leading-7 text-[--text-primary]">
                      {document.notice}
                    </p>
                  </div>
                ) : null}

                {document.intro?.map((paragraph) => (
                  <p
                    className="text-sm leading-7 text-[--text-secondary] sm:text-base"
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-5">
              {document.sections.map((section, index) => (
                <Card key={`${document.slug}-${section.title}`}>
                  <CardContent className="space-y-4 p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[--accent] bg-[--accent-tint-soft] text-sm font-semibold text-[--accent]">
                        {index + 1}
                      </div>
                      <div className="space-y-4">
                        <h2 className="font-display text-3xl leading-tight tracking-tight">
                          {section.title}
                        </h2>

                        {section.paragraphs?.map((paragraph) => (
                          <p
                            className="text-sm leading-7 text-[--text-secondary] sm:text-base"
                            key={paragraph}
                          >
                            {paragraph}
                          </p>
                        ))}

                        {section.bullets ? (
                          <ul className="space-y-3">
                            {section.bullets.map((bullet) => (
                              <li
                                className="flex items-start gap-3"
                                key={bullet}
                              >
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[--accent]" />
                                <span className="text-sm leading-7 text-[--text-secondary] sm:text-base">
                                  {bullet}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {document.closing ? (
              <Card>
                <CardContent className="space-y-4 p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.24em] text-[--text-secondary]">
                    Final Note
                  </p>
                  {document.closing.map((paragraph) => (
                    <p
                      className="text-sm leading-7 text-[--text-secondary] sm:text-base"
                      key={paragraph}
                    >
                      {paragraph}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[--text-secondary]">
                  Legal Documents
                </p>
                <div className="space-y-3">
                  {legalItems
                    .filter((item) => item.href !== "/legal")
                    .map((item) => (
                      <Link
                        className={`block rounded-xl border px-4 py-3 text-sm transition-colors ${
                          item.href === `/legal/${document.slug}`
                            ? "border-[--accent] bg-[--accent-tint-soft] text-[--accent]"
                            : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary]"
                        }`}
                        href={item.href}
                        key={item.href}
                      >
                        {item.label}
                      </Link>
                    ))}
                </div>
                <Link
                  className={buttonStyles({
                    className: "w-full justify-center",
                    variant: "ghost",
                  })}
                  href="/legal"
                >
                  Back to Legal Hub
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
