'use client'

import { useState } from 'react'
import { Copy, Check, FileJson, Download, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_CONTRACT, API_GROUPS, type ContractEndpoint } from '@/lib/api-contract'
import { downloadPostmanCollection } from '@/lib/postman'
import { CONFIG } from '@/lib/config'

const methodColor: Record<ContractEndpoint['method'], string> = {
  GET: 'bg-success/15 text-success border-success/30',
  POST: 'bg-primary/15 text-primary border-primary/30',
  PUT: 'bg-warning/15 text-warning border-warning/30',
  DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function ApiSpecsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <FileJson className="h-6 w-6 text-primary" />
            مواصفات الربط (API Specs)
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            عقد واضح للمطور الخلفي — يوضح بنية البيانات (JSON) التي تتوقعها الواجهة الأمامية لكل ميزة.
          </p>
        </div>
        <button
          onClick={downloadPostmanCollection}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          تحميل ملف Postman
        </button>
      </div>

      {/* Base URL banner */}
      <div className="glass flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border p-4 text-sm">
        <span className="font-bold text-foreground">الرابط الأساسي (Base URL):</span>
        <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-primary" dir="ltr">
          {CONFIG.API_BASE_URL || 'https://api.askcrew.com'}
        </code>
        <span className="text-muted-foreground">
          — {API_CONTRACT.length} مسار موزّعة على {API_GROUPS.length} وحدات.
        </span>
      </div>

      {/* Quick navigation (table of contents) */}
      <nav className="glass flex flex-wrap gap-2 rounded-xl border border-border p-4">
        {API_GROUPS.map((g) => (
          <a
            key={g}
            href={`#${slug(g)}`}
            className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            {g}
          </a>
        ))}
      </nav>

      {/* Endpoints grouped by module */}
      <div className="space-y-10">
        {API_GROUPS.map((group) => {
          const endpoints = API_CONTRACT.filter((ep) => ep.group === group)
          if (endpoints.length === 0) return null
          return (
            <section key={group} id={slug(group)} className="scroll-mt-24 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <h3 className="text-lg font-black text-foreground">{group}</h3>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {endpoints.length}
                </span>
              </div>
              {endpoints.map((ep) => (
                <EndpointCard key={ep.id} ep={ep} />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** Build a URL-safe anchor id from an Arabic group label. */
function slug(group: string) {
  const num = group.match(/^\d+/)?.[0]
  return `module-${num ?? group.replace(/\s+/g, '-')}`
}

function EndpointCard({ ep }: { ep: ContractEndpoint }) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <span
          className={cn(
            'rounded-md border px-2.5 py-1 font-mono text-xs font-black',
            methodColor[ep.method],
          )}
        >
          {ep.method}
        </span>
        <code className="font-mono text-sm font-bold text-foreground" dir="ltr">
          {ep.path}
        </code>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
            ep.auth ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground',
          )}
        >
          {ep.auth ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {ep.auth ? 'يتطلب توكن' : 'عام'}
        </span>
        <span className="ms-auto text-sm font-bold text-foreground">{ep.title}</span>
      </div>

      <p className="px-4 pt-3 text-xs leading-relaxed text-muted-foreground">{ep.description}</p>

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        {ep.requestExample ? (
          <JsonBlock label="الطلب المُرسَل (Request Body)" data={ep.requestExample} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            لا يوجد جسم للطلب (Request Body) — هذا الطلب من نوع {ep.method}
          </div>
        )}
        <JsonBlock label="الاستجابة المتوقعة (Expected Response)" data={ep.responseExample} highlight />
      </div>
    </div>
  )
}

function JsonBlock({
  label,
  data,
  highlight,
}: {
  label: string
  data: unknown
  highlight?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className={cn(
          'flex items-center justify-between border-b border-border px-3 py-2',
          highlight ? 'bg-success/10' : 'bg-secondary/60',
        )}
      >
        <span className="text-xs font-bold text-foreground">{label}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>
      <pre
        dir="ltr"
        className="max-h-72 overflow-auto bg-[oklch(0.16_0.02_285)] p-3 text-left font-mono text-xs leading-relaxed text-emerald-300/90 scrollbar-thin"
      >
        {json}
      </pre>
    </div>
  )
}
