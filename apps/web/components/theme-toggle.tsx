"use client"

import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"

const THEME_STORAGE_KEY = "wds-theme"

type ThemeMode = "dark" | "light"

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    const nextTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light"

    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    setMounted(true)
  }, [])

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark"

    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  const isDark = theme === "dark"

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-primary] transition-colors hover:border-[--accent] hover:text-[--accent]"
      onClick={toggleTheme}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.span>
        ) : (
          <span className="flex h-[18px] w-[18px] items-center justify-center" />
        )}
      </AnimatePresence>
    </button>
  )
}
