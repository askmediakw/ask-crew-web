'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Scale,
  Lock,
  ShieldCheck,
  RotateCcw,
  Send,
  Paperclip,
  AlertTriangle,
  UserCircle2,
  Briefcase,
  Gavel,
  Loader2,
} from 'lucide-react'
import { useCurrency } from '@/lib/currency'
import { useEscrow, type Dispute, type EvidenceAuthor } from '@/lib/escrow-store'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const AUTHOR_META: Record<EvidenceAuthor, { label: string; Icon: typeof UserCircle2; cls: string; bubble: string }> = {
  client: { label: 'العميل', Icon: UserCircle2, cls: 'text-accent', bubble: 'bg-accent/10 border-accent/20' },
  freelancer: { label: 'المستقل', Icon: Briefcase, cls: 'text-primary', bubble: 'bg-primary/10 border-primary/20' },
  admin: { label: 'الإدارة (محكّم)', Icon: Gavel, cls: 'text-gold', bubble: 'bg-gold/10 border-gold/20' },
}

const STATUS_META: Record<Dispute['status'], { label: string; cls: string }> = {
  open: { label: 'مفتوح — أموال مجمّدة', cls: 'bg-destructive/15 text-destructive' },
  refunded: { label: 'تم استرجاع العميل', cls: 'bg-accent/15 text-accent' },
  released: { label: 'أُفرج للمستقل', cls: 'bg-success/15 text-success' },
}

export function DisputesView() {
  const { format } = useCurrency()
  const { toast } = useToast()
  const { loading, disputes, addEvidence, resolveDispute } = useEscrow()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState<'refund' | 'release' | null>(null)

  // Default the selection to the first dispute once data has loaded.
  useEffect(() => {
    if (!selectedId && disputes.length > 0) setSelectedId(disputes[0].id)
  }, [disputes, selectedId])

  const selected = useMemo(() => disputes.find((d) => d.id === selectedId) ?? null, [disputes, selectedId])
  const frozenTotal = disputes.filter((d) => d.status === 'open').reduce((s, d) => s + d.amountKwd, 0)
  const openCount = disputes.filter((d) => d.status === 'open').length

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!selected || !draft.trim()) return
    const text = draft.trim()
    setSending(true)
    try {
      await addEvidence(selected.id, { author: 'admin', name: 'الإدارة', text })
      setDraft('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر إرسال الرسالة.')
    } finally {
      setSending(false)
    }
  }

  async function handleResolve(outcome: 'refund' | 'release') {
    if (!selected) return
    setResolving(outcome)
    try {
      await resolveDispute(selected.id, outcome)
      toast.success(
        outcome === 'refund'
          ? `تم استرجاع ${format(selected.amountKwd)} للعميل وإغلاق النزاع.`
          : `تم الإفراج عن المبلغ للمستقل (بعد خصم العمولة) وإغلاق النزاع.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر تنفيذ قرار التحكيم.')
    } finally {
      setResolving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-gold" />
        <p className="text-sm font-medium">جارٍ تحميل ملفات النزاعات...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <Scale className="h-6 w-6 text-gold" />
          مركز فض النزاعات والتحكيم
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          واجهة إدارية لإدارة النزاعات المالية: تجميد أموال الضمان، تبادل الأدلة، وإصدار القرار النهائي.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl border border-destructive/30 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">أموال مجمّدة في النزاعات</span>
            <Lock className="h-5 w-5 text-destructive" />
          </div>
          <p className="mt-3 text-2xl font-black text-foreground">{format(frozenTotal)}</p>
        </div>
        <div className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">نزاعات مفتوحة</span>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-3 text-2xl font-black text-foreground">{openCount}</p>
        </div>
        <div className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">إجمالي القضايا</span>
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-black text-foreground">{disputes.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Dispute list */}
        <div className="glass space-y-2 rounded-2xl border border-border p-3">
          {disputes.map((d) => {
            const meta = STATUS_META[d.status]
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  'w-full rounded-xl border p-3 text-right transition',
                  selectedId === d.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-white/5',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', meta.cls)}>{meta.label}</span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-foreground">{d.project}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{format(d.amountKwd)}</p>
              </button>
            )
          })}
        </div>

        {/* Dispute detail */}
        {selected ? (
          <div className="glass flex flex-col rounded-2xl border border-border">
            <div className="border-b border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-foreground">{selected.project}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    رقم القضية {selected.id} · مرتبط بـ {selected.txnId} · فُتح في {selected.openedAt}
                  </p>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', STATUS_META[selected.status].cls)}>
                  {STATUS_META[selected.status].label}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white/5 p-3">
                  <p className="text-xs text-muted-foreground">العميل</p>
                  <p className="mt-1 font-bold text-foreground">{selected.client}</p>
                </div>
                <div className="rounded-xl border border-border bg-white/5 p-3">
                  <p className="text-xs text-muted-foreground">المستقل</p>
                  <p className="mt-1 font-bold text-foreground">{selected.freelancer}</p>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-xs text-muted-foreground">المبلغ المجمّد</p>
                  <p className="mt-1 font-black text-foreground">{format(selected.amountKwd)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>{selected.reason}</span>
              </div>
            </div>

            {/* Evidence chat */}
            <div className="flex max-h-[360px] min-h-[180px] flex-1 flex-col gap-3 overflow-y-auto p-5">
              {selected.evidence.length === 0 && (
                <p className="m-auto text-sm text-muted-foreground">لا توجد أدلة بعد — ابدأ بطلب المستندات من الطرفين.</p>
              )}
              {selected.evidence.map((m) => {
                const am = AUTHOR_META[m.author]
                return (
                  <div key={m.id} className={cn('rounded-xl border p-3', am.bubble)}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={cn('flex items-center gap-1.5 text-xs font-bold', am.cls)}>
                        <am.Icon className="h-3.5 w-3.5" />
                        {m.name} · {am.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{m.text}</p>
                    {m.attachment && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground">
                        <Paperclip className="h-3.5 w-3.5" />
                        {m.attachment}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Admin actions */}
            {selected.status === 'open' ? (
              <div className="border-t border-border p-4">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="اكتب رسالة أو اطلب دليلاً من الطرفين..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleResolve('refund')}
                    disabled={resolving !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent/15 px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/25 disabled:opacity-60"
                  >
                    {resolving === 'refund' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    استرجاع المبلغ للعميل
                  </button>
                  <button
                    onClick={() => handleResolve('release')}
                    disabled={resolving !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success/15 px-4 py-2.5 text-sm font-bold text-success transition hover:bg-success/25 disabled:opacity-60"
                  >
                    {resolving === 'release' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    الإفراج للمستقل
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  قرار التحكيم نهائي ويُطبّق فوراً على أموال الضمان المجمّدة.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 border-t border-border p-4 text-sm font-bold text-muted-foreground">
                <Gavel className="h-4 w-4" />
                تم إغلاق هذا النزاع — {STATUS_META[selected.status].label}
              </div>
            )}
          </div>
        ) : (
          <div className="glass flex items-center justify-center rounded-2xl border border-border p-10 text-sm text-muted-foreground">
            اختر نزاعاً من القائمة لعرض التفاصيل.
          </div>
        )}
      </div>
    </div>
  )
}
