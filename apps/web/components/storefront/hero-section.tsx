"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { buttonStyles } from "@wongdigital/ui";
import { ProductLogo } from "@/components/product-logo";

const featuredBrands = [
  { name: "ChatGPT Pro", iconUrl: "/logos/chatgpt.png" },
  { name: "Canva Pro", iconUrl: "/logos/canva.svg" },
  { name: "Spotify Premium", iconUrl: "/logos/spotify.png" },
  { name: "Claude AI", iconUrl: "/logos/anthropic.svg" },
  { name: "Netflix UHD", iconUrl: "/logos/netflix.svg" },
  { name: "Capcut Pro", iconUrl: "/logos/capcut.svg" },
  { name: "Grammarly", iconUrl: "/logos/grammarly.png" },
  { name: "Microsoft 365", iconUrl: "/logos/microsoft365.ico" },
  { name: "Perplexity", iconUrl: "/logos/perplexity.svg" },
  { name: "Figma", iconUrl: "/logos/figma.svg" },
  { name: "ExpressVPN", iconUrl: "/logos/expressvpn.svg" },
  { name: "YouTube", iconUrl: "/logos/youtube.svg" },
  { name: "TikTok", iconUrl: "/logos/tiktok.svg" },
  { name: "Instagram", iconUrl: "/logos/instagram.svg" },
  { name: "Facebook", iconUrl: "/logos/facebook.svg" },
  { name: "Twitter / X", iconUrl: "/logos/x.svg" },
  { name: "Telegram", iconUrl: "/logos/telegram.svg" },
];

const stats = [
  { value: "240K+", label: "Orders fulfilled" },
  { value: "2–6h", label: "Avg delivery" },
  { value: "100+", label: "Products" },
  { value: "4.9★", label: "Customer rating" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[--border]">
      {/* Editorial grid wash */}
      <div
        className="editorial-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_30%,transparent_90%)]"
        aria-hidden="true"
      />

      <div className="container-shell relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-32">
        {/* Top meta row — issue / status / date */}
        <div
          className="animate-fade-in-up-sm mb-12 flex items-center justify-between gap-3 border-b border-[--border] pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-muted]"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--color-success] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[--color-success]" />
            </span>
            <span className="text-[--text-secondary]">Live · Fulfilling worldwide</span>
          </span>
          <span className="hidden sm:inline">Vol.04 / Citrus Edition</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        {/* Main headline grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h1
              className="animate-fade-in-up font-display text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-[--text-primary]"
              style={{ animationDelay: "60ms" } as React.CSSProperties}
            >
              Premium digital
              <br />
              tools, delivered{" "}
              <span className="relative inline-block">
                <span className="marker-stroke">in hours.</span>
              </span>
            </h1>

            <p
              className="animate-fade-in-up mt-8 max-w-xl text-[17px] leading-relaxed text-[--text-secondary] sm:text-lg sm:leading-8"
              style={{ animationDelay: "140ms" } as React.CSSProperties}
            >
              AI subscriptions, streaming, design suites, and social growth — paid
              securely from anywhere in the world, delivered to your inbox while
              you wait.
            </p>

            <div
              className="animate-fade-in-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "220ms" }}
            >
              <Link
                className={buttonStyles({
                  className:
                    "group h-12 w-full justify-center gap-2 px-6 sm:w-auto",
                  size: "lg",
                })}
                href="/order"
              >
                Start your order
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                className={buttonStyles({
                  className: "h-12 w-full justify-center sm:w-auto",
                  size: "lg",
                  variant: "ghost",
                })}
                href="/#products"
              >
                Browse catalog
              </Link>
              <span className="hidden lg:flex items-center gap-2 ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-muted]">
                <Zap size={12} className="text-[--accent-strong]" />
                No account required
              </span>
            </div>
          </div>

          {/* Stats panel — flat ink-bordered table */}
          <div
            className="animate-fade-in-up lg:col-span-4 lg:pt-2"
            style={{ animationDelay: "320ms" }}
          >
            <div className="border border-[--border] bg-[--bg-card] rounded-[--radius-card]">
              <div className="border-b border-[--border] px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--text-muted]">
                  Index
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--accent-strong]">
                  Live
                </span>
              </div>
              <dl className="divide-y divide-[--border]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-baseline justify-between px-5 py-3"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[--text-muted]">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Brand strip — full-bleed inverted ink block */}
      <div className="ink-block border-t border-[--border]">
        <div className="container-shell py-5">
          <div className="flex items-center gap-6">
            <span className="hidden md:flex items-center gap-2 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-[--text-on-ink] opacity-70">
              <span className="h-px w-6 bg-[--accent]" />
              Catalog
            </span>
            <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex w-max marquee-track items-center gap-3">
                {[...featuredBrands, ...featuredBrands, ...featuredBrands].map(
                  (brand, i) => (
                    <div
                      key={`${brand.name}-${i}`}
                      title={brand.name}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] bg-[color-mix(in_srgb,var(--text-on-ink)_8%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                    >
                      <ProductLogo
                        className="shrink-0"
                        iconUrl={brand.iconUrl}
                        name={brand.name}
                        size="sm"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
