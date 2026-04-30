---
description: shadcn/ui component library patterns, monorepo setup, CLI usage, and Tailwind CSS 4 compatibility
---

# shadcn/ui — Reference Guide

## Architecture

This project uses shadcn/ui in a **Turborepo monorepo** with two workspaces:
- `apps/web` — Next.js 16 application (consumer)
- `packages/ui` — Shared UI component library (provider)

Both workspaces have a `components.json` file. The CLI intelligently routes:
- **UI primitives** (Button, Card, Badge, etc.) → `packages/ui/src/components/`
- **Composite blocks** (login-form, dashboard-layout, etc.) → `apps/web/components/`

## Monorepo Configuration

### `apps/web/components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "../../packages/ui/src/styles/globals.css", "baseColor": "slate", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@wongdigital/ui/lib/utils",
    "ui": "@wongdigital/ui/components"
  }
}
```

### `packages/ui/components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/styles/globals.css", "baseColor": "slate", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@wongdigital/ui/components",
    "utils": "@wongdigital/ui/lib/utils",
    "hooks": "@wongdigital/ui/hooks",
    "lib": "@wongdigital/ui/lib",
    "ui": "@wongdigital/ui/components"
  }
}
```

**Critical rules:**
- Both files **must** share the same `style`, `iconLibrary`, and `baseColor`
- For Tailwind CSS v4, the `config` field **must** be an empty string `""`
- Our package namespace is `@wongdigital/ui` (not `@workspace/ui`)

## CLI Commands

```bash
# Always run from apps/web (or use -c flag from root)
cd apps/web

# Add a single component
bunx shadcn@latest add button

# Add multiple components
bunx shadcn@latest add button badge card input label accordion

# From monorepo root (alternative)
bunx shadcn@latest add button -c apps/web
```

## Import Convention

```tsx
// UI primitives — from the shared package
import { Button } from "@wongdigital/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@wongdigital/ui/components/card"
import { Badge } from "@wongdigital/ui/components/badge"

// Utilities
import { cn } from "@wongdigital/ui/lib/utils"

// Hooks (if any)
import { useTheme } from "@wongdigital/ui/hooks/use-theme"
```

## `cn()` Utility

shadcn uses `clsx` + `tailwind-merge` combined into a single `cn()` function:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Important:** Replace all bare `clsx()` calls with `cn()` from `@wongdigital/ui/lib/utils`. The `twMerge` layer resolves Tailwind class conflicts (e.g., `cn("p-4", "p-8")` → `"p-8"`).

## Tailwind CSS 4 Compatibility

shadcn uses CSS variables for theming. For Tailwind 4, add an `@theme inline` block in `globals.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

This maps CSS variables to Tailwind utility classes so `bg-primary`, `text-foreground`, `rounded-lg` etc. all work.

## Component List (Planned)

| Component | File | Purpose |
|-----------|------|---------|
| Button | `button.tsx` | Primary actions, CTAs |
| Badge | `badge.tsx` | Status indicators, tags |
| Card | `card.tsx` | Product cards, info blocks |
| Input | `input.tsx` | Form text inputs |
| Label | `label.tsx` | Form field labels |
| Accordion | `accordion.tsx` | FAQ sections |
| Dialog | `dialog.tsx` | Modals, confirmations |
| Tooltip | `tooltip.tsx` | Hover info, comparison tips |
| Sheet | `sheet.tsx` | Mobile nav drawer |
| Sidebar | `sidebar.tsx` | Dashboard nav |
| Sonner | `sonner.tsx` | Toast notifications |
| Skeleton | `skeleton.tsx` | Loading states |
| Spinner | `spinner.tsx` | Loading indicators |
| Toggle Group | `toggle-group.tsx` | Filter pills |
| Table | `table.tsx` | Dashboard data tables |

## Variant Extension Pattern

Extend shadcn components using `cva` from `class-variance-authority`:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Best Practices

1. **Always use `cn()`** — never use bare `clsx()` in components that combine Tailwind classes
2. **Don't mix old and new** — during migration, convert one component at a time
3. **Import from package** — `from "@wongdigital/ui/components/..."` not relative paths
4. **Keep primitives in packages/ui** — only composite/page-specific components in apps/web
5. **Use `@theme inline`** — required for Tailwind 4 to resolve shadcn CSS variables as utilities
6. **Match components.json** — both files must agree on `style`, `iconLibrary`, `baseColor`
