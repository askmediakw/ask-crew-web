'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale, type Locale } from '@/lib/locale'

// ============================================================================
// GLOBAL HEADER LANGUAGE SWITCHER
// ----------------------------------------------------------------------------
// A minimalistic Globe icon in the top navigation bar. Clicking it opens an
// elegant dropdown with "English (LTR)" / "العربية (RTL)". Selecting an option
// drives <LocaleProvider>, which flips the ENTIRE dashboard direction (RTL/LTR)
// instantly and persists the preference across all pages.
// ============================================================================

const OPTIONS: { value: Locale; label: string; dir: string }[] = [
  { value: 'en', label: 'English', dir: 'LTR' },
  { value: 'ar', label: 'العربية', dir: 'RTL' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="تغيير لغة الواجهة / Change interface language"
        className={cn(
          'flex items-center gap-1.5 rounded-xl border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground',
          open ? 'border-primary/50 text-foreground' : 'border-border',
        )}
      >
        <Globe className="h-5 w-5" />
        <span className="text-xs font-bold uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-48 origin-top overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-border px-4 py-2.5">
            <p className="text-xs font-bold text-foreground">اللغة / Language</p>
          </div>
          <div className="p-1.5">
            {OPTIONS.map((opt) => {
              const active = locale === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setLocale(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition',
                    active
                      ? 'bg-primary/10 font-bold text-foreground'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {opt.label}
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                      {opt.dir}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
