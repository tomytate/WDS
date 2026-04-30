# `Pagination`

Numbered page control with prev/next buttons. Headless: the consumer owns `page` state and decides how to fetch data.

## Props

| Prop            | Type                               | Default                    | Notes                                                              |
|-----------------|------------------------------------|----------------------------|--------------------------------------------------------------------|
| `page`          | number                             | —                          | Current 1-indexed page.                                            |
| `totalPages`    | number                             | —                          | Total pages. If `<= 0`, nothing renders.                           |
| `onPageChange`  | `(next: number) => void`           | —                          | Called whenever a page button is clicked.                          |
| `siblingCount`  | number                             | `1`                        | Neighbour pages shown on each side of the current.                 |
| `aria-label`    | string                             | `"Pagination"`             | Landmark label on the `<nav>`.                                     |
| `getPageLabel`  | `(page: number) => string`         | `"Go to page {p}"`         | Customise SR-announced labels (e.g., for i18n).                    |
| `className`     | string                             | —                          | Extra wrapper classes.                                             |

## Accessibility

- Wrapped in a `<nav aria-label>` so SR users can jump straight to the pager (WCAG 2.4.1).
- The current page gets `aria-current="page"` (no need for the consumer to set it).
- Prev / next buttons are both `disabled` and `aria-disabled` at the extremes — they are removed from the tab order.
- Ellipses are `aria-hidden` so they aren't announced as "horizontal ellipsis, horizontal ellipsis".
- Buttons are 40×40 minimum; on coarse pointers (phones) they bump to 44×44 via the global rule (WCAG 2.2 §2.5.8 AA).
- The label for each page defaults to `"Go to page 3"` so the number alone never reaches the SR out of context.

## Example

```tsx
import { Pagination } from "@wongdigital/ui"

const [page, setPage] = useState(1)

<Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
  aria-label="Product list pages"
/>
```

## Don't

- Use for infinite scroll — render nothing (or a "Load more" button) instead.
- Combine with your own keyboard handling. Focus and activation are native `<button>` behaviour.
- Show more than ~7 numbers at once. The ellipsis logic keeps the footprint small even at page 1 of 1000.
