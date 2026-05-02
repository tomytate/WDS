"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { navItems, legalItems } from "@/lib/site";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/wongdigitalstore" },
  { label: "Messenger", href: "https://m.me/wongdigitalstore" },
];

const paymentMethods = ["QRPH", "Binance", "Alipay", "Crypto"];

export function Footer() {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <>
      {/* CTA Banner — full-bleed ink block */}
      <section className="ink-block border-t border-[--border]">
        <div className="container-shell py-16 sm:py-24 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[--accent] mb-6">
                / Ready to ship
              </p>
              <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[--text-on-ink] text-balance">
                Pick your products,{" "}
                <span className="text-[--accent]">pay,</span>
                <br className="hidden sm:block" /> get access in hours.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[--text-on-ink] opacity-80">
                QRPH or Binance Pay. No accounts to create, no waiting. Trusted by
                thousands of customers worldwide since 2024.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <Link
                href="/order"
                className="group inline-flex h-12 items-center justify-between gap-3 rounded-[--radius-inner] border border-[--accent] bg-[--accent] px-6 text-sm font-semibold text-[--accent-fg] transition-colors hover:bg-[--accent-hover] hover:border-[--accent-hover] w-full lg:w-auto"
              >
                Start your order
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/track"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--text-on-ink)_24%,transparent)] bg-transparent px-6 text-sm font-medium text-[--text-on-ink] transition-colors hover:bg-[color-mix(in_srgb,var(--text-on-ink)_8%,transparent)] w-full lg:w-auto"
              >
                Track existing order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer ref={sectionRef} className="reveal border-t border-[--border]">
        <div className="container-shell py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Brand block */}
            <div className="lg:col-span-5">
              <Link href="/" aria-label="Wong Digital — Home" className="inline-block">
                <Image
                  src="/wong-logo-light.png"
                  alt=""
                  width={160}
                  height={48}
                  className="h-8 w-auto object-contain light-only"
                />
                <Image
                  src="/wong-logo-dark.png"
                  alt=""
                  width={160}
                  height={48}
                  className="h-8 w-auto object-contain dark-only"
                />
              </Link>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[--text-secondary]">
                Premium digital products and social growth services, delivered fast
                and verified. Operating worldwide since 2024.
              </p>

              {/* Payment methods strip */}
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted] mr-1">
                  Payments
                </span>
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-2.5 py-1 font-mono text-[11px] font-semibold text-[--text-primary]"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--text-muted] mb-4">
                  Browse
                </p>
                <ul className="space-y-2.5">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-[--text-primary] transition-colors hover:text-[--accent-strong]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--text-muted] mb-4">
                  Legal
                </p>
                <ul className="space-y-2.5">
                  {legalItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-[--text-primary] transition-colors hover:text-[--accent-strong]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--text-muted] mb-4">
                  Connect
                </p>
                <ul className="space-y-2.5">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[--text-primary] transition-colors hover:text-[--accent-strong]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="mt-14 pt-6 border-t border-[--border] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[--text-muted]">
              © {new Date().getFullYear()} Wong Digital Shop · Worldwide delivery
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[--text-muted]">
              v04 / Citrus Edition
            </p>
          </div>
        </div>
      </footer>

      {/* Safe area spacer for mobile bottom nav */}
      <div className="h-20 md:h-0" />
    </>
  );
}
