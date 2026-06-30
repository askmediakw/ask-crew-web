'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import i18n from '@/lib/i18n'

// ============================================================================
// GLOBAL LOCALE / DIRECTION CONTEXT (#20)
// ----------------------------------------------------------------------------
// Switches the platform language and flips layout direction (RTL/LTR) by
// setting `dir` + `lang` on <html>. Tailwind's logical properties + the
// existing RTL layout adapt automatically.
//
// This is the single source of truth for both direction AND language: it
// drives the react-i18next instance (see lib/i18n) via changeLanguage, so the
// same toggle swaps translated copy and RTL/LTR layout together.
//   const { locale, dir, setLocale, toggleLocale } = useLocale()
// ============================================================================

export type Locale = 'ar' | 'en'
type Dir = 'rtl' | 'ltr'

const LocaleContext = createContext<{
  locale: Locale
  dir: Dir
  setLocale: (l: Locale) => void
  toggleLocale: () => void
} | null>(null)

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>')
  return ctx
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar')

  useEffect(() => {
    const stored = (localStorage.getItem('os_locale') as Locale | null) ?? 'ar'
    setLocaleState(stored)
  }, [])

  useEffect(() => {
    const dir: Dir = locale === 'ar' ? 'rtl' : 'ltr'
    const root = document.documentElement
    root.setAttribute('dir', dir)
    root.setAttribute('lang', locale)
    localStorage.setItem('os_locale', locale)
    // Drive the i18next translation layer from the locale state.
    if (i18n.language !== locale) i18n.changeLanguage(locale)
  }, [locale])

  const dir: Dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dir,
        setLocale: setLocaleState,
        toggleLocale: () => setLocaleState((l) => (l === 'ar' ? 'en' : 'ar')),
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}
