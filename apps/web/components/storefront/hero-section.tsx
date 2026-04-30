"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonStyles, Card } from "@wongdigital/ui";
import { ProductLogo } from "@/components/product-logo";
import { useMagnetic } from "@/hooks/use-magnetic";

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
  { label: "Instant delivery" },
  { label: "Global payments" },
  { label: "240k+ orders" },
  { label: "Since 2024" },
];

export function HeroSection() {
  const { ref: ctaRef, handlers: ctaHandlers } =
    useMagnetic<HTMLAnchorElement>();

  return (
    <section className="relative overflow-hidden">
      {/* Soft mesh background — muted for a cleaner surface */}
      <div className="mesh-bg absolute inset-0 opacity-70" aria-hidden="true" />

      {/* Dot grid overlay */}
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_30%,#000_40%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Single accent orb, subtle */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[520px] w-[720px] rounded-full bg-[--accent-tint-soft] blur-[110px]" />
      </div>

      <div className="container-shell relative flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center pt-10 pb-14 text-center sm:pt-24 sm:pb-20 lg:pt-32">
        {/* Status pill */}
        <div className="animate-fade-in-up-sm mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_60%,transparent)] px-3.5 py-1.5 text-[11px] font-medium text-[--text-secondary] backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--color-success] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[--color-success]" />
            </span>
            <span>Fulfilling orders worldwide</span>
          </div>
        </div>

        {/* Headline — solid accent, no gradient */}
        <h1
          className="animate-fade-in-up max-w-4xl font-display text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary]"
          style={
            {
              textWrap: "balance",
              animationDelay: "80ms",
            } as React.CSSProperties
          }
        >
          Premium digital tools,{" "}
          <span className="text-[--accent]">delivered fast.</span>
        </h1>

        {/* Subtitle — concrete, not superlative */}
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[--text-secondary] sm:text-lg sm:leading-8"
          style={{ animationDelay: "160ms" } as React.CSSProperties}
        >
          AI subscriptions, entertainment, and social growth — paid securely from anywhere in the world, delivered to your inbox in hours.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            ref={ctaRef}
            {...ctaHandlers}
            className={buttonStyles({
              className:
                "group h-12 w-full justify-center gap-2 rounded-full px-7 text-sm font-semibold sm:w-auto",
              size: "lg",
            })}
            href="/order"
          >
            Start your order
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            className={buttonStyles({
              className: "h-12 w-full justify-center rounded-full sm:w-auto",
              size: "lg",
              variant: "ghost",
            })}
            href="/#products"
          >
            Browse catalog
          </Link>
        </div>

        {/* Stats strip — thin, muted */}
        <div
          className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] text-[--text-muted]"
          style={{ animationDelay: "320ms" }}
        >
          {stats.map((stat, i) => (
            <span key={stat.label} className="inline-flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-[--border]">·</span>
              )}
              {stat.label}
            </span>
          ))}
        </div>

        {/* Brand marquee — grounded below the fold */}
        <div
          className="animate-fade-in-up mt-14 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-3 hover:[animation-play-state:paused]">
            {[...featuredBrands, ...featuredBrands, ...featuredBrands].map(
              (brand, i) => (
                <Card
                  variant="glass"
                  className="flex h-11 w-11 shrink-0 items-center justify-center !rounded-xl transition-colors duration-200 hover:border-[--accent-border]"
                  key={`${brand.name}-${i}`}
                  title={brand.name}
                >
                  <ProductLogo
                    className="shrink-0"
                    iconUrl={brand.iconUrl}
                    name={brand.name}
                    size="sm"
                  />
                </Card>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}