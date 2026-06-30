'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ============================================================================
// GLOBAL THEME CONTEXT (#9)
// ----------------------------------------------------------------------------
// Toggles a `.light` class on <html>; CSS variables in globals.css handle the
// rest. const { theme, toggleTheme } = useTheme()
// ============================================================================

type Theme = 'dark' | 'light'
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('os_theme') as Theme | null) ?? 'dark'
    setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
    localStorage.setItem('os_theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeContext.Provider>
  )
}
