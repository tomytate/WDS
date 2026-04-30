# Field primitives

`Input`, `Textarea`, `Select`, and `FieldWrapper` are the four building blocks for every form. They share a single base style (border, focus ring, placeholder colour, disabled state) so forms don't drift between pages.

## API

```tsx
<FieldWrapper label="Email" htmlFor="email" hint="We'll send a magic link." error={errors.email?.message}>
  <Input id="email" name="email" type="email" autoComplete="email" />
</FieldWrapper>
```

## `Input`

| Prop          | Type                              | Default | Notes                                              |
|---------------|-----------------------------------|---------|----------------------------------------------------|
| `leftIcon`    | ReactNode                         | —       | Renders a decorative icon inside the left inset.   |
| `rightIcon`   | ReactNode                         | —       | Same for the right inset.                          |
| `error`       | boolean                           | `false` | Switches the border + focus ring to `--color-danger`. |
| …rest         | `InputHTMLAttributes<HTMLInputElement>` | — | Standard input props.                              |

## `Textarea`

Same as `Input` but `min-h-28` and no icon slots. `error` toggles the danger state.

## `Select`

Same base styles, plus a chevron SVG drawn as a background image so it renders in every browser without an icon font. `appearance-none` strips the OS chrome. `min-h-[44px]` meets WCAG 2.2 §2.5.8 AA.

`aria-invalid` is auto-wired when `error` is true (unless you override it explicitly).

## `FieldWrapper`

| Prop      | Type       | Default | Notes                                                                  |
|-----------|------------|---------|------------------------------------------------------------------------|
| `label`   | string     | —       | Rendered as `<label htmlFor>`. Always provide one.                     |
| `htmlFor` | string     | —       | Must match the nested field's `id`.                                    |
| `hint`    | string     | —       | Secondary helper text. Hidden if `error` is set.                       |
| `error`   | string     | —       | Shown via a live `role="alert"` paragraph with a slide-in animation.   |
| `children`| ReactNode  | —       | The single `Input` / `Textarea` / `Select`.                            |

## Accessibility

- `FieldWrapper` renders a real `<label>` with `htmlFor` — NEVER use `aria-label` as a replacement when a visible label exists (WCAG 2.5.3 / 3.3.2).
- Error text is inside a `role="alert"` region so screen readers announce it without re-focusing.
- The chevron is drawn at 12px but the `Select` itself is 48px tall — well above WCAG 2.2 §2.5.8 AA (24×24).
- Colour is NEVER the only error indicator: the error message text + border change together (WCAG 1.4.1).
- Focus is a high-contrast 4px ring (`color-mix` with `--accent`) that's visible on both themes (WCAG 2.4.7 / 2.4.11).

## Example — full form row

```tsx
import { FieldWrapper, Input, Select, Textarea } from "@wongdigital/ui"

<FieldWrapper label="Plan" htmlFor="plan" hint="Switch anytime.">
  <Select id="plan" defaultValue="starter">
    <option value="starter">Starter</option>
    <option value="growth">Growth</option>
    <option value="enterprise">Enterprise</option>
  </Select>
</FieldWrapper>

<FieldWrapper label="Company" htmlFor="company" error={errors.company}>
  <Input id="company" name="company" required autoComplete="organization" />
</FieldWrapper>

<FieldWrapper label="Notes" htmlFor="notes">
  <Textarea id="notes" name="notes" rows={4} />
</FieldWrapper>
```

## Don't

- Set `placeholder` as a label replacement — placeholders vanish on focus and flunk every audit (WCAG 1.3.1 / 3.3.2).
- Wrap multiple fields in a single `FieldWrapper`. One label per control.
- Put interactive elements inside `FieldWrapper`'s `hint` text — it's a `<p>`, not a live region.
