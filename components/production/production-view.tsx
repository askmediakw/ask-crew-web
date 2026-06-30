'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  Wallet,
  CalendarClock,
  FileLock2,
  UtensilsCrossed,
  ShieldCheck,
  Loader2,
  Plus,
  Download,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { useExecMode } from '@/lib/exec-mode'
import * as api from '@/services/api'
import type { ProductionBudget, CallSheet, ScriptDocument, ServiceBookingResult } from '@/types'

const kwd = (n: number) => `${n.toLocaleString('en-US')} د.ك`

type TabKey = 'budget' | 'callsheet' | 'scripts' | 'services'

const TABS: { key: TabKey; label: string; icon: typeof Wallet }[] = [
  { key: 'budget', label: 'الميزانية', icon: Wallet },
  { key: 'callsheet', label: 'جداول النداء', icon: CalendarClock },
  { key: 'scripts', label: 'خزنة النصوص', icon: FileLock2 },
  { key: 'services', label: 'الإعاشة والتصاريح', icon: UtensilsCrossed },
]

export function ProductionView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [tab, setTab] = useState<TabKey>('budget')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <ClipboardList className={cn('h-6 w-6', accent)} />
          غرفة عمليات الإنتاج
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          منظومة متكاملة لإدارة ميزانية الإنتاج، جداول النداء، خزنة النصوص المشفّرة، والخدمات اللوجستية.
        </p>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'budget' && <BudgetPanel />}
      {tab === 'callsheet' && <CallSheetPanel />}
      {tab === 'scripts' && <ScriptVaultPanel />}
      {tab === 'services' && <ServicesPanel />}
    </div>
  )
}

// ── Budget tracker ─────────────────────────────────────────────────────────
const SEGMENT_COLORS = ['bg-primary', 'bg-gold', 'bg-success', 'bg-warning']

