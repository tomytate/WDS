---
description: Project architecture, conventions, component inventory, and development workflows for the Wong Digital Shop
---

# Wong Digital Shop — Project Reference

## Tech Stack
| Layer | Technology | Version | Latest |
|---|---|---|---|
| Framework | Next.js | 16.2.3 | ✅ |
| UI Library | React | 19.2.5 | ✅ |
| Language | TypeScript | 6.0.2 | ✅ |
| Styling | Tailwind CSS | 4.2.2 | ✅ |
| Components | shadcn/ui | latest | ✅ |
| Validation | Zod | 4.3.6 | ✅ |
| ORM | Drizzle | 0.45.2 | ✅ |
| Database | PostgreSQL (Supabase) | 17.9 | ✅ |
| Auth | Supabase Auth | @supabase/ssr 0.10 | ✅ |
| Forms | react-hook-form | 7.54.2 | ✅ |
| Animation | Motion (`motion/react`) | 12.38.0 | ✅ |
| Icons | lucide-react | 1.8.0 | ✅ |
| Error Tracking | Sentry | @sentry/nextjs 10.48 | ✅ |
| Hosting | Vercel | — | — |
| Package Manager | Bun | 1.3.12 | ✅ |
| Monorepo | Turborepo | 2.9.6 | ✅ |

## Monorepo Structure

```
├── apps/web/              # Next.js application
│   ├── app/               # App Router pages
│   │   ├── (storefront)/  # Public storefront routes
│   │   ├── (dashboard)/   # Admin dashboard routes
│   │   ├── api/           # API routes
│   │   ├── login/         # Auth page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Design system tokens
│   ├── components/        # React components
│   │   ├── storefront/    # Customer-facing components (22 total)
│   │   ├── dashboard/     # Admin components (5 total)
│   │   ├── auth/          # Authentication
│   │   └── marketing/     # Tracking pixels
│   ├── lib/               # Business logic, schemas, utils
│   ├── utils/supabase/    # Supabase client helpers
│   └── proxy.ts           # Edge proxy (auth session refresh)
├── packages/db/           # Drizzle ORM, schema, queries
├── packages/ui/           # Shared UI components (9 primitives)
└── packages/config/       # Shared tsconfig
```

## Component Inventory

### Storefront Components (`components/storefront/`)
| Component | Lines | Key Patterns |
|---|---|---|
| `navbar.tsx` | 266 | Sticky glassmorphism header, mobile drawer, cart badge |
| `hero-section.tsx` | 143 | Staggered Motion entrance, stats strip |
| `trust-bar.tsx` | 34 | Marquee scroll, Lucide icons |
| `product-grid.tsx` | 91 | Filter pills, ScrollReveal wrapping |
| `product-card.tsx` | 83 | Glow-ring hover, Card with image |
| `how-it-works.tsx` | 62 | 3-step timeline, step-number-ring |
| `why-us.tsx` | 67 | Value propositions, Lucide icons |
| `faq-accordion.tsx` | 121 | Expand/collapse, grid-rows animation |
| `footer.tsx` | 105 | Multi-column links, back-to-top |
| `order-form.tsx` | 774 | 4-step wizard, react-hook-form, lazy-loaded steps |
| `cart-summary.tsx` | 128 | Item list, subtotal/total/tip breakdown |
| `order-success.tsx` | 267 | Copy-to-clipboard, social share, confetti |
| `track-order-form.tsx` | 424 | Code/email tab search, order timeline |
| `order-status-timeline.tsx` | — | Status step visualization |

### Dashboard Components (`components/dashboard/`)
| Component | Lines | Key Patterns |
|---|---|---|
| `dashboard-shell.tsx` | 183 | Sidebar nav, mobile responsive, Lucide icons |
| `kpi-card.tsx` | ~30 | Value + label + hint |
| `status-badge.tsx` | ~20 | Status-to-color mapping |
| `page-header.tsx` | ~25 | Title + action buttons |

### UI Primitives (`packages/ui/`) — Migrating to shadcn/ui
| Component | Source | Key Patterns |
|---|---|---|
| `button.tsx` | shadcn | 6 variants via cva (default, destructive, outline, secondary, ghost, link), 4 sizes |
| `card.tsx` | shadcn | Card + CardContent + CardHeader + CardTitle + CardDescription |
| `badge.tsx` | shadcn | default, secondary, destructive, outline variants |
| `input.tsx` | shadcn | Styled text input with focus ring |
| `label.tsx` | shadcn | Form labels with peer-disabled styling |
| `accordion.tsx` | shadcn | Collapsible FAQ sections |
| `dialog.tsx` | shadcn | Modal overlays |
| `tooltip.tsx` | shadcn | Hover information |
| `sheet.tsx` | shadcn | Mobile navigation drawer |
| `toggle-group.tsx` | shadcn | Filter pill groups |
| `table.tsx` | shadcn | Dashboard data tables |
| `skeleton.tsx` | shadcn | Shimmer loading placeholder |
| `spinner.tsx` | shadcn | Loading indicator |
| `sonner.tsx` | shadcn | Toast notification system |
| `field.tsx` | custom | Input, Textarea, Select, FieldWrapper |
| `section-heading.tsx` | custom | Eyebrow + title + description |
| `empty-state.tsx` | custom | Icon + title + desc + action |

