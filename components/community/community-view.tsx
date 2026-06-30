'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Radio, ShieldAlert, FileText, HelpCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { SuperAdminMonitor } from '@/components/community/super-admin-monitor'
import { useModal } from '@/lib/modal'
import { ChatRoomForm } from '@/components/shared/add-entity-forms'
import { AutoTranslateMessage, LocalTimeBadge } from '@/components/shared/geo-widgets'
import { ChatWindow } from '@/components/community/chat-window'
import { QABankPanel } from '@/components/community/qa-bank'

const TABS = ['غرف المحادثة', 'رسائل الأعضاء', 'ملفات الرسائل', 'بنك الأسئلة (Q&A)']

const rooms = [
  { name: 'نقاشات صناع المحتوى', online: 145, last: 'قبل دقيقة' },
  { name: 'دعم تقني وصيانة', online: 38, last: 'قبل 4 دقائق' },
  { name: 'فرص العمل والتعاون', online: 72, last: 'قبل 12 دقيقة' },
]

const activity = [
  { title: 'سؤال جديد: كيفية كتابة السيناريو؟', sub: 'بواسطة: أحمد علي • قسم الأسئلة', action: 'اعتماد السؤال', icon: HelpCircle, tone: 'success' as const },
  { title: 'ملف مرفق: script_draft.pdf', sub: 'حجم الملف: 2.4MB • محادثة خاصة', action: 'فحص الملف', icon: FileText, tone: 'info' as const },
]

export function CommunityView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [tab, setTab] = useState(0)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <MessageSquare className={cn('h-6 w-6', accent)} />
            إدارة المجتمع والدردشات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">مراقبة الغرف، الرسائل، الملفات، وبنك الأسئلة.</p>
        </div>
        <button
          onClick={() => openModal({ title: 'إنشاء غرفة دردشة جديدة', content: <ChatRoomForm />, size: 'sm' })}
          className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          إنشاء غرفة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="غرف المحادثة النشطة" value="24" icon={Radio} accent={accent} />
        <StatCard label="الرسائل المتبادلة (اليوم)" value="8,402" icon={MessageSquare} accent={accent} />
        <StatCard label="بلاغات ومخالفات" value="3" hint="تحتاج مراجعة" icon={ShieldAlert} danger />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              'whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition',
              i === tab
                ? execMode
                  ? 'bg-destructive text-white'
                  : 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 ? (
        <div className="glass rounded-2xl border border-border p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">أحدث غرف المحادثة</h3>
          <div className="space-y-3">
            {rooms.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-4 transition hover:border-white/20"
              >
                <div>
                  <h4 className="font-bold text-foreground">{r.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {r.online} متصل الآن • آخر رسالة {r.last}
                  </p>
                </div>
                <button
                  className={cn(
                    'rounded-lg border px-4 py-2 text-xs font-bold transition',
                    execMode
                      ? 'border-destructive/30 bg-destructive/15 text-destructive hover:bg-destructive/25'
                      : 'border-primary/30 bg-primary/15 text-primary hover:bg-primary/25',
                  )}
                >
                  مراقبة الغرفة
                </button>
              </div>
            ))}
          </div>

          {/* Live chat preview — foreign-language message with inline translate + sender local time */}
          <div className="mt-6 border-t border-border/60 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">معاينة المحادثة المباشرة</h4>
              <span className="text-xs text-muted-foreground">— Sarah (مخرجة)</span>
              <LocalTimeBadge timezone="Europe/London" />
            </div>
            <AutoTranslateMessage
              message="Can we change the shooting location to the beach?"
              translation="هل يمكننا تغيير موقع التصوير إلى الشاطئ؟"
            />
          </div>
        </div>
      ) : tab === 1 ? (
        <ChatWindow />
      ) : tab === 3 ? (
        <QABankPanel />
      ) : (
        <div className="glass rounded-2xl border border-border p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">أحدث النشاطات</h3>
          <div className="space-y-3">
            {activity.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.title}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        a.tone === 'success' ? 'bg-success/15 text-success' : 'bg-accent/15 text-accent',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-foreground">{a.title}</h4>
                      <p className="text-xs text-muted-foreground">{a.sub}</p>
                    </div>
                  </div>
                  <button
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition',
                      a.tone === 'success'
                        ? 'bg-success/15 text-success hover:bg-success/25'
                        : 'bg-accent/15 text-accent hover:bg-accent/25',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {a.action}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <SuperAdminMonitor />
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  danger,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Radio
  accent?: string
  danger?: boolean
}) {
  return (
    <div className={cn('glass rounded-2xl border p-6', danger ? 'border-destructive/30' : 'border-border')}>
      <div className="flex items-center justify-between">
        <p className={cn('mb-2 text-sm', danger ? 'text-destructive' : 'text-muted-foreground')}>{label}</p>
        <Icon className={cn('h-5 w-5', danger ? 'text-destructive' : accent)} />
      </div>
      <h3 className="text-3xl font-black text-foreground">
        {value}
        {hint && <span className="text-sm font-normal text-muted-foreground"> {hint}</span>}
      </h3>
    </div>
  )
}
