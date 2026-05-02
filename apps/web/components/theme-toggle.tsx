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
      className="inline-flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
      onClick={toggleTheme}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </motion.span>
        ) : (
          <span className="flex h-[15px] w-[15px] items-center justify-center" />
        )}
      </AnimatePresence>
    </button>
  )
}
