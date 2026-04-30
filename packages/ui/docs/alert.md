# `Alert`

Inline banner for info / success / warning / danger / neutral messages. Uses the `--color-*-text` tokens for contrast-safe body text.

## Props

| Prop      | Type                                                  | Default   | Notes                                                  |
|-----------|-------------------------------------------------------|-----------|--------------------------------------------------------|
| `tone`    | `"info" \| "success" \| "warning" \| "danger" \| "neutral"` | `"info"`  | Picks palette and `role`/`aria-live`.                 |
| `title`   | ReactNode                                             | —         | Optional bold first line.                              |
| `icon`    | ReactNode                                             | —         | Rendered `aria-hidden`.                                |
| `actions` | ReactNode                                             | —         | Small button row below the body.                       |
| `children`| ReactNode                                             | —         | The message body. Plain text or inline markup.         |

## Accessibility

- `tone="danger"` / `tone="warning"` → `role="alert"` + `aria-live="assertive"` (announced immediately).
- Otherwise → `role="status"` + `aria-live="polite"` (announced at next idle moment).
- The icon slot is decorative (`aria-hidden`) — the title + body carry the meaning.
- Text uses `--color-*-text` tokens which meet WCAG 2.2 AA body contrast.

## Example

```tsx
import { Alert } from "@wongdigital/ui"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"

<Alert tone="success" title="Saved" icon={<CheckCircle2 />}>
  Your changes went live a moment ago.
</Alert>

<Alert tone="warning" title="Heads up" icon={<AlertTriangle />}>
  This promo expires in 2 days.
</Alert>

<Alert tone="info" title="Tip" icon={<Info />} actions={<Button size="sm">Learn more</Button>}>
  Use the bulk-edit toggle to update many at once.
</Alert>
```

## Don't

- Use `danger` for recoverable validation errors — put those inline next to the field via `FieldWrapper error={…}`.
- Stack 3+ alerts at the top of a page. Consolidate.
