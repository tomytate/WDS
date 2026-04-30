# `Segmented`

Single-select pill group. Implemented as `role="radiogroup"` (one value in, one event out). Use this — not `Tabs` — when the control picks a *value* rather than a *panel*.

## Props

| Prop          | Type                                            | Default | Notes                                                     |
|---------------|-------------------------------------------------|---------|-----------------------------------------------------------|
| `value`       | `T extends string`                              | —       | Currently selected option value (controlled).             |
| `onChange`    | `(value: T) => void`                            | —       | Fired when the selection changes (click or arrow keys).   |
| `options`     | `{ value: T; label: ReactNode; disabled?: boolean }[]` | — | Ordered list of options.                                 |
| `aria-label`  | string                                          | —       | Required for SR announcement.                             |
| `className`   | string                                          | —       | Extra classes on the wrapper.                             |

## Accessibility

- Follows the ARIA "radiogroup" pattern: only the checked option is in the tab order (`tabIndex=0`), the others receive focus via arrow keys.
- Arrow keys: `Right` / `Down` → next, `Left` / `Up` → previous, `Home` / `End` → first / last. Activation is automatic (WCAG 2.1.1).
- Disabled options are skipped during arrow navigation.
- Options use `min-h-[36px]`; the pointer-coarse globals-rule ensures ≥44×44 on touch (WCAG 2.2 §2.5.8 AA).
- Focus-visible outline is a 2px accent ring at an offset — works on light and dark (WCAG 2.4.7).

## Tabs vs. Segmented — pick one

- Does selecting this reveal a different panel? → **Tabs**.
- Does selecting this change a filter, mode, or option? → **Segmented**.

## Example

```tsx
import { Segmented } from "@wongdigital/ui"

const [range, setRange] = useState<"7d" | "30d" | "90d">("30d")

<Segmented
  aria-label="Time range"
  value={range}
  onChange={setRange}
  options={[
    { value: "7d",  label: "7 days"  },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ]}
/>
```

## Don't

- Give it more than ~5 options — it stops being scannable. Use a `Select` instead.
- Mix icon-only and text-only options. Consistency helps sighted users; the SR label hides the difference anyway.
- Use for multi-select. Segmented is single-select. For multi-select pills, use the (upcoming) `ToggleGroup`.
