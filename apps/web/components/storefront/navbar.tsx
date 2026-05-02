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
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { navItems } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { hasSupabaseEnvConfig } from "@/utils/supabase/shared";

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
      setScrolled(window.scrollY > 16);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const avatarInitial = userState?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      {/* ─── Desktop Editorial Bar ─── */}
      <header
        aria-label="Main navigation"
        className={`sticky top-0 z-50 hidden md:block transition-[background-color,border-color,backdrop-filter] duration-200 ${
          scrolled
            ? "border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-base)_88%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-shell flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2"
            aria-label="Wong Digital — Home"
          >
            <Image
              src="/wong-logo-light.png"
              alt=""
              width={140}
              height={40}
              className="h-7 w-auto object-contain light-only"
              priority
            />
            <Image
              src="/wong-logo-dark.png"
              alt=""
              width={140}
              height={40}
              className="h-7 w-auto object-contain dark-only"
              priority
            />
          </Link>

          {/* Center nav */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-3 py-2 text-[13px] font-medium tracking-tight transition-colors ${
                    isActive
                      ? "text-[--text-primary]"
                      : "text-[--text-secondary] hover:text-[--text-primary]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-3 -bottom-px h-px bg-[--text-primary]"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1">
            <button
              className="hidden lg:flex items-center gap-2 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-3 py-1.5 text-xs text-[--text-muted] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                );
              }}
              type="button"
              aria-label="Search"
            >
              <Search size={13} />
              <span>Search</span>
              <kbd className="ml-3 font-mono text-[10px] text-[--text-muted]">
                ⌘K
              </kbd>
            </button>

            <button
              className="flex h-10 w-10 lg:hidden items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                );
              }}
              type="button"
              aria-label="Search"
            >
              <Search size={15} />
            </button>

            <ThemeToggle />

            {userState?.isAuthenticated ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 rounded-[--radius-inner] border border-transparent px-1 py-1 transition-colors hover:border-[--border] hover:bg-[--bg-card]"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  type="button"
                  aria-label="Account menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-[--radius-inner] bg-[--accent] text-xs font-bold text-[--accent-fg]">
                    {avatarInitial}
                  </div>
                  <ChevronDown
                    size={12}
                    className={`text-[--text-muted] transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-1.5 shadow-[--shadow-lg] animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-3 py-2.5 border-b border-[--border] mb-1">
                      <p className="text-sm font-semibold text-[--text-primary] truncate">
                        {userState.name}
                      </p>
                      <p className="text-xs text-[--text-muted] truncate">
                        {userState.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 rounded-[--radius-inner] px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[--bg-surface]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={14} className="text-[--text-muted]" />
                      My Account
                    </Link>

                    <Link
                      href="/account/wallet"
                      className="flex items-center justify-between gap-2 rounded-[--radius-inner] px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[--bg-surface]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2.5">
                        <Wallet size={14} className="text-[--text-muted]" />
                        Wallet
                      </span>
                      <span className="rounded-[--radius-inner] border border-[--border] px-2 py-0.5 font-mono text-xs font-semibold text-[--text-primary]">
                        ₱{Number(userState.walletBalance ?? 0).toFixed(2)}
                      </span>
                    </Link>

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 rounded-[--radius-inner] px-3 py-2.5 text-sm text-[--text-primary] transition-colors hover:bg-[--bg-surface]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShoppingBag size={14} className="text-[--text-muted]" />
                      My Orders
                    </Link>

                    <div className="my-1 h-px bg-[--border]" />

                    <button
                      className="flex w-full items-center gap-2.5 rounded-[--radius-inner] px-3 py-2.5 text-sm text-[--color-danger-text] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
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
                className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] px-4 text-[13px] font-semibold text-[--bg-base] transition-colors hover:bg-[--accent] hover:text-[--accent-fg] hover:border-[--accent]"
              >
                <LogIn size={14} />
                Sign In
              </Link>
            ) : null}
          </div>
        </nav>
      </header>

      {/* ─── Mobile Top Bar ─── */}
      <header
        aria-label="Mobile top navigation"
        className={`sticky top-0 z-50 md:hidden transition-[background-color,border-color] duration-200 ${
          scrolled
            ? "border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-base)_92%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-shell flex h-14 items-center justify-between">
          <Link href="/" aria-label="Wong Digital — Home">
            <Image
              src="/wong-logo-light.png"
              alt=""
              width={120}
              height={36}
              className="h-6 w-auto object-contain light-only"
              priority
            />
            <Image
              src="/wong-logo-dark.png"
              alt=""
              width={120}
              height={36}
              className="h-6 w-auto object-contain dark-only"
              priority
            />
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                );
              }}
              type="button"
              aria-label="Search"
            >
              <Search size={14} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-50 flex md:hidden items-stretch justify-around border-t border-[--border] bg-[color-mix(in_srgb,var(--bg-base)_92%,transparent)] backdrop-blur-xl px-2"
        style={{
          height: "calc(60px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {mobileTabItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          const href =
            item.href === "/account" && userState && !userState.isAuthenticated
              ? "/login"
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-tight transition-colors ${
                isActive ? "text-[--text-primary]" : "text-[--text-muted]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-[--radius-inner] transition-colors ${
                  isActive
                    ? "bg-[--accent] text-[--accent-fg]"
                    : "text-[--text-muted]"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
