# `KpiCard`

Headline metric tile used on every dashboard overview page. Wraps `Card` with a label / value / hint triplet and an optional leading icon chip.

## Anatomy

```
┌──────────────────────────────────┐
│ [icon] LABEL (uppercase)         │  ← eyebrow row (icon optional)
│                                  │
│ 42                               │  ← `value` — display type, truncates on overflow
│                                  │
│ This week                        │  ← optional `hint`
└──────────────────────────────────┘
```

## Props

| Prop         | Type      | Default | Notes                                                            |
|--------------|-----------|---------|------------------------------------------------------------------|
| `icon`       | ReactNode | —       | Rendered inside an `aria-hidden` chip. Use a lucide icon.        |
| `label`      | string    | —       | Upper-cased; announced first by screen readers.                  |
| `value`      | string    | —       | The metric. Auto-truncates with a `title={value}` fallback.      |
| `hint`       | string    | —       | Optional secondary line. Associated via `aria-describedby`.      |
| `emphasized` | boolean   | `false` | Swaps the idle border for `--accent-border`. Use when "pending > 0" etc. |
| `className`  | string    | —       | Extra classes merged via `cn`.                                   |

## Accessibility

- `role="group"` — the whole card is a single announceable unit.
- `aria-labelledby` — points at the label span so SRs announce it first.
- `aria-describedby` — points at the hint (only when present).
- `title={value}` — full metric is still readable when the value is visually truncated (WCAG 3.3.1).
- Contrast: hint uses `--text-secondary` (≥6.15:1 on `--bg-card` light, ≥5.71:1 dark).

## Example

```tsx
import { KpiCard } from "@wongdigital/ui"
import { Wallet } from "lucide-react"

<KpiCard
  icon={<Wallet />}
  label="Revenue"
  value="₱124,530"
  hint="This month"
/>

// Emphasized tile when a value needs attention
<KpiCard
  label="Pending"
  value={pendingCount.toString()}
  hint="Needs review"
  emphasized={pendingCount > 0}
/>
```

## Don't

- Put interactive controls inside. If you need one, render the CTA outside the card and have the whole card link to the detail view.
- Use for long strings — the value truncates. If the metric can exceed ~18 chars, swap for a two-line label.
