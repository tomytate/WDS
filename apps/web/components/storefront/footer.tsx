"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Card } from "@wongdigital/ui";

import { navItems, legalItems } from "@/lib/site";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/wongdigitalstore" },
  { label: "Messenger", href: "https://m.me/wongdigitalstore" },
];

export function Footer() {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <>
      <div className="section-divider container-shell" />

      {/* CTA Banner — single accent, high contrast */}
      <section className="container-shell py-12 sm:py-16">
        <Card
          variant="interactive"
          className="group relative overflow-hidden rounded-3xl border-none bg-[--accent] p-8 sm:p-14 text-center shadow-[--shadow-lg]"
        >
          {/* Soft highlight */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-xl space-y-5">
            <h2
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[--accent-fg]"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Ready to level up?
            </h2>
            <p className="mx-auto max-w-md text-sm sm:text-base leading-relaxed text-[--accent-fg]/85">
              Pick your products, pay with QRPH or Binance Pay, and get access
              within hours. Trusted by thousands of customers worldwide.
            </p>
            <Link
              href="/order"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[--accent-fg] px-7 text-sm font-semibold text-[--accent] shadow-[--shadow-md] transition-all hover:shadow-[--shadow-lg]"
            >
              Start your order
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Card>
      </section>

      <footer ref={sectionRef} className="reveal py-12 sm:py-16 lg:py-20">
        <div className="container-shell">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo */}
            <Image
              src="/wong-logo-light.png"
              alt="Wong Digital"
              width={180}
              height={60}
              className="h-14 w-auto object-contain light-only"
            />
            <Image
              src="/wong-logo-dark.png"
              alt="Wong Digital"
              width={180}
              height={60}
              className="h-14 w-auto object-contain dark-only"
            />

            {/* Nav links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {navItems.map((item, i) => (
                <span key={item.href} className="flex items-center gap-5">
                  {i > 0 && (
                    <span
                      className="text-[--border] text-xs"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[--text-secondary] transition-colors hover:text-[--accent]"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </nav>

            {/* Social / support links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-4 py-2 text-xs font-medium text-[--text-secondary] transition-all hover:border-[--accent] hover:text-[--accent] backdrop-blur-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Tagline */}
            <p className="text-sm text-[--text-muted]">
              QRPH · Binance · Alipay · Within 24h · Worldwide
            </p>

            {/* Legal */}
            <div className="flex flex-col items-center gap-2 text-xs text-[--text-muted]">
              <p>© {new Date().getFullYear()} Wong Digital Shop</p>
              <div className="flex items-center gap-3">
                {legalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-[--text-secondary]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Safe area spacer for mobile bottom nav */}
      <div className="h-20 md:h-0" />
    </>
  );
}
