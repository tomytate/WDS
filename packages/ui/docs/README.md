# `@wongdigital/ui` — primitives

One-pager per primitive. Each doc covers: purpose, anatomy, key props, accessibility contract, and a copy-paste example.

## Index

- [Alert](./alert.md) — inline info / success / warning / danger banner with `role="alert"` or `role="status"`.
- [Button](./button.md) — canonical button with variants (`accent`, `ghost`, `surface`, `icon`, `danger`) and sizes.
- [Card](./card.md) — the base surface primitive. All dashboard content sits on one.
- [DataTable](./data-table.md) — compositional wrappers around `<table>` with scope / hover / align helpers.
- [Field](./field.md) — `Input`, `Textarea`, `Select`, and `FieldWrapper` — the form-field stack.
- [KpiCard](./kpi-card.md) — headline metric tile. Wraps `Card` with a label / value / hint triplet.
- [PageHeader](./page-header.md) — eyebrow + title + description + action row. One per page.
- [Pagination](./pagination.md) — numbered page control with prev/next and ellipsis.
- [Segmented](./segmented.md) — single-select radiogroup pill control ("Grid / List").
- [StatusBadge](./status-badge.md) — coloured pill for a status, with optional pulsing dot.
- [Tabs](./tabs.md) — WAI-ARIA Authoring-Practices tablist with arrow-key navigation.

## Design tokens

The primitives read CSS custom properties declared in `apps/web/app/globals.css`. The token families are:

- `--bg-*` — `base`, `surface`, `card`, `elevated`
- `--text-*` — `primary`, `secondary`, `muted` (all WCAG 2.2 AA verified)
- `--accent`, `--accent-hover`, `--accent-strong` (use `-strong` when the accent is body text)
- `--accent-tint-{faint,soft,medium,strong}` + `--accent-border` (five-rung tint scale)
- `--color-{success,warning,danger,info}` + `--color-*-text` (contrast-safe text variants)
- `--radius-{chip,inner,card,section}` (four rungs)
- `--shadow-{xs,sm,card,md,lg,elevated}` + `--shadow-glow-{soft,medium,strong}`
- `--text-{display-1,display-2,h1,h2,h3,h4,body,small,micro}` (typography scale)
- `--duration-{fast,normal,medium,slow}` (motion scale)

See `globals.css` for the full declaration block and the comment next to each value documenting its measured contrast ratio.

## Accessibility contract

Every primitive in this package has been written against **WCAG 2.2 AA**. Specifically:

- 1.3.1 Info and Relationships — tables use `<th scope>`; fields use labels; groups use `role="group"`.
- 1.4.3 / 1.4.11 Contrast — every `color: var(--…)` has been verified at build-time against the surfaces it's rendered on. See `audit-status.md` §1.
- 2.1.1 Keyboard — every interactive primitive supports Enter/Space, Arrow keys where applicable.
- 2.4.7 Focus Visible — relies on the global `:focus-visible` ring in `globals.css`.
- 2.4.11 Focus Not Obscured — verified per-primitive with `scroll-margin` where scroll containers are involved.
- 2.5.8 Target Size (Minimum) — interactive primitives are ≥ 24×24, and ≥ 44×44 on `@media (pointer: coarse)` via the global rule.

When you extend a primitive, the expectation is that these properties are preserved.
