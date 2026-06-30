'use client'

import { useState } from 'react'
import { LifeBuoy, MessageCircle, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type ColId = 'open' | 'progress' | 'resolved'

type Ticket = {
  id: string
  subject: string
  customer: string
  priority: 'عالية' | 'متوسطة' | 'منخفضة'
  col: ColId
}

const columns: { id: ColId; title: string; dot: string }[] = [
  { id: 'open', title: 'مفتوحة', dot: 'bg-destructive' },
  { id: 'progress', title: 'قيد المعالجة', dot: 'bg-gold' },
  { id: 'resolved', title: 'تم الحل', dot: 'bg-success' },
]

const priorityCls: Record<Ticket['priority'], string> = {
  عالية: 'bg-destructive/20 text-destructive',
  متوسطة: 'bg-gold/20 text-gold',
  منخفضة: 'bg-success/20 text-success',
}

const initial: Ticket[] = [
  { id: 'TK-101', subject: 'لا يمكنني تحميل الفيلم بدقة 4K', customer: 'منى الصباح', priority: 'عالية', col: 'open' },
  { id: 'TK-102', subject: 'مشكلة في تجديد الاشتراك', customer: 'سينما آرت', priority: 'متوسطة', col: 'open' },
  { id: 'TK-103', subject: 'طلب فاتورة ضريبية', customer: 'فوكس ميديا', priority: 'منخفضة', col: 'progress' },
  { id: 'TK-104', subject: 'الرابط السحري لا يصل للبريد', customer: 'بدر العتيبي', priority: 'عالية', col: 'progress' },
  { id: 'TK-105', subject: 'استفسار عن العلامة البيضاء', customer: 'مجموعة الخليج', priority: 'منخفضة', col: 'resolved' },
]

const order: ColId[] = ['open', 'progress', 'resolved']

export function TicketsView() {
  const { execMode } = useExecMode()
  const [tickets, setTickets] = useState(initial)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const advance = (id: string) =>
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = order[Math.min(order.indexOf(t.col) + 1, order.length - 1)]
        return { ...t, col: next }
      }),
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <LifeBuoy className={cn('h-6 w-6', accent)} />
          نظام التذاكر والدعم الفني
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          لوحة كانبان لإدارة شكاوى العملاء حتى الحل النهائي.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {columns.map((col) => {
          const items = tickets.filter((t) => t.col === col.id)
          return (
            <div key={col.id} className="glass rounded-2xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-foreground">
                  <span className={cn('h-2.5 w-2.5 rounded-full', col.dot)} />
                  {col.title}
                </h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/60 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', priorityCls[t.priority])}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="mb-1 text-sm font-bold text-foreground">{t.subject}</p>
                    <p className="mb-3 text-xs text-muted-foreground">العميل: {t.customer}</p>
                    <div className="flex items-center gap-2">
                      <button
                        className={cn(
                          'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                          execMode
                            ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                            : 'bg-primary/15 text-primary hover:bg-primary/25',
                        )}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        رد على العميل
                      </button>
                      {t.col !== 'resolved' && (
                        <button
                          onClick={() => advance(t.id)}
                          aria-label="نقل للمرحلة التالية"
                          className="flex items-center justify-center rounded-lg bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">لا توجد تذاكر</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
