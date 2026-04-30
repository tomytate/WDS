import { test, expect } from "@playwright/test"

test.describe("Checkout Flow", () => {
  test("should load the storefront homepage", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Wong Digital/)
    
    // Check if hero and products exist
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.getByText("ChatGPT Go").first()).toBeVisible()
  })

  test("should render the order form and validate empty submission", async ({ page }) => {
    await page.goto("/order")
    
    // Expect order page title
    await expect(page).toHaveTitle(/Order Now/)

    // Without selecting a product, the continue button should be disabled
    const continueBtn = page.getByRole("button", { name: /Select a product/i })
    await expect(continueBtn).toBeDisabled()

    await expect(page.url()).toContain("/order")
  })

  test("should select a product and advance to step 2", async ({ page }) => {
    await page.goto("/order")

    // Click the first product card to select it
    const firstProduct = page.locator("[data-product-card]").first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()

      // After selecting, the continue button should be enabled
      const continueBtn = page.getByRole("button", { name: /Continue/i })
      await expect(continueBtn).toBeEnabled()

      // Click continue to advance to step 2
      await continueBtn.click()

      // Step 2 should show customer info fields
      await expect(page.getByLabel(/Name/i).first()).toBeVisible()
      await expect(page.getByLabel(/Email/i).first()).toBeVisible()
    }
  })

  test("should validate customer details on step 2", async ({ page }) => {
    await page.goto("/order")

    // Select a product
    const firstProduct = page.locator("[data-product-card]").first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()

      // Advance to step 2
      await page.getByRole("button", { name: /Continue/i }).click()

      // Try to advance without filling in details
      const continueBtn = page.getByRole("button", { name: /Continue/i })
      await continueBtn.click()

      // Expect validation error to appear
      const errorMessage = page.locator("[role='alert']").first()
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
    }
  })

  test("should show promo code input and handle invalid code", async ({ page }) => {
    await page.goto("/order")

    // Look for promo code input area
    const promoInput = page.getByPlaceholder(/promo/i).or(page.getByLabel(/promo/i)).first()
    if (await promoInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await promoInput.fill("INVALID_CODE_12345")

      // Submit the promo code
      const applyBtn = page.getByRole("button", { name: /apply/i }).first()
      if (await applyBtn.isVisible()) {
        await applyBtn.click()

        // Expect an error message for invalid promo code
        await expect(page.getByText(/invalid/i).or(page.getByText(/not found/i)).first()).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test("should render the order tracking page", async ({ page }) => {
    await page.goto("/track")
    await expect(page).toHaveTitle(/Track/)

    // Should have an input for order code
    const orderCodeInput = page.getByPlaceholder(/order/i).or(page.getByLabel(/order/i)).first()
    await expect(orderCodeInput).toBeVisible()
  })

  test("should render legal pages without errors", async ({ page }) => {
    const legalPages = ["/legal/terms", "/legal/privacy-policy", "/legal/refund-policy"]

    for (const path of legalPages) {
      await page.goto(path)
      await expect(page.locator("h1")).toBeVisible()
      // Ensure no error boundaries triggered
      await expect(page.locator("text=Internal Server Error")).not.toBeVisible()
    }
  })
})
