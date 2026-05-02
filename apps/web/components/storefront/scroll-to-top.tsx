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
      className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-[--radius-inner] text-[--text-primary] transition-all duration-200 group ${
        visible
          ? "bottom-40 md:bottom-[5.5rem] translate-y-0 opacity-100"
          : "bottom-40 md:bottom-[5.5rem] translate-y-3 opacity-0 pointer-events-none"
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      type="button"
    >
      <div className="absolute inset-0 rounded-[--radius-inner] bg-[--bg-card] border border-[--border] group-hover:border-[--text-primary] transition-colors duration-200" />

      <svg
        className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="square"
          className="text-[--accent]"
          style={{ pathLength: smoothedProgress }}
        />
      </svg>

      <ArrowUp
        size={15}
        strokeWidth={1.75}
        className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
