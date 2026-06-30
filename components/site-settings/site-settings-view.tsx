'use client'

import { useState } from 'react'
import { Globe2, Save, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

export function SiteSettingsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [maintenance, setMaintenance] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Globe2 className={cn('h-6 w-6', accent)} />
            الإعدادات العامة للموقع
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">التحكم في الهوية العامة للمنصة ووضع الصيانة.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </button>
      </div>

      <div className="glass rounded-2xl border border-border p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">اسم المنصة (Site Title)</label>
            <input type="text" defaultValue="Ask Crew - Executive OS" className="input-base" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">وصف المنصة (Meta Description)</label>
            <textarea
              defaultValue="منصة آسك كرو لإدارة المحتوى الإبداعي والإنتاج."
              rows={3}
              className="input-base resize-none"
            />
          </div>

          {/* Maintenance mode */}
          <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <h4 className="font-bold text-destructive">وضع الصيانة (Maintenance Mode)</h4>
                <p className="text-xs text-muted-foreground">
                  إيقاف الموقع مؤقتاً للزوار وتفعيل رسالة الصيانة.
                </p>
              </div>
            </div>
            <button
              onClick={() => setMaintenance((v) => !v)}
              role="switch"
              aria-checked={maintenance}
              aria-label="وضع الصيانة"
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                maintenance ? 'bg-destructive' : 'bg-white/10',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                  maintenance ? 'right-0.5' : 'right-5',
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
