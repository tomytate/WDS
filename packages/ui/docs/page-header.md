# `PageHeader`

Eyebrow + title + description + action row. Renders at the top of every dashboard page.

## Anatomy

```
[icon] EYEBROW (accent, uppercase)

Big Display Title                                        [ ghost btn ] [ accent btn ]
Short descriptive line in secondary text.
────────────────────────────────────────────────────────────────────────
```

## Props

| Prop          | Type                 | Default | Notes                                                                    |
|---------------|----------------------|---------|--------------------------------------------------------------------------|
| `icon`        | ReactNode            | —       | Decorative. Rendered in an `aria-hidden` chip next to the eyebrow text.  |
| `eyebrow`     | string               | —       | Short upper-cased label. Acts as the visual anchor for the icon.         |
| `title`       | string               | —       | Rendered as `<h1>` by default; pass `as="h2"` when nested.               |
| `description` | string               | —       | Max `max-w-2xl`, wraps naturally.                                        |
| `actions`     | ReactNode            | —       | Typically 1–3 buttons. First = ghost, last = accent.                     |
| `as`          | `"h1" \| "h2"`       | `"h1"` | Pick the heading level for correct outline.                              |
| `className`   | string               | —       | Extra wrapper classes.                                                   |

## Accessibility

- Heading level is explicit — `as="h1"` by default.
- Icon chip is `aria-hidden`. The eyebrow string is the label.
- Actions are a flex row → visual order matches DOM/focus order (WCAG 2.4.3).
- Eyebrow uses `--accent-strong` (≥4.80:1 on `--bg-base` light) instead of `--accent` for body-text contrast.

## Example

```tsx
import { PageHeader } from "@wongdigital/ui"
import { Button } from "@wongdigital/ui"
import { Package } from "lucide-react"

<PageHeader
  icon={<Package />}
  eyebrow="Catalog"
  title="Products"
  description="Manage what's live on the storefront."
  actions={
    <>
      <Button variant="ghost" size="sm">Import</Button>
      <Button size="sm">New product</Button>
    </>
  }
/>
```

## Don't

- Use multiple PageHeaders on one page.
- Put the page's secondary actions (like filters) in the actions row — they belong in a toolbar below.
