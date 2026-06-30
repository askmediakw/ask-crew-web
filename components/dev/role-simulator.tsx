'use client'

import { useEffect, useRef, useState } from 'react'
import { UserCog, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDevTools, SIM_ROLES } from '@/lib/dev-tools'

// ============================================================================
// ROLE SIMULATOR TOGGLE (#17)
// ----------------------------------------------------------------------------
// Header dropdown letting the admin preview the UI as any role instantly,
// with no backend round-trip. Reads/writes the shared dev-tools state.
// ============================================================================

export function RoleSimulator() {
  const { simulatedRole, setSimulatedRole, logAction } = useDevTools()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2.5 text-xs font-bold text-foreground transition hover:bg-white/10"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserCog className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{simulatedRole}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
          <p className="border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            معاينة كـ (محاكاة)
          </p>
          {SIM_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSimulatedRole(role)
                logAction('تبديل الدور (محاكاة)', role)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-right text-sm transition hover:bg-white/5"
            >
              <span className={cn(role === simulatedRole ? 'font-bold text-primary' : 'text-foreground')}>
                {role}
              </span>
              {role === simulatedRole && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
