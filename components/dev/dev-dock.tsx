'use client'

import { Activity, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDevTools, type ServerStatus } from '@/lib/dev-tools'

// ============================================================================
// DEV DOCK — persistent footer pill hosting:
//  - API Response Time Tracker (#12)
//  - Server Status Ping traffic light (#16)
// ============================================================================

const statusMeta: Record<ServerStatus, { dot: string; label: string; text: string }> = {
  online: { dot: 'bg-success', label: 'الخادم متصل', text: 'text-success' },
  degraded: { dot: 'bg-warning', label: 'استجابة بطيئة', text: 'text-warning' },
  offline: { dot: 'bg-destructive', label: 'الخادم غير متصل', text: 'text-destructive' },
}

export function DevDock() {
  const { lastLatency, serverStatus } = useDevTools()
  const meta = statusMeta[serverStatus]

  return (
    <div className="fixed bottom-5 left-5 z-[90] flex items-center gap-2">
      {/* Server status traffic light (#16) */}
      <div className="glass flex items-center gap-2 rounded-full border border-border px-3 py-2 shadow-xl">
        <span className="relative flex h-2.5 w-2.5">
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', meta.dot)} />
          <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', meta.dot)} />
        </span>
        <span className={cn('text-xs font-bold', meta.text)}>{meta.label}</span>
      </div>

      {/* Latency badge (#12) */}
      <div className="glass flex items-center gap-2 rounded-full border border-border px-3 py-2 shadow-xl">
        {lastLatency != null && lastLatency > 800 ? (
          <Gauge className="h-3.5 w-3.5 text-warning" />
        ) : (
          <Activity className="h-3.5 w-3.5 text-primary" />
        )}
        <span className="font-mono text-xs font-bold text-foreground">
          {lastLatency != null ? `${lastLatency}ms` : '—'}
        </span>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">آخر استجابة</span>
      </div>
    </div>
  )
}
