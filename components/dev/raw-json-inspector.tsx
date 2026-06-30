'use client'

import { useState } from 'react'
import { Braces, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDevTools } from '@/lib/dev-tools'

// ============================================================================
// RAW JSON INSPECTOR (#11)
// ----------------------------------------------------------------------------
// Floating "View Raw API Data" button → slide-over listing the exact JSON the
// backend returned for the most recent calls, with status + latency.
// ============================================================================

export function RawJsonInspector() {
  const { apiCalls } = useDevTools()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-5 z-[90] flex items-center gap-2 rounded-full border border-border bg-popover/90 px-4 py-2.5 text-xs font-bold text-foreground shadow-2xl backdrop-blur-xl transition hover:border-primary/50"
      >
        <Braces className="h-4 w-4 text-primary" />
        عرض بيانات الـ API الخام
        {apiCalls.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-white">
            {apiCalls.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" />
          <aside
            className="glass flex h-full w-full max-w-md flex-col border-l border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-black text-foreground">
                <Braces className="h-5 w-5 text-primary" />
                مفتش بيانات الـ API
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              {apiCalls.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  لا توجد طلبات بعد. نفّذ أي إجراء لرؤية بياناته الخام هنا.
                </p>
              )}
              {apiCalls.map((c) => (
                <div key={c.id} className="mb-2 overflow-hidden rounded-xl border border-border">
                  <button
                    onClick={() => setSelected((s) => (s === c.id ? null : c.id))}
                    className="flex w-full items-center justify-between gap-2 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold',
                          c.ok ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive',
                        )}
                      >
                        {c.status}
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {c.method} {c.endpoint}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{c.ms}ms</span>
                  </button>
                  {selected === c.id && (
                    <pre className="max-h-60 overflow-auto bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-success scrollbar-thin">
                      {JSON.stringify(c.response, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
