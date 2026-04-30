import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children as text content", () => {
    const { container } = render(<Badge>Test Badge</Badge>);
    expect(container.textContent).toBe("Test Badge");
  });

  it("renders as a <span> element", () => {
    const { container } = render(<Badge>Span</Badge>);
    expect(container.querySelector("span")).not.toBeNull();
  });

  it("defaults to 'muted' tone classes", () => {
    const { getByText } = render(<Badge>Default</Badge>);
    const badge = getByText("Default");
    expect(badge.className).toContain("text-[--text-secondary]");
    expect(badge.className).toContain("border-[--border]");
  });

  it("applies accent tone classes", () => {
    const { getByText } = render(<Badge tone="accent">Accent</Badge>);
    const badge = getByText("Accent");
    expect(badge.className).toContain("text-[--accent]");
    expect(badge.className).toContain("border-[--accent]");
  });

  it("applies success tone classes", () => {
    const { getByText } = render(<Badge tone="success">Active</Badge>);
    const badge = getByText("Active");
    expect(badge.className).toContain("text-[--color-success");
  });

  it("applies danger tone classes", () => {
    const { getByText } = render(<Badge tone="danger">Error</Badge>);
    const badge = getByText("Error");
    expect(badge.className).toContain("text-[--color-danger]");
  });

  it("applies base styling classes (rounded-full, uppercase, tracking)", () => {
    const { getByText } = render(<Badge>Styled</Badge>);
    const badge = getByText("Styled");
    expect(badge.className).toContain("rounded-full");
    expect(badge.className).toContain("uppercase");
    expect(badge.className).toContain("tracking-");
  });

  it("merges custom className", () => {
    const { getByText } = render(
      <Badge className="my-custom-class">Custom</Badge>,
    );
    const badge = getByText("Custom");
    expect(badge.className).toContain("my-custom-class");
  });

  it("passes through additional HTML attributes", () => {
    const { getByTestId } = render(
      <Badge data-testid="badge-test">Attr</Badge>,
    );
    expect(getByTestId("badge-test")).toBeTruthy();
  });
});
