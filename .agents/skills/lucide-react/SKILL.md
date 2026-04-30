---
description: Lucide React 1.8.0 icon library — tree-shakeable SVG icons for React components
---

# Lucide React 1.8.0 — Reference Guide

## Installation & Setup
```bash
bun add lucide-react
```

Add to `optimizePackageImports` in `next.config.ts` for optimal tree-shaking:
```ts
experimental: {
  optimizePackageImports: ["lucide-react", /* ...other packages */],
}
```

## Import Pattern
```tsx
// Named imports — each icon is individually tree-shaken
import { ShoppingCart, User, Settings, ChevronDown } from "lucide-react"
```

**Never do**:
```tsx
// ❌ This imports the entire icon set (~200KB)
import * as Icons from "lucide-react"
```

## Usage
```tsx
// Default size is 24px, stroke-width 2
<ShoppingCart />

// Custom size and color
<ShoppingCart size={20} className="text-[--accent]" />

// With strokeWidth
<ChevronDown size={16} strokeWidth={2.5} />

// As button icon
<Button leftIcon={<ShoppingCart size={18} />}>Add to Cart</Button>
```

## Icon Map for This Project

### Storefront
| Usage | Icon | Import |
|---|---|---|
| Cart / Shopping | `ShoppingCart` | `import { ShoppingCart } from "lucide-react"` |
| Mobile menu open | `Menu` | `import { Menu } from "lucide-react"` |
| Mobile menu close | `X` | `import { X } from "lucide-react"` |
| Product order | `ShoppingBag` | `import { ShoppingBag } from "lucide-react"` |
| User/customer | `User` | `import { User } from "lucide-react"` |
| QR/Payment | `QrCode` | `import { QrCode } from "lucide-react"` |
| Review/clipboard | `ClipboardCheck` | `import { ClipboardCheck } from "lucide-react"` |
| Back arrow | `ArrowLeft` | `import { ArrowLeft } from "lucide-react"` |
| Forward arrow | `ArrowRight` | `import { ArrowRight } from "lucide-react"` |
| Check mark | `Check` | `import { Check } from "lucide-react"` |
| Check circle | `CheckCircle` | `import { CheckCircle } from "lucide-react"` |
| Copy | `Copy` | `import { Copy } from "lucide-react"` |
| Expand/collapse | `ChevronDown` | `import { ChevronDown } from "lucide-react"` |
| Scroll to top | `ChevronUp` | `import { ChevronUp } from "lucide-react"` |
| Loading spinner | `Loader2` | `import { Loader2 } from "lucide-react"` |
| Upload | `Upload` | `import { Upload } from "lucide-react"` |
| Search | `Search` | `import { Search } from "lucide-react"` |

### Trust Bar / Why Us
| Usage | Icon | Replaces |
|---|---|---|
| Premium quality | `Sparkles` | `✦` emoji |
| Infinite / lifetime | `Infinity` | `∞` emoji |
| Growth / services | `TrendingUp` | `◎` emoji |
| Fast delivery | `Zap` | `⚡` emoji |
| Payment / price | `Banknote` | `₱` emoji |
| Exchange / refund | `RefreshCw` | `⇄` emoji |
| Time / clock | `Clock` | `⏱` emoji |

### Dashboard
| Usage | Icon | Import |
|---|---|---|
| Overview | `LayoutGrid` | `import { LayoutGrid } from "lucide-react"` |
| Orders | `ClipboardList` | `import { ClipboardList } from "lucide-react"` |
| Products | `Package` | `import { Package } from "lucide-react"` |
| Customers | `Users` | `import { Users } from "lucide-react"` |
| Settings | `Settings` | `import { Settings } from "lucide-react"` |
| Trend up | `TrendingUp` | `import { TrendingUp } from "lucide-react"` |
| Trend down | `TrendingDown` | `import { TrendingDown } from "lucide-react"` |

### Theme Toggle
| Usage | Icon | Replaces |
|---|---|---|
| Light mode | `Sun` | `☀` emoji |
| Dark mode | `Moon` | `☾` emoji |

### Social / Communication
| Usage | Icon | Import |
|---|---|---|
| Facebook | `Facebook` | `import { Facebook } from "lucide-react"` |
| Telegram | `MessageCircle` | `import { MessageCircle } from "lucide-react"` |
| Email | `Mail` | `import { Mail } from "lucide-react"` |
| External link | `ExternalLink` | `import { ExternalLink } from "lucide-react"` |

## Sizing Convention

| Context | Size | Usage |
|---|---|---|
| Inline with text | `16` | Badges, small buttons |
| Button icons | `18` | Left/right icon in buttons |
| Standalone icons | `20` | Nav items, card actions |
| Feature icons | `24` | Section icons, hero elements |
| Hero / large display | `32-40` | Success checkmark, empty states |

## Props Reference
```ts
interface LucideProps {
  size?: number | string     // Width & height (default: 24)
  color?: string             // Stroke color (default: currentColor)
  strokeWidth?: number       // Stroke width (default: 2)
  className?: string         // CSS classes
  absoluteStrokeWidth?: boolean  // Ignore size for stroke width
}
```

## Best Practices
1. **Always use named imports** — tree-shaking only works with named imports
2. **Use `currentColor`** (default) — icon inherits text color from parent
3. **Set `size` explicitly** — don't rely on the 24px default in tight layouts
4. **Use `aria-hidden="true"`** on decorative icons (Lucide adds this by default)
5. **Use `className` for colors** — prefer `className="text-[--accent]"` over `color` prop
6. **Add to `optimizePackageImports`** — ensures proper tree-shaking in Next.js
