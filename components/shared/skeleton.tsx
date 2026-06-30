import { cn } from '@/lib/utils'

// ============================================================================
// SKELETON LOADERS (#4) — shimmer placeholders for charts, tables, cards.
// ============================================================================

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={cn('skeleton-shimmer rounded-md', className)} />
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex gap-4 border-b border-border bg-white/5 p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={cn('h-5', c === 0 ? 'w-10 rounded-full' : 'flex-1')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-2xl border border-border p-5', className)}>
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-6 h-3 w-20" />
      <div className="flex h-40 items-end gap-3">
        {[60, 85, 45, 70, 95, 55, 75].map((h, i) => (
          <div key={i} className="flex flex-1 items-end" style={{ height: '100%' }}>
            <Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl border border-border p-5">
          <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
