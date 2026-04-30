---
description: Tailwind CSS 4.2.2 CSS-first configuration, @theme directive, utility patterns, and design system conventions
---

# Tailwind CSS 4.2.2 — Reference Guide

## Architecture Change: CSS-First Configuration

Tailwind v4 replaces `tailwind.config.js` with CSS-native `@theme` directives.
No JavaScript config file needed.

### Setup
```css
@import "tailwindcss";

@theme {
  --color-accent: #3B82F6;
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --radius-card: 16px;
  --breakpoint-3xl: 1920px;
}
```

### PostCSS Config
```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

## Theme Variables → Utility Classes

When you define a variable in `@theme`, Tailwind auto-generates utilities:

| `@theme` Variable | Generated Utilities |
|---|---|
| `--color-accent: ...` | `bg-accent`, `text-accent`, `border-accent` |
| `--font-display: ...` | `font-display` |
| `--radius-card: ...` | `rounded-card` (custom) |
| `--breakpoint-3xl: 1920px` | `3xl:` responsive prefix |

## New in v4.2 (confirmed from CHANGELOG, March 2026)

### New Default Colors
- Mauve, Olive, Mist, Taupe added to the default palette

### Logical Property Utilities
- `pbs-*` / `pbe-*` — padding-block-start/end
- `mbs-*` / `mbe-*` — margin-block-start/end
- `border-bs-*` / `border-be-*` — logical border block-start/end
- `scroll-pbs-*` / `scroll-pbe-*` / `scroll-mbs-*` / `scroll-mbe-*`
- `inset-s-*` / `inset-e-*` — logical inset-inline-start/end
- `inline-*` / `min-inline-*` / `max-inline-*` — inline-size utilities
- `block-*` / `min-block-*` / `max-block-*` — block-size utilities

### `font-features-*` Utility
- Controls `font-feature-settings` (ligatures, small caps, tabular numbers)

### Experimental: `@container-size`
- New `@container-size` utility for container queries (TW 4.2+ unreleased)

### `@tailwindcss/webpack` Plugin
- Official first-class Webpack integration

### Vite 8 Support
- `@tailwindcss/vite` now supports Vite 8 (added in 4.2.2)

### Deprecated in v4.2
- ⚠️ `start-*` and `end-*` utilities → use `inset-s-*` and `inset-e-*` instead
- These deprecated utilities still work but will be removed in a future major version

## Project Design System (globals.css)

This project uses CSS variables inside `@theme` for the full design system:

```css
@theme {
  /* Colors — Blue Palette */
  --color-accent: #3B82F6;
  --color-accent-fg: #fff;
  --color-accent-hover: #2563EB;
  --color-success: #22C55E;
  --color-danger: #EF4444;

  /* Typography */
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Layout */
  --radius-card: 16px;
  --radius-section: 20px;

  /* Surfaces (via bare CSS custom properties) */
  --bg-base: #0A0F1A;
  --bg-surface: #111827;
  --bg-card: #1E293B;
  --border: #1E293B;
}
```

## Custom Utilities Pattern

```css
/* Container with max-width + padding */
.container-shell {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
}

/* Safe area insets for notched devices */
.safe-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}
```

## Animation & Motion

```css
@keyframes field-error-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@keyframes step-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  .step-content-enter { animation: none; }
  [data-field-error] { animation: none; }
}
```

## Elevation Scale Pattern

Define in `:root` (not `@theme`) since shadows use rgba and toggle with dark mode:
```css
:root {
  --shadow-xs: 0 1px 2px rgba(10, 15, 26, 0.04);
  --shadow-sm: 0 2px 8px rgba(10, 15, 26, 0.06), 0 1px 2px rgba(10, 15, 26, 0.08);
  --shadow-md: 0 4px 16px rgba(10, 15, 26, 0.08), 0 2px 4px rgba(10, 15, 26, 0.06);
  --shadow-lg: 0 12px 40px rgba(10, 15, 26, 0.10), 0 4px 12px rgba(10, 15, 26, 0.06);
  --shadow-xl: 0 24px 80px rgba(10, 15, 26, 0.10), 0 8px 24px rgba(10, 15, 26, 0.06);
}
```

## Glass Panel Pattern (Modern Glassmorphism)

```css
.glass-panel {
  background: color-mix(in srgb, var(--bg-card) 72%, transparent);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), var(--shadow-sm);
}
```

## `color-mix()` Opacity Pattern

Used extensively in this project for transparent overlays:
```css
/* Instead of rgba/opacity hacks, use color-mix for transparency */
bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]     /* 16% accent tint */
bg-[color-mix(in_srgb,var(--bg-card)_94%,transparent)]    /* 94% card bg */
shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_6%,transparent)]
```

## IDE Note
- `@theme` directive shows "Unknown at rule @theme" in some CSS linters
- This is a **false positive** — Tailwind v4 processes it correctly
- The build passes clean with zero errors

## Best Practices
1. **Define all tokens in `@theme`** — single source of truth for Tailwind-generated utilities
2. **Use `:root`/`.dark` for runtime tokens** — CSS vars that toggle with dark mode stay outside `@theme`
3. **Prefer hex or oklch()** — hex for simplicity, oklch for perceptual uniformity
4. **Use `color-mix()`** for transparent overlays instead of rgba/opacity hacks
5. **Always add `prefers-reduced-motion`** rules for custom animations
6. **Use `inset-s-*`/`inset-e-*`** instead of deprecated `start-*`/`end-*`
7. **Use `@layer components`** for custom utility classes to avoid specificity wars
8. **Use `@theme inline`** block when integrating shadcn/ui to bridge CSS variables to Tailwind utilities
9. **Use `starting:` variant** for CSS `@starting-style` enter/exit transitions (no JS needed)

## `@theme inline` Bridge for shadcn/ui

When using shadcn/ui with Tailwind 4, add this block to `globals.css` to map shadcn CSS variables to Tailwind utility classes:

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

## `starting:` Variant for Enter/Exit Transitions

Tailwind 4 supports CSS `@starting-style` via the `starting:` variant:

```html
<!-- Element fades/slides in on mount without JS -->
<dialog class="opacity-0 starting:opacity-0 open:opacity-100 transition-opacity">
  Content here
</dialog>
```

This replaces simple Motion entrance animations and is zero-JS, GPU-accelerated.
