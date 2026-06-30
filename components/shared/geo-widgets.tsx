'use client'

import { useEffect, useState } from 'react'
import {
  Clock,
  MapPin,
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Sparkles,
  XCircle,
  Languages,
  SplitSquareHorizontal,
  Captions,
  TrendingDown,
  Receipt,
  Globe,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// GEO & LOGISTICS / PROFILE WIDGETS
// Reusable presentational pieces (data wired later — TODO: BACKEND).
// Country flags use flag glyphs since they are semantic content (no lucide
// equivalent for specific national flags); everything else uses lucide icons.
// ============================================================================

// #1 — Nationality + current residence (placed under a talent's name).
export function DualFlag({
  nationality,
  residence,
  residenceLabel,
}: {
  nationality: string
  residence: string
  residenceLabel: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span title="الجنسية" className="text-lg leading-none">
        {nationality}
      </span>
      <span className="text-muted-foreground/40">/</span>
      <span title="مكان الإقامة الحالي" className="text-lg leading-none">
        {residence}
      </span>
      <span className="text-xs">{residenceLabel}</span>
    </div>
  )
}

// #2 — Visa readiness chips.
export function VisaBadges({ visas }: { visas: { label: string; flag: string; ready: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {visas.map((v) => (
        <span
          key={v.label}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            v.ready
              ? 'border-success/40 bg-success/15 text-success'
              : 'border-destructive/40 bg-destructive/15 text-destructive',
          )}
        >
          <span className="text-sm leading-none">{v.flag}</span>
          {v.label}
          {v.ready ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        </span>
      ))}
    </div>
  )
}

// #3 — Local time indicator (placed next to a name in chat).
export function TimezoneIndicator({ time }: { time: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-warning/10 px-2 py-0.5 text-xs text-warning">
      <Clock className="h-3 w-3" />
      {time} (توقيته المحلي)
    </span>
  )
}

// #12 — Live local-time badge. Ticks every second using the given IANA
// timezone (e.g. "Asia/Kuwait") via Intl, so it always reflects the real
// current time in that person's zone rather than a hard-coded string.
export function LocalTimeBadge({
  timezone,
  label = 'توقيته المحلي',
}: {
  timezone: string
  label?: string
}) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Format defensively: an invalid timezone would throw, so fall back gracefully.
  let formatted = '—'
  if (now) {
    try {
      formatted = new Intl.DateTimeFormat('ar-EG', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now)
    } catch {
      formatted = now.toLocaleTimeString('ar-EG')
    }
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded bg-warning/10 px-2 py-0.5 text-xs tabular-nums text-warning"
      title={timezone}
      suppressHydrationWarning
    >
      <Clock className="h-3 w-3" />
      {formatted} ({label})
    </span>
  )
}

// #4 — Distance / radius locator (placed under equipment).
export function RadiusLocator({ km, note }: { km: number; note: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-success">
      <MapPin className="h-3 w-3" />
      يبعد عنك {km} كم ({note})
    </span>
  )
}

// #5 — Customs alert for cross-border equipment shipping.
export function CustomsAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-accent/50 bg-accent/15 p-3 text-sm text-accent-foreground">
      <AlertTriangle className="h-5 w-5 shrink-0 text-accent" />
      <p className="leading-relaxed text-foreground">{message}</p>
    </div>
  )
}

// #6 — Global holiday sync notice (placed in crew booking date picker).
export function HolidayAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
      <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
      {message}
    </div>
  )
}

// #19 — Union membership badge (gold).
export function UnionTag({ union }: { union: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-medium text-gold glow-gold">
      <ShieldCheck className="h-3 w-3" />
      عضو نقابة ({union})
    </span>
  )
}

// #16 — Language matchmaker tag (talent speaks the project language).
export function MatchmakerTag({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-success/50 bg-success/15 px-2.5 py-1 text-xs text-success">
      <CheckCircle2 className="h-3 w-3" />
      يتحدث لغة مشروعك ({language})
    </span>
  )
}

// #10 — Audio pronunciation of a name.
export function PronunciationButton({ name }: { name: string }) {
  return (
    <button
      type="button"
      title={`استمع لنطق الاسم: ${name}`}
      aria-label={`استمع لنطق اسم ${name}`}
      // TODO: BACKEND — play TTS / recorded pronunciation audio.
      className="rounded-full bg-secondary p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
    >
      <Volume2 className="h-4 w-4" />
    </button>
  )
}

