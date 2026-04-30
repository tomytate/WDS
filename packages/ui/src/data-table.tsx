import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react"

import { cn } from "./cn"

/**
 * DataTable — compositional wrappers around native `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>`.
 *
 * Why primitives rather than a column-driven `<Table columns={...} data={...}/>`?
 *   • Dashboard tables vary wildly in shape (sticky columns, nested forms inside cells, buttons, inputs).
 *     A declarative schema would become a mini-framework and slow every new page.
 *   • Styled wrappers give us one source of truth for padding / hover / divider / semantic `scope`
 *     without constraining how individual cells render.
 *
 * Usage:
 *   <DataTable.Root>
 *     <DataTable.Head>
 *       <DataTable.Row>
 *         <DataTable.HeaderCell>Customer</DataTable.HeaderCell>
 *         <DataTable.HeaderCell align="right">Amount</DataTable.HeaderCell>
 *       </DataTable.Row>
 *     </DataTable.Head>
 *     <DataTable.Body>
 *       {rows.map(r => (
 *         <DataTable.Row key={r.id}>
 *           <DataTable.Cell>{r.name}</DataTable.Cell>
 *           <DataTable.Cell align="right">{r.amount}</DataTable.Cell>
 *         </DataTable.Row>
 *       ))}
 *     </DataTable.Body>
 *   </DataTable.Root>
 *
 * Accessibility (verified):
 * - `HeaderCell` renders `<th scope="col">` by default (WCAG 1.3.1 / 4.1.2).
 *   Pass `scope="row"` for row headers.
 * - `Root` wraps the table in an `overflow-x-auto` container so mobile users can scroll horizontally
 *   without losing the focus-visible ring (WCAG 2.4.7).
 * - Pass `caption` to render a `<caption>` — always helpful for screen readers.
 */

type AlignProp = "left" | "center" | "right"

type RootProps = HTMLAttributes<HTMLDivElement> & {
  /** If provided, rendered as a `<caption>` element for screen-reader table labelling. */
  caption?: ReactNode
  /** Hide the caption visually but keep it available to screen readers. */
  captionVisuallyHidden?: boolean
}

function Root({ className, caption, captionVisuallyHidden = false, children, ...props }: RootProps) {
  return (
    <div
      className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}
      {...props}
    >
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[13px]">
        {caption ? (
          <caption
            className={cn(
              "caption-top pb-3 text-left text-[13px] text-[--text-secondary]",
              captionVisuallyHidden &&
                "sr-only",
            )}
          >
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </div>
  )
}

function Head({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}

function Body({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-[--border]", className)}
      {...props}
    />
  )
}

function Row({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        interactive &&
          "transition-colors hover:bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}

const alignClass: Record<AlignProp, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

function HeaderCell({
  className,
  align = "left",
  scope = "col",
  srLabel,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: AlignProp
  /** Adds a visually-hidden label for columns that only contain controls/icons. */
  srLabel?: string
}) {
  return (
    <th
      scope={scope}
      className={cn(
        "border-b border-[--border] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[--text-secondary]",
        alignClass[align],
        className,
      )}
      {...props}
    >
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
      {children}
    </th>
  )
}

function Cell({
  className,
  align = "left",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: AlignProp }) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 align-middle text-[--text-primary]",
        alignClass[align],
        className,
      )}
      {...props}
    />
  )
}

export const DataTable = { Root, Head, Body, Row, HeaderCell, Cell }
