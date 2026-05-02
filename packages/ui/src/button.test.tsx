import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonStyles } from "./button";

describe("Button", () => {
  it("renders children correctly", () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("renders as a <button> element", () => {
    const { getByRole } = render(<Button>Btn</Button>);
    expect(getByRole("button")).toBeTruthy();
  });

  it("defaults to type='button' (not 'submit')", () => {
    const { getByRole } = render(<Button>Default Type</Button>);
    const button = getByRole("button") as HTMLButtonElement;
    expect(button.type).toBe("button");
  });

  it("respects an explicit type='submit'", () => {
    const { getByRole } = render(<Button type="submit">Submit</Button>);
    const button = getByRole("button") as HTMLButtonElement;
    expect(button.type).toBe("submit");
  });

  describe("variants", () => {
    it("applies accent (default) variant classes", () => {
      const { getByRole } = render(<Button>Accent</Button>);
      const button = getByRole("button");
      // Accent (default) is now ink-on-cream — the primary CTA
      expect(button.className).toContain("bg-[--text-primary]");
      expect(button.className).toContain("text-[--bg-base]");
    });

    it("applies ghost variant classes", () => {
      const { getByRole } = render(<Button variant="ghost">Ghost</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("border-[--border-strong]");
      expect(button.className).toContain("text-[--text-primary]");
    });

    it("applies surface variant classes", () => {
      const { getByRole } = render(<Button variant="surface">Surface</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("bg-[--bg-card]");
    });

    it("applies icon variant classes", () => {
      const { getByRole } = render(<Button variant="icon">🔍</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("h-10");
      expect(button.className).toContain("w-10");
    });
  });

  describe("sizes", () => {
    it("applies small size classes", () => {
      const { getByRole } = render(<Button size="sm">Small</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("h-10");
      expect(button.className).toContain("px-4");
    });

    it("applies medium (default) size classes", () => {
      const { getByRole } = render(<Button>Medium</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("h-11");
      expect(button.className).toContain("px-5");
    });

    it("applies large size classes", () => {
      const { getByRole } = render(<Button size="lg">Large</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("h-12");
      expect(button.className).toContain("px-6");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);
      const button = getByRole("button") as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it("applies disabled opacity styling", () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("disabled:opacity-50");
    });

    it("does not fire click handler when disabled", () => {
      const onClick = vi.fn();
      const { getByRole } = render(
        <Button disabled onClick={onClick}>
          No Click
        </Button>,
      );
      fireEvent.click(getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("interaction", () => {
    it("fires onClick when clicked", () => {
      const onClick = vi.fn();
      const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
      fireEvent.click(getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("className merging", () => {
    it("merges custom className prop", () => {
      const { getByRole } = render(<Button className="my-class">Merge</Button>);
      const button = getByRole("button");
      expect(button.className).toContain("my-class");
      expect(button.className).toContain("rounded-[--radius-inner]");
    });
  });
});

describe("buttonStyles", () => {
  it("returns a class string with base styles", () => {
    const result = buttonStyles({});
    expect(result).toContain("rounded-[--radius-inner]");
    expect(result).toContain("font-semibold");
    expect(result).toContain("transition-");
  });

  it("applies accent variant by default", () => {
    const result = buttonStyles({});
    expect(result).toContain("bg-[--text-primary]");
  });

  it("applies specified variant", () => {
    const result = buttonStyles({ variant: "ghost" });
    expect(result).toContain("border-[--border-strong]");
    // Ghost has transparent base bg; only `hover:bg-[--text-primary]` mentions ink
    expect(result).toContain("bg-transparent");
  });

  it("applies specified size", () => {
    const result = buttonStyles({ size: "lg" });
    expect(result).toContain("h-12");
    expect(result).toContain("px-6");
  });

  it("skips size classes for icon variant", () => {
    const result = buttonStyles({ variant: "icon" });
    expect(result).not.toContain("h-11");
    expect(result).not.toContain("px-5");
  });

  it("merges custom className", () => {
    const result = buttonStyles({ className: "justify-center px-8" });
    expect(result).toContain("justify-center");
    expect(result).toContain("px-8");
  });
});
