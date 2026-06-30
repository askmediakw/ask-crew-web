'use client'

import { MousePointerClick, Trash2 } from 'lucide-react'
import { useDevTools } from '@/lib/dev-tools'

// ============================================================================
// FRONTEND ACTION AUDIT TRAIL (#20)
// ----------------------------------------------------------------------------
// Renders every UI-initiated action recorded via useDevTools().logAction(...)
// — proof that a click/save originated from the frontend, with timestamps.
// ============================================================================

export function ActionAuditTrail() {
  const { actions, clearActions } = useDevTools()

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="flex items-center gap-2 font-black text-foreground">
          <MousePointerClick className="h-5 w-5 text-primary" />
          سجل إجراءات الواجهة
        </h3>
        <button
          onClick={clearActions}
          disabled={actions.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          مسح
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {actions.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            لم يُسجّل أي إجراء بعد. كل ضغطة زر موثّقة هنا فور حدوثها.
          </p>
        ) : (
          actions.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{a.label}</p>
                {a.detail && <p className="truncate text-xs text-muted-foreground">{a.detail}</p>}
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {new Date(a.at).toLocaleTimeString('ar-EG')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
