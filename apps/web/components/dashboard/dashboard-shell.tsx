"use client"

import { ClipboardList, LayoutGrid, Library, MessageCircle, Package, Settings, Star, Users, Tag, Wallet } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { DashboardSignOutButton } from "@/components/auth/dashboard-sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { handlingHoursLabel } from "@/lib/urgency"

const items = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutGrid size={16} />,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: <ClipboardList size={16} />,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: <Package size={16} />,
  },
  {
    href: "/dashboard/bundles",
    label: "Bundles",
    icon: <Library size={16} />,
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: <Users size={16} />,
  },
  {
    href: "/dashboard/promos",
    label: "Promos",
    icon: <Tag size={16} />,
  },
  {
    href: "/dashboard/wallet",
    label: "Wallet",
    icon: <Wallet size={16} />,
  },
  {
    href: "/dashboard/support",
    label: "Support",
    icon: <MessageCircle size={16} />,
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    icon: <Star size={16} />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings size={16} />,
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardShell({
  adminEmail,
  children,
  developmentAccess = false,
}: {
  adminEmail?: string | null
  children: ReactNode
  developmentAccess?: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[--bg-base]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {developmentAccess ? (
          <div className="mb-6 rounded-2xl border border-[--accent-border] bg-[--accent-tint-soft] px-4 py-3 text-sm text-[--text-primary]">
            Dev mode — dashboard is unlocked. Configure Supabase admin auth before deploying.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="surface-panel rounded-2xl border border-[--border] p-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[--accent-border] bg-[color-mix(in_srgb,var(--bg-card)_96%,transparent)] font-display text-[13px] font-semibold tracking-tight text-[--accent]">
                    WD
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold leading-tight tracking-tight">Wong Digital</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[--text-muted]">Dashboard</p>
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div className="mb-2 hidden lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Navigation</p>
            </div>

            <nav className="hidden gap-0.5 lg:grid" aria-label="Dashboard">
              {items.map((item) => {
                const active = isActive(pathname, item.href)

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                      active
                        ? "text-[--accent-strong]"
                        : "text-[--text-secondary] hover:bg-[--bg-surface] hover:text-[--text-primary]"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[--accent]"
                      />
                    ) : null}
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <MobileNavPills items={items} pathname={pathname} />

            <div className="mt-6 rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_88%,transparent)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                Session
              </p>
              {adminEmail ? (
                <p className="mt-2 text-[13px] break-all text-[--text-primary]">{adminEmail}</p>
              ) : null}
              <p className="mt-1 text-[13px] text-[--text-secondary]">
                Handling time · {handlingHoursLabel}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
                <Link
                  className="inline-flex items-center gap-1 text-[--accent-strong] transition-colors hover:underline"
                  href="/"
                >
                  View storefront
                  <span aria-hidden="true">↗</span>
                </Link>
                {!developmentAccess ? <DashboardSignOutButton /> : null}
              </div>
            </div>
          </aside>

          <main className="surface-panel rounded-2xl sm:rounded-2xl lg:rounded-2xl border border-[--border] p-5 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile horizontal nav — addresses:
 *   - WCAG 2.4.11 Focus Not Obscured (Minimum) — `scroll-margin-inline-end` + narrower fade so the
 *     active/focused pill is never clipped by the decorative gradient overlay.
 *   - WCAG 2.1.1 Keyboard — ArrowLeft / ArrowRight / Home / End move focus inside the tablist.
 *   - WCAG 2.4.3 Focus Order — `scrollIntoView` on route change keeps the active pill visible.
 */
type NavItem = { href: string; label: string; icon: ReactNode }

function MobileNavPills({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const index = items.findIndex((i) => isActive(pathname, i.href))
    if (index < 0) return
    const el = linkRefs.current[index]
    el?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" })
  }, [pathname, items])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const activeEl = document.activeElement as HTMLElement | null
      const idx = linkRefs.current.findIndex((r) => r === activeEl)
      if (idx < 0) return
      let next: number
      if (e.key === "ArrowRight") next = Math.min(idx + 1, items.length - 1)
      else if (e.key === "ArrowLeft") next = Math.max(idx - 1, 0)
      else if (e.key === "Home") next = 0
      else if (e.key === "End") next = items.length - 1
      else return
      e.preventDefault()
      const target = linkRefs.current[next]
      if (target) {
        target.focus()
        target.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" })
      }
    },
    [items.length],
  )

  return (
    <div className="grid gap-3 lg:hidden">
      <p className="text-xs uppercase tracking-[0.24em] text-[--text-secondary]" id="mobile-nav-label">
        Navigation
      </p>
      <div className="relative">
        <div
          role="tablist"
          aria-labelledby="mobile-nav-label"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="flex gap-2 overflow-x-auto pb-1 pr-6"
        >
          {items.map((item, i) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                ref={(node) => {
                  linkRefs.current[i] = node
                }}
                aria-current={active ? "page" : undefined}
                role="tab"
                tabIndex={active ? 0 : -1}
                className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 [scroll-margin-inline-end:3rem] [scroll-margin-inline-start:0.5rem] ${
                  active
                    ? "bg-[--accent] text-[--accent-fg]"
                    : "border border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary]"
                }`}
                href={item.href}
                key={item.href}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </Link>
            )
          })}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-[--bg-base] to-transparent"
        />
      </div>
    </div>
  )
}
