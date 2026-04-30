# `Card`

The workhorse container. A rounded, bordered panel with a shadow that picks up the `--bg-card` token. Sub-components give the header/body/footer a consistent rhythm so every page feels the same without extra thinking.

## API

```tsx
<Card variant="default" | "glass" | "elevated" | "interactive">
  <CardHeader>
    <CardTitle>…</CardTitle>
    <CardDescription>…</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

## Props

### `Card`

| Prop        | Type                                              | Default     | Notes                                                                  |
|-------------|---------------------------------------------------|-------------|------------------------------------------------------------------------|
| `variant`   | `"default" \| "glass" \| "elevated" \| "interactive"` | `"default"` | `interactive` adds hover-lift + accent-tinted shadow.                  |
| `className` | string                                            | —           | Merged via `cn`.                                                       |
| …rest       | `HTMLAttributes<HTMLDivElement>`                  | —           | Including `role`, which you should set if the card becomes actionable. |

Ref is forwarded so it plays nicely with portals, scroll spy, and animation libraries.

### `CardHeader` / `CardContent` / `CardTitle` / `CardDescription`

Thin wrappers that standardise spacing and typography. They use `--text-primary` / `--text-secondary`, so contrast stays AA on both themes.

## Accessibility

- The base `<div>` has no implicit role. If you make a card clickable, you MUST:
  1. render a single focusable child (e.g. a `<a>` that stretches via `::after { inset: 0 }`), OR
  2. give the card `role="button"` + `tabIndex={0}` and handle `Enter`/`Space`.
  Don't add `onClick` directly to the `<div>` without one of these.
- `CardTitle` renders an `<h3>` by default. Override via `as` if the outline calls for it (coming soon — for now wrap in `<h2>` + pass the matching styles).
- `CardDescription` uses `--text-secondary` (≥6.15:1 on `--bg-card` light).

## Variants at a glance

- `default` — the 95% case. Subtle backdrop blur + soft shadow. Use inside the normal page background.
- `glass` — translucent over hero sections / gradient backgrounds. Has the `.glass-panel` utility baked in.
- `elevated` — higher shadow, opaque fill. Use for modals, popovers, or "attention" tiles.
- `interactive` — adds hover-lift and accent-border on hover. Use when the whole card is a link/button.

## Example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@wongdigital/ui"

<Card variant="interactive" role="link" tabIndex={0} onClick={go}>
  <CardHeader>
    <CardTitle>Adobe Bundle</CardTitle>
    <CardDescription>12 subscribers • ₱12,400 MRR</CardDescription>
  </CardHeader>
  <CardContent>
    <StatusBadge tone="success">Live</StatusBadge>
  </CardContent>
</Card>
```

## Don't

- Nest `Card` inside `Card` — collapse to a single card with a divider instead.
- Put a full-bleed image inside without first setting `overflow-hidden` on the inner element. The card already clips, but child elements with their own shadow can escape.
- Use `variant="interactive"` on a card that doesn't actually go anywhere.
