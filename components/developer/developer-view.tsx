'use client'

import { useState } from 'react'
import { Code2, Copy, Check, Eye, EyeOff, Plus, Webhook, Trash2, Download, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { downloadPostmanCollection } from '@/lib/postman'

const API_KEY = process.env.NEXT_PUBLIC_STRIPE_API_KEY || 'sk_test_placeholder_replace_me'

export function DeveloperView() {
  const { execMode } = useExecMode()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hooks, setHooks] = useState<string[]>([
    'https://api.royal-tv.com/webhooks/subscriptions',
    'https://b2b.foxmedia.com/hooks/payment-status',
  ])
  const [newHook, setNewHook] = useState('')
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const masked = `${API_KEY.slice(0, 7)}${'•'.repeat(24)}${API_KEY.slice(-4)}`

  const copyKey = () => {
    navigator.clipboard?.writeText(API_KEY).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const addHook = () => {
    if (!newHook.trim()) return
    setHooks((prev) => [...prev, newHook.trim()])
    setNewHook('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <Code2 className={cn('h-6 w-6', accent)} />
          إعدادات المطورين
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مفاتيح الـ API و روابط الـ Webhooks لتكاملات الشركات (B2B).
        </p>
      </div>

      {/* Postman collection export */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-6">
        <div className="flex items-start gap-3">
          <span className={cn('rounded-xl bg-white/5 p-2.5', accent)}>
            <FileJson className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-foreground">مجموعة Postman جاهزة</h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              ملف <code className="font-mono text-foreground">.json</code> يحتوي على كل مسارات الـ API والهيدرز المطلوبة — يوفّر على المطور الخلفي إنشاءها يدوياً.
            </p>
          </div>
        </div>
        <button
          onClick={downloadPostmanCollection}
          className={cn(
            'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90',
            execMode ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20',
          )}
        >
          <Download className="h-4 w-4" />
          تحميل ملف Postman
        </button>
      </div>

      {/* API Key */}
      <div className="glass rounded-2xl border border-border p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">مفتاح الـ API السري</h3>
        <div className="flex flex-wrap items-center gap-3">
          <code className="flex-1 overflow-x-auto rounded-xl border border-border bg-white/5 px-4 py-3 font-mono text-sm text-foreground">
            {revealed ? API_KEY : masked}
          </code>
          <button
            onClick={() => setRevealed((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-foreground transition hover:bg-white/15"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {revealed ? 'إخفاء' : 'إظهار'}
          </button>
          <button
            onClick={copyKey}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition',
              copied ? 'bg-success' : execMode ? 'bg-destructive' : 'bg-primary',
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          لا تشارك هذا المفتاح علناً. يمنح وصولاً كاملاً لبيانات حسابك.
        </p>
      </div>

      {/* Webhooks */}
      <div className="glass rounded-2xl border border-border p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Webhook className={cn('h-5 w-5', accent)} />
          روابط الـ Webhooks
        </h3>
        <div className="mb-4 space-y-3">
          {hooks.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white/5 p-3"
            >
              <code className="truncate font-mono text-xs text-foreground">{h}</code>
              <button
                onClick={() => setHooks((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="حذف الرابط"
                className="shrink-0 rounded-lg bg-destructive/10 p-1.5 text-destructive transition hover:bg-destructive hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={newHook}
            onChange={(e) => setNewHook(e.target.value)}
            placeholder="https://your-company.com/webhook"
            dir="ltr"
            className="input-base flex-1 text-left font-mono text-sm"
          />
          <button
            onClick={addHook}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة رابط
          </button>
        </div>
      </div>
    </div>
  )
}
