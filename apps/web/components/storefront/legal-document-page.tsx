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
              as="h1"
            />

            <Card>
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[--bg-base]">
                    Effective {document.effectiveDate}
                  </span>
                  <span className="rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-secondary]">
                    Wong Digital Shop
                  </span>
                </div>

                {document.notice ? (
                  <div className="rounded-[--radius-inner] border-l-2 border-[--accent] bg-[--bg-surface] px-4 py-3">
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
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-base] font-mono text-xs font-semibold text-[--text-primary]">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-4">
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
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
                          <ul className="space-y-2.5">
                            {section.bullets.map((bullet) => (
                              <li
                                className="flex items-start gap-3"
                                key={bullet}
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[--accent]" />
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
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                    / Final note
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
              <CardContent className="space-y-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  / Legal documents
                </p>
                <div className="space-y-1.5">
                  {legalItems
                    .filter((item) => item.href !== "/legal")
                    .map((item) => (
                      <Link
                        className={`block rounded-[--radius-inner] border px-3 py-2.5 text-sm transition-colors ${
                          item.href === `/legal/${document.slug}`
                            ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                            : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
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
                    className: "w-full justify-center mt-2",
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
