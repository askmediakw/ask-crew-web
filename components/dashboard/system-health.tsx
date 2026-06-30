'use client'

import { Activity, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

const services = [
  { name: 'واجهة المستخدمين (Users API)', online: true },
  { name: 'بوابة المدفوعات (Payments API)', online: true },
  { name: 'تخزين المحتوى (Bunny CDN)', online: true },
  { name: 'خدمة الإشعارات (Firebase)', online: false },
]

const STORAGE_USED = 65

export function SystemHealth() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* API Health */}
      <div className="glass rounded-2xl border border-border p-6 lg:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <Activity className={cn('h-5 w-5', accent)} />
          <h3 className="text-lg font-bold text-foreground">حالة السيرفرات والربط (API Health)</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-4"
            >
              <span className="text-sm font-medium text-foreground">{s.name}</span>
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'relative flex h-2.5 w-2.5',
                    s.online ? 'text-success' : 'text-destructive',
                  )}
                >
                  {s.online && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  )}
                  <span
                    className={cn(
                      'relative inline-flex h-2.5 w-2.5 rounded-full',
                      s.online ? 'bg-success' : 'bg-destructive',
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    s.online ? 'text-success' : 'text-destructive',
                  )}
                >
                  {s.online ? 'متصل' : 'منقطع'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CDN Storage */}
      <div className="glass rounded-2xl border border-border p-6">
        <div className="mb-5 flex items-center gap-2">
          <HardDrive className={cn('h-5 w-5', accent)} />
          <h3 className="text-lg font-bold text-foreground">استهلاك التخزين</h3>
        </div>
        <div className="flex items-center justify-center">
          <RadialGauge value={STORAGE_USED} execMode={execMode} />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Bunny CDN — تم استخدام 650GB من 1TB
        </p>
      </div>
    </div>
  )
}

function RadialGauge({ value, execMode }: { value: number; execMode: boolean }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const stroke = execMode ? 'var(--destructive)' : 'var(--primary)'

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">{value}%</span>
        <span className="text-[11px] text-muted-foreground">مستخدم</span>
      </div>
    </div>
  )
}