**Import convention**: `import { Button } from "@wongdigital/ui/components/button"`
**Utility**: `import { cn } from "@wongdigital/ui/lib/utils"` (clsx + tailwind-merge)

## Motion Import Convention

**IMPORTANT**: All Motion imports must use the v12+ API path:
```tsx
// ✅ Correct (v12+ official API)
import { motion, AnimatePresence, useInView } from "motion/react"

// ❌ Wrong (legacy path — do NOT use)
import { motion } from "framer-motion"
```

The package is listed as `"motion": "^12.38.0"` in `package.json` and re-exports all APIs via `motion/react`.

## User Flow (Chronological Order)

1. **Homepage** (`/`) — Hero → TrustBar → ProductGrid → HowItWorks → WhyUs → FAQ → Footer
2. **Order Page** (`/order`) — Product Selection → Customer Details → Payment → Review → Submit
3. **Order Success** (`/order/success/[orderCode]`) — Confirmation with order code + copy button
4. **Track Order** (`/track`) — Search by code or email → Order timeline
5. **Dashboard** (`/dashboard`) — Overview → Orders → Products → Customers → Settings

## File Conventions

### Page Structure
```
imports (types → framework → packages → local)
metadata / exports / constants
types
helper functions
main component (state → derived → handlers → render)
child components / fallbacks
```

### Import Order Convention
```ts
// 1. Type imports
import type { Metadata } from "next"

// 2. Framework imports
import { notFound } from "next/navigation"

// 3. Package imports
import { getStoreSettings } from "@wongdigital/db/storefront"
import { ShoppingCart, User } from "lucide-react"

// 4. Local imports (aliased)
import { Footer } from "@/components/storefront/footer"
import { formatPrice } from "@/lib/format"

// 5. Relative imports
import { CartSummary } from "./cart-summary"
```

## Development Commands

```bash
bun run dev          # Start dev server (Turbopack)
bun run build        # Production build
bun run test         # Run all tests across workspaces
bun run typecheck    # TypeScript strict mode check
bun run lint         # ESLint
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Run migrations
bun run db:seed      # Seed the database
```

## Testing

- **Framework**: Vitest 4.1.4
- **Workspaces**: web (jsdom), ui (jsdom), db (node)
- **Test location**: Co-located with source (`*.test.ts` / `*.test.tsx`)
- **Existing suites**: `button.test.tsx`, `badge.test.tsx`, `catalog.test.ts`, `format.test.ts`, `urgency.test.ts`, `index.test.ts`
- **Run**: `bun run test` via Turborepo

## Design System Quick Reference

### Color Palette — Blue (#3B82F6)
- `--accent: #3B82F6` / `--accent-fg: #fff` / `--accent-hover: #2563EB` — brand blue
- `--bg-base: #0A0F1A` / `--bg-surface: #111827` / `--bg-card: #1E293B` — cool slate surfaces
- `--text-primary: #F8FAFC` / `--text-secondary: #94A3B8` — text hierarchy
- `--border: #1E293B` — border color
- `--color-success: #22C55E` / `--color-danger: #EF4444` / `--color-info: #38BDF8` — semantics

### Typography
- **Display**: Space Grotesk (headings, hero text)
- **Body**: Inter (paragraphs, form labels, UI text)
- **Mono**: JetBrains Mono (order codes, pricing, code)

### Key CSS Utilities
- `.container-shell` — max-width 1280px + responsive padding
- `.glass-panel` — glassmorphism (`backdrop-filter: blur(24px)`)
- `.glow-ring` — blue-glow ring on hover
- `.marquee-track` — infinite horizontal scroll animation
- `.step-number-ring` — numbered step indicator

### shadcn CSS Variables (via `@theme inline`)
- `--primary` / `--primary-foreground` — maps to accent blue
- `--background` / `--foreground` — page bg/text
- `--card` / `--card-foreground` — card surfaces
- `--muted` / `--muted-foreground` — secondary elements
- `--radius` — global border radius base (0.75rem)

## Accessibility Checklist
- [x] Global `:focus-visible` ring for keyboard navigation
- [x] `role="alert"` on field errors
- [x] `aria-live="polite"` on error/not-found pages
- [x] `aria-current="page"` on active nav items
- [x] `prefers-reduced-motion: reduce` disables animations
- [x] Keyboard `Escape` closes mobile nav
- [x] `scroll-to-error` on validation failure
