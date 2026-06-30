'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAuthToken } from '@/lib/auth'
import { useDevTools } from '@/lib/dev-tools'

// ============================================================================
// LIVE ENDPOINT TESTER (#14)
// ----------------------------------------------------------------------------
// Paste any backend URL, pick a method/body, hit Test, and see the raw result
// (status, latency, JSON) — without touching code. Auto-attaches the JWT.
// ============================================================================

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

type Result = { status: number; ms: number; ok: boolean; body: string } | null

export function EndpointTester() {
  const { logAction } = useDevTools()
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [method, setMethod] = useState<(typeof METHODS)[number]>('GET')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result>(null)

  const test = async () => {
    setLoading(true)
    setResult(null)
    logAction('اختبار نقطة نهاية (Endpoint Tester)', `${method} ${url}`)
    const started = performance.now()
    try {
      const token = getAuthToken()
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: method !== 'GET' && body ? body : undefined,
      })
      const text = await res.text()
      let pretty = text
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        /* keep raw text */
      }
      setResult({
        status: res.status,
        ms: Math.round(performance.now() - started),
        ok: res.ok,
        body: pretty,
      })
    } catch (err) {
      setResult({
        status: 0,
        ms: Math.round(performance.now() - started),
        ok: false,
        body: String(err),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="mb-4 flex items-center gap-2 font-black text-foreground">
        <Send className="h-5 w-5 text-primary" />
        اختبار نقاط النهاية المباشر
      </h3>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}
            className="input-base w-28 py-2.5 text-sm font-bold"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="input-base flex-1 py-2.5 font-mono text-xs"
          />
          <button
            onClick={test}
            disabled={loading || !url}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            اختبار
          </button>
        </div>

        {method !== 'GET' && (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{ "key": "value" }'
            rows={3}
            className="input-base py-2.5 font-mono text-xs"
          />
        )}

        {result && (
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span
                className={cn(
                  'rounded-lg px-2.5 py-1 font-mono text-xs font-bold',
                  result.ok ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive',
                )}
              >
                {result.status || 'ERR'}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{result.ms}ms</span>
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-success scrollbar-thin">
              {result.body}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
