---
description: Motion 12.38 (framer-motion) animation patterns, hooks, and conventions for React components
---

# Motion 12.38.0 — Reference Guide

## Import Convention

**CRITICAL**: Always use the v12+ API path:
```tsx
// ✅ Correct
import { motion, AnimatePresence, useInView } from "motion/react"

// ❌ Wrong (legacy — breaks tree-shaking, deprecated in v12)
import { motion } from "framer-motion"
```

## Core APIs

### `motion.*` — Animated HTML Elements
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  Content
</motion.div>
```

### `AnimatePresence` — Exit Animations
```tsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="unique-key"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Disappearing content
    </motion.div>
  )}
</AnimatePresence>
```

### `useInView` — Scroll-Triggered Animations
```tsx
const ref = useRef<HTMLDivElement>(null)
const isInView = useInView(ref, { once: true, margin: "-80px" })

<motion.div
  ref={ref}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
  initial={{ opacity: 0, y: 24 }}
  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
/>
```

### `layoutId` — Shared Layout Animations
```tsx
// Element morphs between positions when layoutId matches
<motion.div layoutId="active-filter">
  {activeFilter}
</motion.div>
```

### `layoutAnchor` (New in 12.38.0)
- Configure custom anchor point for resolving relative projection boxes
- Useful for complex layout animations with non-standard origins

## Staggered Children Pattern
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.div key={i.id} variants={item}>{i.name}</motion.div>
  ))}
</motion.div>
```

## Easing Presets Used in This Project

| Name | Value | Usage |
|---|---|---|
| Default ease | `[0.25, 0.4, 0.25, 1]` | ScrollReveal entrance |
| Spring bounce | `[0.34, 1.56, 0.64, 1]` | Success checkmark scale |
| Ease out | `"easeOut"` | General fade-in |
| Spring | `{ type: "spring", stiffness: 300, damping: 30 }` | Interactive elements |

## Project Patterns

### ScrollReveal Component
```tsx
// components/scroll-reveal.tsx — wraps sections for fade-in-on-scroll
<ScrollReveal delay={0.1} y={24}>
  <section>...</section>
</ScrollReveal>
```

### Step Transitions (Order Form)
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={`step-${currentStep}`}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <CurrentStepComponent />
  </motion.div>
</AnimatePresence>
```

### Icon Rotation (Theme Toggle, Accordion)
```tsx
<motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
  <ChevronDown size={20} />
</motion.div>
```

### Scale Entrance (Success Checkmark)
```tsx
<motion.div
  initial={{ scale: 0.5, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
/>
```

## v12.38.0 Changelog (March 2026)
- **Added**: `layoutAnchor` prop for custom anchor points in layout animations
- **Fixed**: `Reorder` axis switching after window resize
- **Fixed**: `Reorder` with virtualised lists
- **Fixed**: `AnimatePresence` children removal when exit animation matches current values

## Performance
- Motion is tree-shakeable — only imported APIs are bundled
- Listed in `optimizePackageImports` in `next.config.ts` for optimal Next.js bundling
- Use `will-change: transform` sparingly — only on actively animating elements
- Prefer `opacity` and `transform` animations (GPU-accelerated, no layout thrashing)

## Best Practices
1. **Always use `"motion/react"`** import path — never `"framer-motion"`
2. **Use `AnimatePresence mode="wait"`** for route/step transitions
3. **Use `useInView` with `once: true`** for scroll reveals — prevents re-triggering
4. **Use `layoutId`** for shared element transitions (filter pills, tab indicators)
5. **Prefer spring physics** for interactive elements (buttons, toggles)
6. **Respect `prefers-reduced-motion`** — disable animations in CSS for a11y
7. **Keep `transition.duration` under 500ms** — users perceive >500ms as slow
8. **Consider CSS `starting:` variant** for simple fade/slide entrances — zero JS, GPU-accelerated (Tailwind 4's `starting:` maps to `@starting-style`)

## When to Use Motion vs CSS `starting:`

| Use Case | Use Motion | Use CSS `starting:` |
|---|---|---|
| Simple fade-in on mount | ❌ | ✅ |
| Staggered children | ✅ | ❌ |
| Spring physics | ✅ | ❌ |
| Scroll-triggered reveals | ✅ | ❌ |
| Shared element (layoutId) | ✅ | ❌ |
| Dialog/sheet enter/exit | ❌ | ✅ |
| Route transitions | ✅ | ❌ |
