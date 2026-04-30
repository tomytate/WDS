import { describe, expect, it } from "vitest"
import { handlingHoursLabel } from "./urgency"

describe("Urgency Module", () => {
  it("exports the exact handling hours label", () => {
    expect(handlingHoursLabel).toBe("24/7 — Always Open")
  })

  it("is a non-empty string", () => {
    expect(typeof handlingHoursLabel).toBe("string")
    expect(handlingHoursLabel.length).toBeGreaterThan(0)
  })

  it("indicates 24/7 availability", () => {
    expect(handlingHoursLabel).toContain("24/7")
  })
})
