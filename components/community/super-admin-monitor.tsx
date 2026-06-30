'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock authorization flag — in production this comes from the authenticated session role.
const isCEO = true

const privateMessages = [
  { from: 'أحمد خالد', to: 'سارة محمد', preview: 'هل تم اعتماد ميزانية الحملة؟', time: '14:21' },
  { from: 'خالد الفهد', to: 'الدعم الفني', preview: 'العميل يطلب استرجاع المبلغ كاملاً', time: '13:58' },
  { from: 'نورة سالم', to: 'إدارة المحتوى', preview: 'الملف المرفق يحتوي على مادة محمية', time: '12:30' },
]

export function SuperAdminMonitor() {
  const [granted, setGranted] = useState(false)
  // The CEO always has access; delegated employees only when access is granted.
  const canView = isCEO || granted

  return (
    <div className="glass overflow-hidden rounded-2xl border border-destructive/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-destructive/20 bg-destructive/5 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-bold text-foreground">مراقبة الإدارة العليا للدردشات</h3>
            <p className="text-xs text-muted-foreground">منطقة سرّية — وصول مقيّد للمدير التنفيذي فقط</p>
          </div>
        </div>
        <button
          onClick={() => setGranted((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition',
            granted
              ? 'bg-success/15 text-success hover:bg-success/25'
              : 'bg-destructive/15 text-destructive hover:bg-destructive/25',
          )}
        >
          {granted ? <UserCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          {granted ? 'تم منح الصلاحية لموظف' : 'منح صلاحية الوصول'}
        </button>
      </div>

      {canView ? (
        <div className="divide-y divide-border/60">
          <div className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-success">
            <Eye className="h-3.5 w-3.5" />
            عرض الرسائل الخاصة مفعّل
          </div>
          {privateMessages.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {m.from} <span className="text-muted-foreground">←</span> {m.to}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{m.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <EyeOff className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-bold text-foreground">قائمة الرسائل الخاصة مخفية تماماً</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            لا يمكن للمدراء العاديين رؤية المحادثات الخاصة. يجب منح الصلاحية صراحةً من المدير التنفيذي.
          </p>
        </div>
      )}
    </div>
  )
}