function BudgetPanel() {
  const [budget, setBudget] = useState<ProductionBudget | null>(null)

  useEffect(() => {
    let active = true
    api.fetchProductionBudget().then((b) => {
      if (active) setBudget(b)
    })
    return () => {
      active = false
    }
  }, [])

  if (!budget) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const spentPct = Math.round((budget.spentKwd / budget.allocatedKwd) * 100)

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl border border-border p-5">
        <p className="text-sm font-bold text-muted-foreground">{budget.projectName}</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Metric label="الميزانية المعتمدة" value={kwd(budget.allocatedKwd)} tone="text-foreground" />
          <Metric label="المصروف" value={kwd(budget.spentKwd)} tone="text-warning" />
          <Metric label="المتبقي" value={kwd(budget.remainingKwd)} tone="text-success" />
        </div>

        {/* Spend bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">نسبة الصرف</span>
            <span className="font-black text-foreground">{spentPct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="flex h-full">
              {budget.breakdown.map((b, i) => (
                <div
                  key={b.label}
                  className={cn('h-full', SEGMENT_COLORS[i % SEGMENT_COLORS.length])}
                  style={{ width: `${(b.amountKwd / budget.allocatedKwd) * 100}%` }}
                  title={`${b.label}: ${kwd(b.amountKwd)}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown list */}
      <div className="glass rounded-2xl border border-border p-5">
        <h3 className="mb-3 text-sm font-black text-foreground">توزيع المصروفات</h3>
        <div className="space-y-2.5">
          {budget.breakdown.map((b, i) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className={cn('h-3 w-3 shrink-0 rounded-sm', SEGMENT_COLORS[i % SEGMENT_COLORS.length])} />
              <span className="flex-1 text-sm text-foreground">{b.label}</span>
              <span className="text-sm font-bold text-foreground">{kwd(b.amountKwd)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-base font-black', tone)}>{value}</p>
    </div>
  )
}

// ── Call sheet generator ─────────────────────────────────────────────────────
function CallSheetPanel() {
  const { toast } = useToast()
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [time, setTime] = useState('07:00')
  const [busy, setBusy] = useState(false)
  const [sheet, setSheet] = useState<CallSheet | null>(null)

  async function generate() {
    if (!date || !location.trim()) {
      toast.error('يرجى إدخال التاريخ والموقع.')
      return
    }
    setBusy(true)
    try {
      const res = await api.generateCallSheet({ date, location, generalCallTime: time, crewIds: [1, 2, 3, 4] })
      setSheet(res)
      toast.success('تم توليد جدول النداء بنجاح.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر توليد الجدول.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="glass space-y-3 rounded-2xl border border-border p-5">
        <h3 className="text-sm font-black text-foreground">توليد جدول نداء (Call Sheet)</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="تاريخ التصوير">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
          </Field>
          <Field label="الموقع">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="استديو نون — Stage A"
              className="input-base"
            />
          </Field>
          <Field label="وقت النداء العام">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-base" />
          </Field>
        </div>
        <button
          onClick={generate}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          توليد الجدول
        </button>
      </div>

      {sheet && (
        <div className="glass rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-foreground">{sheet.location}</h3>
              <p className="text-xs text-muted-foreground">
                {sheet.date} • النداء العام {sheet.generalCallTime} • رقم {sheet.id}
              </p>
            </div>
            <button
              onClick={() => toast.success('تم تصدير الجدول (PDF).')}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" />
              تصدير PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 font-bold">الاسم</th>
                  <th className="py-2 font-bold">الدور</th>
                  <th className="py-2 font-bold">وقت الحضور</th>
                  <th className="py-2 font-bold">المشاهد</th>
                </tr>
              </thead>
              <tbody>
                {sheet.rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2.5 font-bold text-foreground">{r.name}</td>
                    <td className="py-2.5 text-muted-foreground">{r.role}</td>
                    <td className="py-2.5 font-bold text-primary">{r.callTime}</td>
                    <td className="py-2.5 text-muted-foreground">{r.scenes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Script vault (DRM + watermark) ──────────────────────────────────────────
function ScriptVaultPanel() {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [recipient, setRecipient] = useState('')
  const [drm, setDrm] = useState(true)
  const [busy, setBusy] = useState(false)
  const [docs, setDocs] = useState<ScriptDocument[]>([])

  async function upload() {
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان النص.')
      return
    }
    setBusy(true)
    try {
      const res = await api.uploadScript(title, recipient, drm)
      setDocs((d) => [res.document, ...d])
      setTitle('')
      setRecipient('')
      toast.success(res.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر رفع النص.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="glass space-y-3 rounded-2xl border border-border p-5">
        <h3 className="flex items-center gap-1.5 text-sm font-black text-foreground">
          <FileLock2 className="h-4 w-4 text-gold" />
          خزنة النصوص المشفّرة
        </h3>
        <p className="text-xs text-muted-foreground">
          ارفع النصوص بحماية DRM وعلامة مائية ديناميكية باسم المستلم لمنع التسريب.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="عنوان النص">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="الحلقة 12 — مسوّدة نهائية" className="input-base" />
          </Field>
          <Field label="المستلم (للعلامة المائية)">
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="منى الصباح" className="input-base" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={drm} onChange={(e) => setDrm(e.target.checked)} className="h-4 w-4 accent-primary" />
          تفعيل حماية DRM وعلامة مائية ديناميكية
        </label>
        <button
          onClick={upload}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          رفع وتأمين النص
        </button>
      </div>

      {docs.length > 0 && (
        <div className="glass rounded-2xl border border-border p-5">
          <h3 className="mb-3 text-sm font-black text-foreground">النصوص المؤمّنة</h3>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-white/5 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <FileLock2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.uploadedAt} • {d.sizeLabel} • علامة مائية: {d.watermarkedFor}
                  </p>
                </div>
                {d.drmEnabled && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-black text-success">
                    <ShieldCheck className="h-3 w-3" />
                    محمي
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Catering & permits ──────────────────────────────────────────────────────
function ServicesPanel() {
  const { toast } = useToast()
  // Catering
  const [meals, setMeals] = useState(30)
  const [cateringDate, setCateringDate] = useState('')
  const [cateringBusy, setCateringBusy] = useState(false)
  // Permits
  const [permitType, setPermitType] = useState('تصوير في شارع عام')
  const [insurance, setInsurance] = useState(true)
  const [permitBusy, setPermitBusy] = useState(false)
  const [lastResult, setLastResult] = useState<ServiceBookingResult | null>(null)

  async function bookCatering() {
    if (!cateringDate) {
      toast.error('يرجى تحديد تاريخ الإعاشة.')
      return
    }
    setCateringBusy(true)
    try {
      const res = await api.bookCatering({ date: cateringDate, meals, dietaryOptions: ['نباتي'], location: 'موقع التصوير' })
      setLastResult(res)
      toast.success(res.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر الحجز.')
    } finally {
      setCateringBusy(false)
    }
  }

  async function applyPermit() {
    setPermitBusy(true)
    try {
      const res = await api.applyPermit({
        permitType,
        locationType: 'خارجي',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        withInsurance: insurance,
      })
      setLastResult(res)
      toast.success(res.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر تقديم الطلب.')
    } finally {
      setPermitBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Catering */}
        <div className="glass space-y-3 rounded-2xl border border-border p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            حجز الإعاشة
          </h3>
          <Field label="عدد الوجبات">
            <input
              type="number"
              min={1}
              value={meals}
              onChange={(e) => setMeals(Number(e.target.value))}
              className="input-base"
            />
          </Field>
          <Field label="تاريخ التقديم">
            <input type="date" value={cateringDate} onChange={(e) => setCateringDate(e.target.value)} className="input-base" />
          </Field>
          <p className="text-xs text-muted-foreground">التكلفة التقديرية: {kwd(Number((meals * 4.5).toFixed(2)))}</p>
          <button
            onClick={bookCatering}
            disabled={cateringBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {cateringBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UtensilsCrossed className="h-4 w-4" />}
            تأكيد حجز الإعاشة
          </button>
        </div>

        {/* Permits */}
        <div className="glass space-y-3 rounded-2xl border border-border p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" />
            تصاريح وتأمين الإنتاج
          </h3>
          <Field label="نوع التصريح">
            <select value={permitType} onChange={(e) => setPermitType(e.target.value)} className="input-base">
              <option>تصوير في شارع عام</option>
              <option>تشغيل طائرة مسيّرة (درون)</option>
              <option>إغلاق موقع مؤقت</option>
              <option>تصوير في مبنى حكومي</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="h-4 w-4 accent-primary" />
            إضافة تأمين إنتاج شامل (+400 د.ك)
          </label>
          <p className="text-xs text-muted-foreground">التكلفة التقديرية: {kwd(insurance ? 650 : 250)}</p>
          <button
            onClick={applyPermit}
            disabled={permitBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-black text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {permitBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            تقديم طلب التصريح
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="glass flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold text-foreground">{lastResult.message}</p>
            <p className="text-xs text-muted-foreground">
              رقم المرجع: {lastResult.referenceId} • التكلفة: {kwd(lastResult.estimatedKwd)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
