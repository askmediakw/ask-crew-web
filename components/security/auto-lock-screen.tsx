'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// AUTO-LOCK SCREEN
// ----------------------------------------------------------------------------
// Locks the dashboard after a period of inactivity (default 15 min) and
// requires a PIN to resume. Demo PIN: 1234 (replace with a real backend
// verification call where indicated below).
// ============================================================================

const IDLE_MS = 15 * 60 * 1000 // 15 minutes
const DEMO_PIN = '1234'

export function AutoLockScreen() {
  const [locked, setLocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Idle detection — resets the countdown on any user interaction.
  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setLocked(true), IDLE_MS)
    }
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Focus the PIN field whenever the lock engages.
  useEffect(() => {
    if (locked) inputRef.current?.focus()
  }, [locked])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: BACKEND - verify the PIN against the session instead of the demo value.
    if (pin === DEMO_PIN) {
      setLocked(false)
      setPin('')
      setError(false)
    } else {
      setError(true)
      setPin('')
    }
  }

  if (!locked) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="شاشة قفل الجلسة"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 p-4 backdrop-blur-md"
    >
      <div className="glass w-full max-w-sm rounded-2xl border border-border p-8 text-center shadow-2xl animate-slide-up">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 glow-brand">
          <Image src="/logo.png" alt="شعار ASK CREW" width={48} height={48} className="rounded-lg" />
        </div>

        <div className="mb-1 flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground">تم قفل الجلسة للأمان</h3>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          تم تسجيل خمول لفترة. أدخل الرقم السري للعودة إلى لوحة التحكم.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setError(false)
            }}
            placeholder="الرقم السري (جرّب: 1234)"
            className={cn(
              'w-full rounded-xl border bg-black/20 px-4 py-3 text-center text-lg tracking-[0.3em] text-foreground outline-none transition placeholder:text-sm placeholder:tracking-normal',
              error ? 'border-destructive ring-2 ring-destructive/30' : 'border-border focus:border-primary',
            )}
          />

          {error && (
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              الرقم السري غير صحيح
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <ShieldCheck className="h-4 w-4" />
            فتح القفل
          </button>
        </form>
      </div>
    </div>
  )
}
