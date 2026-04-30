"use client";

import {
  Home,
  Package,
  ClipboardList,
  User,
  Search,
  LogOut,
  Wallet,
  ShoppingBag,
  ChevronDown,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { navItems } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { hasSupabaseEnvConfig } from "@/utils/supabase/shared";

/* ─── Mobile Tab Config ─── */
const mobileTabItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/order", icon: Package },
  { label: "Track", href: "/track", icon: ClipboardList },
  { label: "Account", href: "/account", icon: User },
];

type NavbarProps = {
  cartHref?: string;
};

type UserState = {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  walletBalance?: string;
} | null;

export function Navbar({ cartHref: _cartHref }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [userState, setUserState] = useState<UserState>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch auth state on mount
  useEffect(() => {
    if (!hasSupabaseEnvConfig()) return;

    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserState({ isAuthenticated: false });
          return;
        }

        // Fetch customer profile for wallet balance
        const { data: customer } = await supabase
          .from("customers")
          .select("name, wallet_balance")
          .eq("user_id", user.id)
          .maybeSingle();

        setUserState({
          isAuthenticated: true,
          email: user.email,
          name:
            customer?.name ??
            user.user_metadata?.full_name ??
            user.email?.split("@")[0] ??
            "User",
          walletBalance: customer?.wallet_balance
            ? String(customer.wallet_balance)
            : "0.00",
        });
      } catch {
        setUserState({ isAuthenticated: false });
      }
    }

    checkAuth();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserState({ isAuthenticated: false });
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  const avatarInitial =
    userState?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      {/* ─── Desktop Floating Pill ─── */}
      <nav
        aria-label="Main navigation"
        className={`sticky top-4 z-50 mx-auto hidden w-fit md:flex items-center gap-0.5 rounded-full border px-1.5 transition-[background-color,border-color,box-shadow,padding,margin] duration-300 ease-out ${
          scrolled
            ? "border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-base)_82%,transparent)] shadow-[--shadow-md] backdrop-blur-2xl py-1 mt-2"
            : "border-[color-mix(in_srgb,var(--border)_40%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_55%,transparent)] shadow-[--shadow-xs] backdrop-blur-xl py-1.5 mt-4"
        }`}
      >
        {/* Nav Links */}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[--accent]"
                  : "text-[--text-secondary] hover:text-[--text-primary]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div
          className="mx-1.5 h-6 w-px bg-[color-mix(in_srgb,var(--border)_50%,transparent)]"
          aria-hidden="true"
        />

        {/* ⌘K hint */}
        <button
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-[--text-muted] transition-colors hover:text-[--text-secondary] hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
            );
          }}
          type="button"
          aria-label="Search"
        >
          <Search size={14} />
          <kbd className="hidden rounded border border-[--border] bg-[--bg-surface] px-1.5 py-0.5 text-[10px] font-mono text-[--text-muted] lg:inline">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Auth Section */}
        {userState?.isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-1.5 rounded-full px-2 py-1 transition-all hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              aria-label="Account menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--accent] text-xs font-bold text-[--accent-fg]">
                {avatarInitial}
              </div>
              <ChevronDown
                size={12}
                className={`text-[--text-muted] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_75%,transparent)] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 z-50">
                {/* User Info */}
                <div className="px-3 py-2.5 border-b border-[--border] mb-1">
                  <p className="text-sm font-medium text-[--text-primary] truncate">
                    {userState.name}
                  </p>
                  <p className="text-xs text-[--text-muted] truncate">
                    {userState.email}
                  </p>
                </div>

                <Link
                  href="/account"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={14} className="text-[--text-muted]" />
                  My Account
                </Link>

                <Link
                  href="/account/wallet"
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet size={14} className="text-[--text-muted]" />
                    Wallet
                  </span>
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-xs font-semibold text-[--accent]">
                    ₱ {Number(userState.walletBalance ?? 0).toFixed(2)}
                  </span>
                </Link>

                <Link
                  href="/account/orders"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <ShoppingBag size={14} className="text-[--text-muted]" />
                  My Orders
                </Link>

                <div className="my-1 h-px bg-[--border]" />

                <button
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[--color-danger] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                  onClick={handleSignOut}
                  type="button"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : userState !== null ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-[--text-secondary] transition-colors hover:text-[--accent] hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
          >
            <LogIn size={14} />
            Sign In
          </Link>
        ) : null}
      </nav>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-50 flex md:hidden items-stretch justify-around border-t bg-[color-mix(in_srgb,var(--bg-base)_85%,transparent)] backdrop-blur-2xl px-2"
        style={{
          height: "calc(64px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {mobileTabItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          // For the Account tab, redirect to /login if not authenticated
          const href =
            item.href === "/account" && userState && !userState.isAuthenticated
              ? "/login"
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-[--accent]" : "text-[--text-muted]"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Theme toggle tab */}
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-[--text-muted]">
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}
