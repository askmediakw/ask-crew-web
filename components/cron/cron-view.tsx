'use client'

import { useState } from 'react'
import { Clock, Play, Check, Database, RefreshCw, Mail, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type Job = {
  id: number
  name: string
  schedule: string
  nextRun: string
  icon: typeof Database
  active: boolean
}

const initial: Job[] = [
  { id: 1, name: 'تجديد الاشتراكات تلقائياً', schedule: 'يومياً 00:00', nextRun: 'بعد 6 ساعات', icon: RefreshCw, active: true },
  { id: 2, name: 'نسخ احتياطي لقاعدة البيانات', schedule: 'يومياً 03:00', nextRun: 'بعد 9 ساعات', icon: Database, active: true },
  { id: 3, name: 'إرسال ملخص الأداء بالبريد', schedule: 'أسبوعياً الأحد', nextRun: 'بعد 3 أيام', icon: Mail, active: true },
  { id: 4, name: 'تنظيف الملفات المؤقتة', schedule: 'يومياً 04:30', nextRun: 'بعد 10 ساعات', icon: Trash, active: false },
]

export function CronView() {
  const { execMode } = useExecMode()
  const [jobs, setJobs] = useState(initial)
  const [running, setRunning] = useState<number | null>(null)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const toggle = (id: number) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, active: !j.active } : j)))

  const runNow = (id: number) => {
    setRunning(id)
    setTimeout(() => setRunning((curr) => (curr === id ? null : curr)), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <Clock className={cn('h-6 w-6', accent)} />
          المهام المجدولة والنسخ الاحتياطية
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مراقبة المهام التلقائية (Cron Jobs) وتشغيلها يدوياً عند الحاجة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {jobs.map((j) => {
          const Icon = j.icon
          const isRunning = running === j.id
          return (
            <div key={j.id} className="glass flex flex-col gap-4 rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      j.active ? (execMode ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary') : 'bg-white/5 text-muted-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{j.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{j.schedule}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(j.id)}
                  aria-label="تفعيل/إيقاف"
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                    j.active ? 'bg-success' : 'bg-white/10',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                      j.active ? 'right-0.5' : 'right-5',
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">
                  التشغيل القادم: <span className="font-bold text-foreground">{j.nextRun}</span>
                </span>
                <button
                  onClick={() => runNow(j.id)}
                  disabled={isRunning}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-60',
                    isRunning
                      ? 'bg-success/15 text-success'
                      : execMode
                        ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                        : 'bg-primary/15 text-primary hover:bg-primary/25',
                  )}
                >
                  {isRunning ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      تم التشغيل
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      تشغيل الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
