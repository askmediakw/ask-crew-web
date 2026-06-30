'use client'

import { UserPlus, Film, CreditCard, CalendarCheck, ShieldAlert, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type Tone = 'success' | 'info' | 'gold' | 'danger'

const feed: {
  type: string
  icon: typeof UserPlus
  desc: string
  status: string
  tone: Tone
  time: string
}[] = [
  { type: 'مستخدم جديد', icon: UserPlus, desc: 'سجّل المستخدم "نورة سالم" حساباً جديداً', status: 'مكتمل', tone: 'success', time: 'قبل دقيقتين' },
  { type: 'رفع محتوى', icon: Film, desc: 'تم رفع فيلم "الإمبراطورية الكبرى" بدقة 4K', status: 'قيد المعالجة', tone: 'gold', time: 'قبل 8 دقائق' },
  { type: 'عملية دفع', icon: CreditCard, desc: 'دفعة ناجحة بقيمة 1,152 د.ك عبر K-Net', status: 'ناجح', tone: 'success', time: 'قبل 14 دقيقة' },
  { type: 'حجز جديد', icon: CalendarCheck, desc: 'حجز ورشة "كتابة السيناريو" — 12 مقعد', status: 'مؤكد', tone: 'info', time: 'قبل 26 دقيقة' },
  { type: 'بلاغ مخالفة', icon: ShieldAlert, desc: 'بلاغ عن رسالة مخالفة في غرفة الدعم التقني', status: 'يحتاج مراجعة', tone: 'danger', time: 'قبل 41 دقيقة' },
  { type: 'عملية دفع', icon: CreditCard, desc: 'محاولة دفع مرفوضة بقيمة 75 د.ك عبر Apple Pay', status: 'مرفوض', tone: 'danger', time: 'قبل ساعة' },
]

const toneClass: Record<Tone, string> = {
  success: 'bg-success/20 text-success',
  info: 'bg-accent/20 text-accent',
  gold: 'bg-gold/20 text-gold',
  danger: 'bg-destructive/20 text-destructive',
}

const iconClass: Record<Tone, string> = {
  success: 'bg-success/15 text-success',
  info: 'bg-accent/15 text-accent',
  gold: 'bg-gold/15 text-gold',
  danger: 'bg-destructive/15 text-destructive',
}

export function ActivityFeed() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border p-5">
        <Activity className={cn('h-5 w-5', accent)} />
        <h3 className="text-lg font-bold text-foreground">سجل النشاطات الشامل</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-right text-sm">
          <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">نوع النشاط</th>
              <th className="px-5 py-4 font-semibold">الوصف</th>
              <th className="px-5 py-4 font-semibold">الحالة</th>
              <th className="px-5 py-4 font-semibold">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {feed.map((item, i) => {
              const Icon = item.icon
              return (
                <tr key={i} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          iconClass[item.tone],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-bold text-foreground">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{item.desc}</td>
                  <td className="px-5 py-4">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', toneClass[item.tone])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.time}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
