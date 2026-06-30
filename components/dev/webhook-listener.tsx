'use client'

import { useEffect, useState } from 'react'
import { Webhook, Play, Pause, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// WEBHOOK LISTENER DUMMY UI (#18)
// ----------------------------------------------------------------------------
// Visually logs incoming webhook events (payment.success, user.created, ...)
// so you can confirm whether the backend actually fired an event. Currently
// fed by a simulator; point a real EventSource/WebSocket at `pushEvent`.
// ============================================================================

type Hook = { id: string; event: string; status: 'success' | 'failed'; payload: string; at: number }

const SAMPLE = [
  { event: 'payment.success', status: 'success' as const, payload: '{ "amount": 1152, "currency": "KWD" }' },
  { event: 'subscription.renewed', status: 'success' as const, payload: '{ "plan": "VIP", "months": 12 }' },
  { event: 'payment.failed', status: 'failed' as const, payload: '{ "reason": "insufficient_funds" }' },
  { event: 'user.created', status: 'success' as const, payload: '{ "id": 8821, "role": "talent" }' },
  { event: 'kyc.approved', status: 'success' as const, payload: '{ "userId": 4410 }' },
]

export function WebhookListener() {
  const [listening, setListening] = useState(true)
  const [hooks, setHooks] = useState<Hook[]>([])

  useEffect(() => {
    if (!listening) return
    const timer = setInterval(() => {
      const s = SAMPLE[Math.floor(Math.random() * SAMPLE.length)]
      setHooks((prev) =>
        [{ id: Math.random().toString(36).slice(2), at: Date.now(), ...s }, ...prev].slice(0, 30),
      )
    }, 3500)
    return () => clearInterval(timer)
  }, [listening])

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="flex items-center gap-2 font-black text-foreground">
          <Webhook className="h-5 w-5 text-primary" />
          مستمع الـ Webhooks
        </h3>
        <button
          onClick={() => setListening((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition',
            listening
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
          )}
        >
          {listening ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {listening ? 'يستمع...' : 'متوقف'}
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {hooks.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            بانتظار وصول أحداث... ستظهر هنا فور إطلاقها من الخادم.
          </p>
        ) : (
          hooks.map((h) => (
            <div key={h.id} className="border-b border-border/60 px-4 py-2.5 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Zap
                    className={cn('h-3.5 w-3.5', h.status === 'success' ? 'text-success' : 'text-destructive')}
                  />
                  <span className="font-mono text-xs font-bold text-foreground">{h.event}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold',
                      h.status === 'success'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive',
                    )}
                  >
                    {h.status}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {new Date(h.at).toLocaleTimeString('ar-EG')}
                </span>
              </div>
              <pre className="mt-1.5 overflow-x-auto rounded-lg bg-black/30 px-3 py-1.5 font-mono text-[11px] text-muted-foreground scrollbar-thin">
                {h.payload}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
