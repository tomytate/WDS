---
description: React 19.2.5 features, hooks, ViewTransition, and patterns for modern component development
---

# React 19.2.5 — Reference Guide

## What Changed in 19.2.5 (April 8, 2026)
- **React Server Components**: Added more cycle protections (#36236 by @eps1lon and @unstubbable)
- This prevents infinite loops when Server Components reference each other in circular patterns
- No API changes — purely a runtime stability fix

## New APIs & Hooks

### `use()` — Read Promises & Context in Render
- Unlike hooks, `use()` **can** be called inside `if` blocks, loops, and conditionals
- When reading a Promise, the component suspends until resolved
- Must wrap in `<Suspense>` + `<ErrorBoundary>`

```tsx
function DataComponent({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise)
  return <div>{data.message}</div>
}
```

### `useActionState()` — Form Action State
- Simplifies managing state for server actions
- Returns `[state, formAction, isPending]`

```tsx
const [state, formAction, isPending] = useActionState(myServerAction, initialState)
```

### `useFormStatus()` — Parent Form Status
- Access pending state of a parent `<form>` from child components
- Must be rendered inside a `<form>` element

```tsx
function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Submit</button>
}
```

### `useOptimistic()` — Optimistic UI Updates
- Update UI immediately while async mutation runs in background

```tsx
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, newItem) => [...state, newItem])
```

### `useTransition()` — Non-blocking State Updates
- Already used in the OrderForm for non-blocking form submission
- Returns `[isPending, startTransition]`

## `<ViewTransition>` Component (New in React 19)
- GPU-accelerated transitions between DOM states (page navigations, state changes)
- Browser manages animation via snapshots — no JS animation overhead
- Works with Next.js App Router for route transitions

```tsx
import { unstable_ViewTransition as ViewTransition } from "react"

// Wrap content that should animate on state/route changes
<ViewTransition>
  <main>{children}</main>
</ViewTransition>
```

**CSS Customization:**
```css
::view-transition-old(root) {
  animation: fade-out 200ms ease-out;
}
::view-transition-new(root) {
  animation: fade-in 200ms ease-in;
}
/* Named transitions for shared elements */
.product-card {
  view-transition-name: product-card;
}
```

**Progressive Enhancement**: Falls back to instant navigation on browsers without View Transition API support.

## React Compiler
- Enabled via `reactCompiler: true` in next.config.ts
- Automatically memoizes components — eliminates manual `useMemo`/`useCallback`/`memo`
- Components still re-render when their props actually change
- No code changes needed — it's a build-time optimization

## Patterns Used in This Project

### Server Components (Default)
- All components in `app/` are Server Components by default
- Can `async/await` directly, access DB, read env vars
- Cannot use hooks, event handlers, or browser APIs

### Client Components (`"use client"`)
- Needed for: hooks, event handlers, browser APIs, interactive UI
- Place the `"use client"` directive at the top of the file
- Keep client boundaries as low in the tree as possible

### Suspense Boundaries
```tsx
export default function Page({ searchParams }: Props) {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<PageFallback />}>
        <PageContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </main>
  )
}
```

### Form Handling with `useForm` + Server Actions
```tsx
// Client: collect form data with react-hook-form
const form = useForm<OrderFormValues>({ defaultValues: { ... } })

// Submit: serialize to FormData → call server action
startTransition(async () => {
  const formData = new FormData()
  // ... populate formData
  const result = await createOrder(formData)
})
```

## Native Metadata Support
- Render `<title>`, `<link>`, `<meta>` directly in components
- Next.js deduplicates automatically

## Best Practices
1. **Prefer Server Components** for data fetching — no loading states needed
2. **Use `<Suspense>`** to stream heavy sections without blocking the page
3. **Avoid `useEffect` for data fetching** — use Server Components or `use()`
4. **Keep client boundaries narrow** — only wrap interactive parts
5. **Use `startTransition`** for non-urgent state updates
6. **Use `<ViewTransition>`** for GPU-accelerated route/state transitions (progressive enhancement)
