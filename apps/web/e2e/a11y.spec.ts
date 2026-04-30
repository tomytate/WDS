import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * A11y smoke tests — walk the main public pages and fail on any AA violation.
 *
 * Dashboard pages are gated behind auth, so we can't hit them without a
 * test-user fixture. The storefront routes below are the pages a first-time
 * visitor actually lands on — if those pass AA, the blast radius of a
 * regression is contained to behind-auth surfaces.
 *
 * Per WCAG 2.2, we include `wcag22a` and `wcag22aa` tag sets.
 */
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const

const publicRoutes: Array<{ path: string; name: string }> = [
  { path: "/", name: "Home" },
  { path: "/products", name: "Products list" },
  { path: "/order", name: "Order / checkout" },
  { path: "/login", name: "Login" },
  { path: "/about", name: "About" },
]

for (const route of publicRoutes) {
  test(`${route.name} (${route.path}) is WCAG 2.2 AA clean`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "networkidle" })

    const results = await new AxeBuilder({ page })
      .withTags([...AXE_TAGS])
      .analyze()

    // Attach the full report to the test output for debugging if it fails.
    if (results.violations.length > 0) {
      console.warn(
        `\n[a11y] ${route.name} violations:\n` +
          results.violations
            .map(
              (v) =>
                `  - ${v.id} (${v.impact ?? "?"}): ${v.help}\n    ${v.helpUrl}\n    nodes: ${v.nodes
                  .map((n) => n.target.join(" "))
                  .join(", ")}`,
            )
            .join("\n"),
      )
    }

    expect(results.violations).toEqual([])
  })
}
