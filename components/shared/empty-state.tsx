'use client'

import { Inbox, Plus, RotateCw, type LucideIcon } from 'lucide-react'

// ============================================================================
// EMPTY STATE (#5) — "No Data Found" screen with Add New / Refresh actions.
// ============================================================================

export function EmptyState({
  icon: Icon = Inbox,
  title = 'لا توجد بيانات',
  description = 'لم نعثر على أي عناصر لعرضها حتى الآن.',
  onAdd,
  addLabel = 'إضافة جديد',
  onRefresh,
}: {
  icon?: LucideIcon
  title?: string
  description?: string
  onAdd?: () => void
  addLabel?: string
  onRefresh?: () => void
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-1.5 text-lg font-black text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10"
          >
            <RotateCw className="h-4 w-4" />
            تحديث
          </button>
        )}
      </div>
    </div>
  )
}
