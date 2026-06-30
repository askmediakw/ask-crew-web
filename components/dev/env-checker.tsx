'use client'

import { CheckCircle2, XCircle, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CONFIG } from '@/lib/config'

/**
 * Environment Variable Checker (#19) — surfaces which public config values the
 * frontend resolved at build time, so the developer can spot a missing
 * NEXT_PUBLIC_* var without digging through the console.
 */
type EnvRow = {
  key: string
  value: string | undefined
  required: boolean
  note: string
}

const rows: EnvRow[] = [
  {
    key: 'NEXT_PUBLIC_API_URL',
    value: process.env.NEXT_PUBLIC_API_URL,
    required: true,
    note: 'الرابط الأساسي للـ API الخلفي',
  },
  {
    key: 'API_BASE_URL (resolved)',
    value: CONFIG.API_BASE_URL || undefined,
    required: true,
    note: 'القيمة الفعلية المستخدمة في الطلبات',
  },
  {
    key: 'ENABLE_MOCK_DATA (default)',
    value: String(CONFIG.ENABLE_MOCK_DATA),
    required: false,
    note: 'الوضع الافتراضي قبل تبديل المفتاح',
  },
]

export function EnvChecker() {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Settings2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">فحص متغيرات البيئة</h3>
      </div>
      <div className="divide-y divide-border/60">
        {rows.map((row) => {
          const present = row.value !== undefined && row.value !== ''
          const missing = row.required && !present
          return (
            <div key={row.key} className="flex items-center gap-3 p-4">
              {missing ? (
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              )}
              <div className="min-w-0 flex-1">
                <code className="font-mono text-sm font-bold text-foreground" dir="ltr">
                  {row.key}
                </code>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.note}</p>
              </div>
              <code
                dir="ltr"
                className={cn(
                  'max-w-[40%] truncate rounded-md px-2 py-1 text-left font-mono text-xs',
                  missing ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground',
                )}
              >
                {present ? row.value : 'غير مضبوط'}
              </code>
            </div>
          )
        })}
      </div>
    </div>
  )
}
