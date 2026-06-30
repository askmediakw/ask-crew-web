'use client'

import { useState } from 'react'
import { BellRing, Send, Users, Crown, User, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

const AUDIENCES = [
  { id: 'all', label: 'جميع المستخدمين', icon: Users },
  { id: 'vip', label: 'الشركات المميزة (VIP)', icon: Crown },
  { id: 'specific', label: 'مستخدم محدد', icon: User },
]

export function NotificationsView() {
  const { execMode } = useExecMode()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [sent, setSent] = useState(false)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const send = () => {
    setSent(true)
    setTimeout(() => setSent(false), 2500)
    setTitle('')
    setBody('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <BellRing className={cn('h-6 w-6', accent)} />
          مركز إرسال الإشعارات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إرسال إشعارات فورية عبر Firebase / APNs لجمهور محدد.
        </p>
      </div>

      <div className="glass space-y-5 rounded-2xl border border-border p-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-foreground">عنوان الإشعار</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: عرض حصري لنهاية الأسبوع"
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-foreground">نص الرسالة</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="اكتب محتوى الإشعار هنا..."
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-foreground">الجمهور المستهدف</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {AUDIENCES.map((a) => {
              const Icon = a.icon
              const active = audience === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => setAudience(a.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 text-sm font-bold transition',
                    active
                      ? execMode
                        ? 'border-destructive bg-destructive/15 text-destructive'
                        : 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={send}
          disabled={!title || sent}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50',
            sent ? 'bg-success' : execMode ? 'bg-destructive glow-alert' : 'bg-primary glow-brand',
          )}
        >
          {sent ? (
            <>
              <Check className="h-4 w-4" />
              تم إرسال الإشعار بنجاح
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              إرسال الإشعار
            </>
          )}
        </button>
      </div>
    </div>
  )
}
