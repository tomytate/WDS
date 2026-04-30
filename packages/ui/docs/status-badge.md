# `StatusBadge`

Small rounded pill indicating a status. A coloured dot sits to the left of the label text.

## Props

| Prop        | Type                                                         | Default     | Notes                                     |
|-------------|--------------------------------------------------------------|-------------|-------------------------------------------|
| `tone`      | `"neutral" \| "success" \| "warning" \| "danger" \| "info" \| "accent"` | `"neutral"` | Picks the colour palette.                 |
| `pulse`     | boolean                                                      | `false`     | Dot animates with `animate-pulse`.        |
| `live`      | boolean                                                      | `false`     | Sets `role="status"` for SR live regions. |
| `className` | string                                                       | —           | Merged via `cn`.                          |
| `children`  | ReactNode                                                    | —           | The label. Usually a single word.         |

## Accessibility

- Text colour uses the `--color-*-text` tokens (WCAG AA body-contrast verified; see `audit-status.md` §1).
- Dot is decorative (`aria-hidden`) — the label carries the status.
- `live` enables `role="status"` + implicit polite `aria-live` for tickers (e.g., "Order {code} is now processing").

## Example

```tsx
import { StatusBadge } from "@wongdigital/ui"

<StatusBadge tone="success">Paid</StatusBadge>
<StatusBadge tone="warning" pulse>Pending</StatusBadge>
<StatusBadge tone="danger">Failed</StatusBadge>

// Use `live` when the badge updates in response to a background event
<StatusBadge tone="info" live>Processing</StatusBadge>
```

## Don't

- Put long phrases inside — the pill width will balloon. Use a single word or short label.
- Use the `accent` tone to mean "success" — it's reserved for neutral emphasis.
