"use client"

import {
  ClipboardList,
  LayoutGrid,
  Library,
  MessageCircle,
  Package,
  Settings,
  Star,
  Users,
  Tag,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

import { DashboardSignOutButton } from "@/components/auth/dashboard-sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { handlingHoursLabel } from "@/lib/urgency"

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/bundles", label: "Bundles", icon: Library },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/promos", label: "Promos", icon: Tag },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/support", label: "Support", icon: MessageCircle },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-[--border] bg-[--bg-surface]">
          <div className="flex items-center justify-between border-b border-[--border] px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] font-mono text-xs font-bold text-[--bg-base]"
              >
                WD
              </span>
              <div>
                <p className="font-display text-sm font-semibold leading-tight tracking-tight">
                  Wong Digital
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  Admin / v04
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          <div className="px-3 py-4">
            <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Navigation
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-[--radius-inner] px-3 py-2 text-[13px] font-medium tracking-tight transition-colors duration-150 ${
                      active
                        ? "bg-[--text-primary] text-[--bg-base]"
                        : "text-[--text-secondary] hover:bg-[--bg-card] hover:text-[--text-primary]"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon size={15} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom session card */}
          <div className="mt-auto border-t border-[--border] p-4">
            <div className="rounded-[--radius-inner] border border-[--border] bg-[--bg-card] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Session
              </p>
              {adminEmail ? (
                <p className="mt-2 text-[12px] break-all text-[--text-primary]">
                  {adminEmail}
                </p>
              ) : null}
              <p className="mt-1 text-[12px] text-[--text-secondary]">
                Handling · {handlingHoursLabel}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px]">
                <Link
                  className="inline-flex items-center gap-1 font-medium text-[--text-primary] transition-colors hover:text-[--accent-strong]"
                  href="/"
                >
                  View storefront ↗
                </Link>
                {!developmentAccess ? <DashboardSignOutButton /> : null}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col min-h-screen">
          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-40 border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-base)_92%,transparent)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] font-mono text-[10px] font-bold text-[--bg-base]"
                >
                  WD
                </span>
                <span className="font-display text-sm font-semibold tracking-tight">
                  Admin
                </span>
              </Link>
              <ThemeToggle />
            </div>
            <MobileNavPills items={items} pathname={pathname} />
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
            {developmentAccess ? (
              <div className="mb-6 rounded-[--radius-inner] border border-[--text-primary] bg-[--accent] px-4 py-3 text-sm font-medium text-[--accent-fg]">
                Dev mode — dashboard is unlocked. Configure Supabase admin auth before deploying.
              </div>
            ) : null}

            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutGrid
}

function MobileNavPills({
  items,
  pathname,
}: {
  items: NavItem[]
  pathname: string
}) {
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const index = items.findIndex((i) => isActive(pathname, i.href))
    if (index < 0) return
    const el = linkRefs.current[index]
    el?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: "smooth",
    })
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
        target.scrollIntoView({
          inline: "nearest",
          block: "nearest",
          behavior: "smooth",
        })
      }
    },
    [items.length],
  )

  return (
    <div className="border-t border-[--border]">
      <div
        role="tablist"
        aria-label="Dashboard navigation"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto"
      >
        {items.map((item, i) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              ref={(node) => {
                linkRefs.current[i] = node
              }}
              aria-current={active ? "page" : undefined}
              role="tab"
              tabIndex={active ? 0 : -1}
              className={`inline-flex shrink-0 items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] whitespace-nowrap border-r border-[--border] last:border-r-0 transition-colors ${
                active
                  ? "bg-[--text-primary] text-[--bg-base]"
                  : "text-[--text-secondary] hover:text-[--text-primary]"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={13} strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
