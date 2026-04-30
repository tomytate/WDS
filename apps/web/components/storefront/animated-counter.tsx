"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";

export function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayValue(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="font-mono tabular-nums tracking-tight">
      {displayValue.toLocaleString()}
    </span>
  );
}
