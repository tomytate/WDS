"use client"

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react"

import { cn } from "./cn"

/**
 * Tabs — keyboard-accessible tablist following the ARIA Authoring Practices pattern.
 *
 * Accessibility:
 *   • `role="tablist"` + `role="tab"` + `role="tabpanel"` are wired correctly.
 *   • ArrowLeft / ArrowRight / Home / End move focus & activate the tab (automatic activation).
 *   • Active tab has `aria-selected="true"` and `tabIndex={0}`; others get `tabIndex={-1}`.
 *   • Panels are `aria-labelledby` their tab and `tabIndex={0}` so SR users can focus into them.
 *
 * Usage:
 *   <Tabs defaultValue="orders">
 *     <Tabs.List aria-label="Dashboard sections">
 *       <Tabs.Trigger value="orders">Orders</Tabs.Trigger>
 *       <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Panel value="orders">…</Tabs.Panel>
 *     <Tabs.Panel value="reviews">…</Tabs.Panel>
 *   </Tabs>
 */

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
  idPrefix: string
  registerTrigger: (value: string, node: HTMLButtonElement | null) => void
  focusTrigger: (value: string) => void
  triggerOrder: () => string[]
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("Tabs.* must be rendered inside <Tabs>")
  return ctx
}

type TabsProps = {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
}

export function Tabs({ defaultValue, value: controlled, onValueChange, className, children }: TabsProps) {
  const idPrefix = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlled ?? internalValue
  const triggerMap = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const orderRef = useRef<string[]>([])

  const setValue = useCallback(
    (next: string) => {
      if (controlled === undefined) setInternalValue(next)
      onValueChange?.(next)
    },
    [controlled, onValueChange],
  )

  const registerTrigger = useCallback((val: string, node: HTMLButtonElement | null) => {
    if (node) {
      triggerMap.current.set(val, node)
      if (!orderRef.current.includes(val)) orderRef.current.push(val)
    } else {
      triggerMap.current.delete(val)
      orderRef.current = orderRef.current.filter((v) => v !== val)
    }
  }, [])

  const focusTrigger = useCallback((val: string) => {
    triggerMap.current.get(val)?.focus()
  }, [])

  const triggerOrder = useCallback(() => orderRef.current.slice(), [])

  return (
    <TabsContext.Provider value={{ value, setValue, idPrefix, registerTrigger, focusTrigger, triggerOrder }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

type TabsListProps = HTMLAttributes<HTMLDivElement>

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn("flex flex-wrap gap-1 border-b border-[--border]", className)}
      {...props}
    >
      {children}
    </div>
  )
}

type TabsTriggerProps = {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const ctx = useTabsContext()
  const selected = ctx.value === value
  const ref = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    ctx.registerTrigger(value, ref.current)
    return () => ctx.registerTrigger(value, null)
  }, [ctx, value])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const order = ctx.triggerOrder()
    const idx = order.indexOf(value)
    if (idx < 0) return
    let nextIdx = -1
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length
    else if (e.key === "Home") nextIdx = 0
    else if (e.key === "End") nextIdx = order.length - 1
    else return
    const nextVal = order[nextIdx]
    if (!nextVal) return
    e.preventDefault()
    ctx.setValue(nextVal)
    ctx.focusTrigger(nextVal)
  }

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${ctx.idPrefix}-tab-${value}`}
      aria-controls={`${ctx.idPrefix}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-150 -mb-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--text-primary]",
        selected
          ? "border-b-2 border-[--text-primary] text-[--text-primary]"
          : "border-b-2 border-transparent text-[--text-secondary] hover:text-[--text-primary]",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </button>
  )
}

type TabsPanelProps = HTMLAttributes<HTMLDivElement> & { value: string }

function TabsPanel({ value, className, children, ...props }: TabsPanelProps) {
  const ctx = useTabsContext()
  const selected = ctx.value === value

  return (
    <div
      role="tabpanel"
      id={`${ctx.idPrefix}-panel-${value}`}
      aria-labelledby={`${ctx.idPrefix}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cn("py-4 focus-visible:outline-none", className)}
      {...props}
    >
      {selected ? children : null}
    </div>
  )
}

// Attach sub-components for a clean composable API.
Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Panel = TabsPanel

// Help tree-shakers / linters see the attachments.
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsPanelProps }

// Tiny escape-hatch: lets consumers reach the generic child-clone helper if they build custom triggers.
export function mapTabChildren(children: ReactNode, transform: (el: ReactElement) => ReactElement) {
  return Children.map(children, (child) => (isValidElement(child) ? transform(child) : child))
    ?.filter(Boolean)
    ?.map((c, i) => (isValidElement(c) ? cloneElement(c, { key: i }) : c))
}