// #9 — Auto-translated portfolio/bio note.
export function TranslatedNote({ from }: { from: string }) {
  return (
    <p className="flex items-center gap-1 text-xs italic text-muted-foreground">
      <Sparkles className="h-3 w-3 text-primary" />
      تُرجم تلقائياً من ({from}) عبر ذكاء Ask Crew
    </p>
  )
}

// #7 — Chat bubble with an inline "translate" affordance for foreign-language messages.
export function AutoTranslateMessage({
  message,
  targetLabel = 'العربية',
  translation,
}: {
  message: string
  targetLabel?: string
  translation?: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <div className="flex max-w-[80%] flex-col gap-1">
      <div className="rounded-xl rounded-tr-sm bg-secondary p-3 text-sm text-foreground" dir="ltr">
        {message}
      </div>
      {shown && translation && (
        <div className="rounded-xl bg-primary/10 p-3 text-sm text-foreground">{translation}</div>
      )}
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="flex w-full items-center justify-end gap-1 text-xs text-primary transition-colors hover:text-primary/80"
      >
        <Languages className="h-3 w-3" />
        {shown ? 'إخفاء الترجمة' : `ترجمة لـ${targetLabel}`}
      </button>
    </div>
  )
}

// #8 — Toggle button to display a contract in both languages side by side.
export function BilingualContractButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
    >
      <SplitSquareHorizontal className="h-4 w-4" />
      عرض العقد (عربي / English)
    </button>
  )
}

// #11 — Request subtitles for an uploaded VOD title.
export function SubtitlesButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
    >
      <Captions className="h-4 w-4" />
      طلب ترجمة (Subtitles)
    </button>
  )
}

// #12 — Price with a secondary "converted to local currency" line.
export function DynamicPrice({
  primary,
  converted,
  className,
}: {
  primary: string
  converted: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-xl font-black text-foreground">{primary}</span>
      <span className="text-xs text-muted-foreground">≈ {converted} (عملتك المحلية)</span>
    </div>
  )
}

// #13 — Supported payment gateway chips for the user's country.
export function GatewayIcons({
  country = 'الكويت',
  gateways,
}: {
  country?: string
  gateways: { label: string; className: string }[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">طرق الدفع المدعومة في ({country}):</span>
      <div className="flex gap-2">
        {gateways.map((g) => (
          <span
            key={g.label}
            className={cn(
              'flex h-6 w-12 items-center justify-center rounded border text-[9px] font-black',
              g.className,
            )}
          >
            {g.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// #14 — Purchasing-power saving hint banner for producers.
export function PurchasingPowerBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-r-4 border-success bg-success/10 p-3">
      <TrendingDown className="h-5 w-5 shrink-0 text-success" />
      <p className="text-sm text-foreground">{message}</p>
    </div>
  )
}

// #15 — Geo-blocking selector for content broadcast rights.
export function GeoBlockingControl() {
  const [mode, setMode] = useState<'global' | 'blocked'>('global')
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">حقوق البث الجغرافية (Geo-Blocking)</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('global')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition',
            mode === 'global'
              ? 'border-success/50 bg-success/15 text-success'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
          )}
        >
          <Globe className="h-4 w-4" />
          مسموح عالمياً
        </button>
        <button
          type="button"
          onClick={() => setMode('blocked')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition',
            mode === 'blocked'
              ? 'border-destructive/50 bg-destructive/15 text-destructive'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
          )}
        >
          <Ban className="h-4 w-4" />
          حظر دول معينة
        </button>
      </div>
    </div>
  )
}

// #17 — International VAT/tax disclaimer shown before signing a cross-border contract.
export function VATWarning({ country }: { country: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
      <Receipt className="h-5 w-5 shrink-0 text-destructive" />
      <p className="text-xs leading-relaxed text-foreground">
        <strong className="mb-1 block text-destructive">إخلاء مسؤولية ضريبية (VAT)</strong>
        هذا المستقل يقيم في ({country}). وفقاً للشروط والأحكام، منصة Ask Crew غير مسؤولة عن تحصيل أي
        ضرائب قيمة مضافة؛ الإقرار الضريبي يقع على عاتق المستقل.
      </p>
    </div>
  )
}
