---
description: Vitest testing patterns, workspace configuration, and best practices for this monorepo
---

# Vitest 4.1.4 — Reference Guide

## Workspace Configuration

```ts
// vitest.workspace.ts
import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
  {
    test: {
      name: "web",
      root: "./apps/web",
      environment: "jsdom",   // Browser-like env for React components
      globals: true,           // No need to import describe/it/expect
      setupFiles: ["./setup-tests.ts"],
    },
  },
  {
    test: {
      name: "ui",
      root: "./packages/ui",
      environment: "jsdom",
      globals: true,
      setupFiles: ["./setup-tests.ts"],
    },
  },
  {
    test: {
      name: "db",
      root: "./packages/db",
      environment: "node",     // Server-only, no DOM
      globals: true,
    },
  },
])
```

## Test File Patterns

### Pure Function Tests
```ts
import { describe, expect, it } from "vitest"
import { myFunction } from "./my-module"

describe("myFunction", () => {
  it("handles the happy path", () => {
    expect(myFunction("input")).toBe("expected")
  })

  it("handles edge cases", () => {
    expect(myFunction("")).toBe("fallback")
    expect(myFunction(undefined)).toBe("default")
  })
})
```

### React Component Tests
```tsx
import { render, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Button } from "./button"

describe("Button", () => {
  it("renders children", () => {
    const { getByText } = render(<Button>Click</Button>)
    expect(getByText("Click")).toBeTruthy()
  })

  it("fires onClick", () => {
    const onClick = vi.fn()
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("respects disabled state", () => {
    const onClick = vi.fn()
    const { getByRole } = render(<Button disabled onClick={onClick}>No</Button>)
    fireEvent.click(getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})
```

### Factory Pattern for Mocks
```ts
function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-id",
    name: "Test Product",
    slug: "test-product",
    price: "100.00",
    category: "ai-assistant",
    isActive: true,
    ...overrides,
  } as Product
}
```

## Commands
```bash
bun run test              # Run all workspaces via Turborepo
bunx vitest run           # Run tests once (CI mode)
bunx vitest               # Run in watch mode (dev)
bunx vitest --coverage    # Run with coverage report
```

## Assertion Best Practices

| Weak (Avoid) | Strong (Prefer) |
|---|---|
| `expect(result).toBeDefined()` | `expect(result).toBe("exact value")` |
| `expect(result).toContain("500")` | `expect(result).toBe("₱500")` |
| `expect(typeof result).toBe("string")` | `expect(result).toBe("expected string")` |
| `expect(arr.length).toBe(1)` | `expect(arr).toHaveLength(1)` |

## Test Organization
1. **Co-locate tests** with source files (`catalog.ts` → `catalog.test.ts`)
2. **Use `describe` blocks** to group by function/component
3. **Test happy path first**, then edge cases, then error cases
4. **Use factory functions** for mock data — avoid raw object literals
5. **One assertion per test** when testing specific behaviors
6. **Use `vi.fn()`** for callback/handler verification
