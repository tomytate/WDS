# `Button`

The one and only button primitive. Variants are driven by the design tokens in `globals.css` (no ad-hoc colours). Sizes map to the shared touch-target scale.

## Props

| Prop         | Type                                                    | Default   | Notes                                                              |
|--------------|---------------------------------------------------------|-----------|--------------------------------------------------------------------|
| `variant`    | `"accent" \| "ghost" \| "surface" \| "icon" \| "danger"` | `"accent"` | `icon` is a 40×40 circle; all others are pill-shaped.             |
| `size`       | `"sm" \| "md" \| "lg"`                                  | `"md"`    | `sm` = 40px, `md` = 44px, `lg` = 48px. Ignored when `variant="icon"`. |
| `loading`    | boolean                                                 | `false`   | Renders a spinner, disables the button, keeps width stable.        |
| `leftIcon`   | ReactNode                                               | —         | Rendered before the label (not while loading).                     |
| `rightIcon`  | ReactNode                                               | —         | Rendered after the label (not while loading).                      |
| `disabled`   | boolean                                                 | `false`   | Standard HTML; gets `cursor-not-allowed` + 50% opacity.            |
| …rest        | `ButtonHTMLAttributes<HTMLButtonElement>`               | —         | Includes `type`, which defaults to `"button"` (not `"submit"`).    |

## Accessibility

- `type="button"` by default — never accidentally submits a form.
- Focus-visible outline uses `outline: 2px` at an offset, tinted per variant so it survives on every background (WCAG 2.4.7).
- Target size: the smallest variant (`size="sm"`) is 40×40, comfortably above the 24×24 minimum in WCAG 2.2 §2.5.8. Icon buttons are 40×40.
- The spinner is `aria-hidden`; pair `loading` with an `aria-label` or visible text.
- Disabled state is communicated both visually (opacity) and semantically (`disabled` attribute).

## When to use each variant

- `accent` — the page's primary action. Max one per view.
- `ghost` — a secondary action that sits next to an accent button.
- `surface` — tertiary action inside a crowded toolbar / card.
- `icon` — a single-purpose icon action. Always supply `aria-label`.
- `danger` — destructive, confirm-first actions (delete, revoke). Avoid pairing with `accent` in the same row.

## Example

```tsx
import { Button } from "@wongdigital/ui"
import { Plus, Trash2 } from "lucide-react"

<Button leftIcon={<Plus size={16} />}>New product</Button>

<Button variant="ghost" size="sm">Cancel</Button>

<Button variant="icon" aria-label="Delete row">
  <Trash2 size={16} />
</Button>

<Button variant="danger" loading={isDeleting}>
  Delete account
</Button>
```

## Don't

- Use `<a>` styling tricks to make a link "look like" a button. Render a real `<Button>` with `onClick`, or a link component with the correct role.
- Put three accent buttons in a row — one action is the primary by definition.
- Nest a `Button` inside another interactive element (like a row link) — it breaks focus and screen-reader semantics.
