# `Tabs`

Keyboard-accessible tablist that follows the WAI-ARIA Authoring Practices pattern. Compositional — the consumer controls the trigger/panel markup.

## API

```tsx
<Tabs defaultValue="orders">
  <Tabs.List aria-label="Dashboard sections">
    <Tabs.Trigger value="orders">Orders</Tabs.Trigger>
    <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
    <Tabs.Trigger value="settings" disabled>Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="orders">…</Tabs.Panel>
  <Tabs.Panel value="reviews">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```

## Props

### `Tabs`

| Prop             | Type                         | Default | Notes                                                   |
|------------------|------------------------------|---------|---------------------------------------------------------|
| `defaultValue`   | string                       | —       | Which tab is selected initially (uncontrolled).         |
| `value`          | string                       | —       | Controlled value. Pair with `onValueChange`.            |
| `onValueChange`  | `(value: string) => void`    | —       | Fires when a tab becomes selected.                      |
| `className`      | string                       | —       | Extra classes on the root `<div>`.                      |
| `children`       | ReactNode                    | —       | Should contain one `Tabs.List` and matching `Panel`s.   |

### `Tabs.List`

Renders a `role="tablist"`. Pass an `aria-label` that describes the whole set.

### `Tabs.Trigger`

| Prop       | Type      | Default | Notes                                           |
|------------|-----------|---------|-------------------------------------------------|
| `value`    | string    | —       | Must match a `Tabs.Panel` value.                |
| `disabled` | boolean   | `false` | Skipped in arrow navigation.                    |
| `children` | ReactNode | —       | The visible label (usually plain text).         |

### `Tabs.Panel`

| Prop       | Type      | Default | Notes                                           |
|------------|-----------|---------|-------------------------------------------------|
| `value`    | string    | —       | Must match a `Tabs.Trigger` value.              |
| `children` | ReactNode | —       | Rendered only when the panel is selected.       |

## Accessibility

- Roles: `role="tablist"` on the list, `role="tab"` on each trigger, `role="tabpanel"` on each panel.
- Each panel is `aria-labelledby` its trigger and gets `tabIndex={0}`, so screen reader users can Tab into the content (WCAG 2.1.1, APG).
- Arrow keys + Home/End move focus and activate the new tab automatically (automatic-activation model). Panels don't need heavy content, so automatic is acceptable per APG.
- Only the active trigger is in the tab order (`tabIndex={0}`); the others are `-1`. No "tab through 8 triggers before reaching content" footgun.
- Active trigger uses `--accent-strong` text + 2px bottom border — colour is not the only cue (WCAG 1.4.1).
- Triggers are `min-h-[44px]` (WCAG 2.2 §2.5.8 AA on touch).

## Example

```tsx
import { Tabs } from "@wongdigital/ui"

<Tabs defaultValue="overview">
  <Tabs.List aria-label="Product detail">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
    <Tabs.Trigger value="specs">Specs</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview"><ProductOverview /></Tabs.Panel>
  <Tabs.Panel value="reviews"><ReviewList /></Tabs.Panel>
  <Tabs.Panel value="specs"><Specs /></Tabs.Panel>
</Tabs>
```

## Don't

- Nest `Tabs` inside `Tabs`. Use a `Segmented` inside a panel instead.
- Render the same `value` on two triggers. `aria-controls` becomes ambiguous.
- Mount `Tabs.Panel` content without selecting it — the current implementation only renders the active panel. If you need to keep non-active panels mounted (e.g. for form state), switch to a controlled pattern and render all children yourself.
