'use client'

import { useRef, useState, useEffect } from 'react'
import { Shield, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// SECURITY SHIELD — activates platform-wide protection with an animated
// progress fill. TODO: BACKEND — persist activation + real hardening status.
// ============================================================================

export function SecurityShield({ execMode }: { execMode: boolean }) {
  const [active, setActive] = useState(false)
  const [activating, setActivating] = useState(false)
  const [progress, setProgress] = useState(45)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up the timer if the component unmounts mid-activation.
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const activate = () => {
    if (activating || active) return
    setActivating(true)
    let current = progress
    intervalRef.current = setInterval(() => {
      current += 5
      if (current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setProgress(100)
        setActivating(false)
        setActive(true)
      } else {
        setProgress(current)
      }
    }, 100)
  }

  return (
    <div
      className={cn(
        'glass rounded-2xl border p-6',
        active ? 'border-success/40' : 'border-border',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              active ? 'bg-success/15' : 'bg-white/5',
            )}
          >
            {active ? (
              <ShieldCheck className="h-6 w-6 text-success" />
            ) : (
              <Shield className={cn('h-6 w-6', execMode ? 'text-destructive' : 'text-primary')} />
            )}
          </span>
          <div className="leading-tight">
            <h3 className="font-bold text-foreground">الدرع الأمني (Firewall)</h3>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              حماية المنصة من هجمات الحرمان من الخدمة (DDoS) والوصول غير المصرّح به.
            </p>
          </div>
        </div>

        <button
          onClick={activate}
          disabled={activating || active}
          className={cn(
            'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition',
            active
              ? 'cursor-default bg-success shadow-success/20'
              : activating
                ? 'cursor-wait bg-success/50'
                : 'bg-success shadow-success/20 hover:opacity-90',
          )}
        >
          {activating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : active ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <Shield className="h-5 w-5" />
          )}
          <span>
            {active ? 'الدرع الأمني مُفعّل' : activating ? 'جاري التفعيل...' : 'تفعيل الدرع الأمني'}
          </span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full border border-border bg-white/5">
        <div
          className={cn('relative h-full rounded-full bg-success transition-all duration-300 ease-out')}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent to-white/20 blur-[2px]" />
        </div>
      </div>
      <p className="mt-2 text-left text-xs font-medium text-muted-foreground">
        مستوى الحماية: {progress}%
      </p>
    </div>
  )
}
