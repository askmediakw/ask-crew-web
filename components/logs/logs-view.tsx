'use client'

import { useState } from 'react'
import { Terminal, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type Level = 'OK' | 'WARN' | 'ERROR'

const logs: { code: number; level: Level; msg: string; time: string }[] = [
  { code: 200, level: 'OK', msg: 'GET /api/users — تم جلب 1,240 مستخدم', time: '14:32:08' },
  { code: 200, level: 'OK', msg: 'POST /api/auth/login — تسجيل دخول ناجح', time: '14:31:55' },
  { code: 201, level: 'OK', msg: 'POST /api/content — تم رفع فيلم جديد', time: '14:30:12' },
  { code: 429, level: 'WARN', msg: 'GET /api/analytics — تجاوز حد الطلبات (Rate Limit)', time: '14:28:40' },
  { code: 500, level: 'ERROR', msg: 'POST /api/payments — فشل بوابة الدفع (Gateway Timeout)', time: '14:27:03' },
  { code: 200, level: 'OK', msg: 'GET /api/companies — تم جلب 86 شركة', time: '14:25:19' },
  { code: 401, level: 'WARN', msg: 'GET /api/admin — محاولة وصول غير مصرّح بها', time: '14:22:47' },
  { code: 503, level: 'ERROR', msg: 'WORKER bunny-cdn — انقطاع مؤقت في خدمة التخزين', time: '14:20:11' },
]

const FILTERS: ('الكل' | Level)[] = ['الكل', 'OK', 'WARN', 'ERROR']

const levelClass: Record<Level, string> = {
  OK: 'text-success',
  WARN: 'text-gold',
  ERROR: 'text-destructive',
}

export function LogsView() {
  const { execMode } = useExecMode()
  const [filter, setFilter] = useState<'الكل' | Level>('الكل')
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const filtered = filter === 'الكل' ? logs : logs.filter((l) => l.level === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Terminal className={cn('h-6 w-6', accent)} />
            سجل النظام والأخطاء
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            استجابات الـ API المباشرة لإثبات جاهزية التقاط أخطاء الباك إند.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary p-1">
          <Filter className="ml-1 h-4 w-4 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                filter === f
                  ? execMode
                    ? 'bg-destructive text-white'
                    : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-[#0a0a12]">
        <div className="flex items-center gap-2 border-b border-border bg-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-gold/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">live-api-stream.log</span>
        </div>
        <div className="scrollbar-thin max-h-[460px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {filtered.map((l, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-white/5 py-2 last:border-0">
              <span className="shrink-0 text-muted-foreground/60">{l.time}</span>
              <span className={cn('shrink-0 font-bold', levelClass[l.level])}>[{l.code}]</span>
              <span className="text-foreground/90">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
