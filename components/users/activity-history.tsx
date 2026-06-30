'use client'

import { LogIn, KeyRound, Rocket, ShieldAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// USER ACTIVITY HISTORY — read-only timeline shown inside the universal modal.
// TODO: BACKEND — replace the demo events with data fetched per `userName`/id.
// ============================================================================

type ActivityEvent = {
  label: string
  meta: string
  icon: LucideIcon
  tone: 'success' | 'info' | 'accent' | 'destructive'
}

const toneBorder: Record<ActivityEvent['tone'], string> = {
  success: 'border-r-success',
  info: 'border-r-accent',
  accent: 'border-r-primary',
  destructive: 'border-r-destructive',
}

const toneIcon: Record<ActivityEvent['tone'], string> = {
  success: 'text-success',
  info: 'text-accent',
  accent: 'text-primary',
  destructive: 'text-destructive',
}

const demoEvents: ActivityEvent[] = [
  { label: 'تسجيل دخول ناجح', meta: 'منذ ساعتين · الكويت (IP: 192.168.1.1)', icon: LogIn, tone: 'success' },
  { label: 'تغيير كلمة المرور', meta: '20 يونيو 2026 · 10:30 صباحاً', icon: KeyRound, tone: 'info' },
  { label: 'ترقية الاشتراك إلى باقة (مستقل Pro)', meta: '15 يونيو 2026 · 04:15 عصراً', icon: Rocket, tone: 'accent' },
  { label: 'محاولة دخول فاشلة (كلمة مرور خاطئة)', meta: '10 يونيو 2026 · 11:00 مساءً', icon: ShieldAlert, tone: 'destructive' },
]

export function ActivityHistory({ userName }: { userName: string }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        آخر الأحداث المسجّلة على حساب <span className="font-bold text-foreground">{userName}</span>
      </p>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto pl-1 scrollbar-thin">
        {demoEvents.map((e, i) => {
          const Icon = e.icon
          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border border-r-4 bg-white/5 p-4',
                toneBorder[e.tone],
              )}
            >
              <span className={cn('mt-0.5 shrink-0', toneIcon[e.tone])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium text-foreground">{e.label}</p>
                <span className="mt-1 block text-xs text-muted-foreground">{e.meta}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
