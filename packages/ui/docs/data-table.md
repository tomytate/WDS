# `DataTable`

Compositional wrappers around `<table>`. Each sub-component maps to its semantic HTML equivalent with a single source of truth for padding, hover, divider, and `scope`.

## API

```tsx
DataTable.Root        // <div overflow-x-auto> + <table>
DataTable.Head        // <thead> with a subtle background tint
DataTable.Body        // <tbody> with row dividers
DataTable.Row         // <tr>, optional `interactive` prop for hover
DataTable.HeaderCell  // <th scope="col"> by default
DataTable.Cell        // <td> with align support
```

## Accessibility

- `HeaderCell` emits `scope="col"` by default. Pass `scope="row"` if you need a row header.
- Pass `srLabel` to a `HeaderCell` whose only visible content is an icon or a control — it renders a `sr-only` span so SRs still announce the column (WCAG 1.3.1 / 4.1.2).
- `DataTable.Root` accepts a `caption` prop which renders a `<caption>` element (set `captionVisuallyHidden` to hide visually).
- The wrapper uses `overflow-x-auto` with visible focus rings so keyboard users can scroll + focus cells on mobile without losing the outline (WCAG 2.4.7).

## Example

```tsx
import { DataTable, Button } from "@wongdigital/ui"

<DataTable.Root caption="Recent orders" captionVisuallyHidden>
  <DataTable.Head>
    <DataTable.Row>
      <DataTable.HeaderCell>Customer</DataTable.HeaderCell>
      <DataTable.HeaderCell>Status</DataTable.HeaderCell>
      <DataTable.HeaderCell align="right">Total</DataTable.HeaderCell>
      <DataTable.HeaderCell srLabel="Actions" align="right" />
    </DataTable.Row>
  </DataTable.Head>
  <DataTable.Body>
    {rows.map(r => (
      <DataTable.Row key={r.id} interactive>
        <DataTable.Cell>{r.name}</DataTable.Cell>
        <DataTable.Cell><StatusBadge tone={r.tone}>{r.label}</StatusBadge></DataTable.Cell>
        <DataTable.Cell align="right">{formatPeso(r.total)}</DataTable.Cell>
        <DataTable.Cell align="right">
          <Button variant="ghost" size="sm">View</Button>
        </DataTable.Cell>
      </DataTable.Row>
    ))}
  </DataTable.Body>
</DataTable.Root>
```

## Don't

- Nest another table inside a cell — use a definition list or `<ul>` instead.
- Use `HeaderCell` for a footer row — use a plain `<tfoot>` / `<th scope="row">` pattern.
