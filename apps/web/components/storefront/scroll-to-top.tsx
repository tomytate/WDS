"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return (
    <button
      aria-label="Scroll to top"
      className={`fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-[--text-secondary] shadow-elevated transition-all duration-300 hover:text-[--accent] group ${
        visible
          ? "bottom-40 md:bottom-[5.5rem] translate-y-0 opacity-100"
          : "bottom-40 md:bottom-[5.5rem] translate-y-4 opacity-0 pointer-events-none"
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      type="button"
    >
      <div className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--bg-card)_85%,transparent)] backdrop-blur-xl border border-[color-mix(in_srgb,var(--border)_50%,transparent)] group-hover:border-[--accent-tint-strong] transition-colors duration-300" />

      {/* SVG Progress Ring */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-[--accent] drop-shadow-[0_0_8px_var(--accent-glow)]"
          style={{ pathLength: smoothedProgress }}
        />
      </svg>

      <ArrowUp
        size={18}
        className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
