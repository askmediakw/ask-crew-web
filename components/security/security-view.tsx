'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Droplets,
  CopyX,
  ScanEye,
  Focus,
  Fingerprint,
  FileSignature,
  Timer,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type SecurityToggle = {
  key: string
  title: string
  desc: string
  icon: LucideIcon
  value: boolean
  set: (v: boolean) => void
}

function ToggleRow({
  item,
  accent,
  execMode,
}: {
  item: SecurityToggle
  accent: string
  execMode: boolean
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      role="switch"
      aria-checked={item.value}
      aria-label={item.title}
      onClick={() => item.set(!item.value)}
      className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-right transition-colors hover:bg-white/5"
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            item.value ? (execMode ? 'bg-destructive/15' : 'bg-success/15') : 'bg-white/5',
          )}
        >
          <Icon className={cn('h-4 w-4', item.value ? accent : 'text-muted-foreground')} />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-foreground">{item.title}</span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.desc}</span>
        </span>
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          item.value ? (execMode ? 'bg-destructive' : 'bg-success') : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            item.value ? 'left-0.5' : 'left-[1.375rem]',
          )}
        />
      </span>
    </button>
  )
}

export function SecurityView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-success'

  // Anti-Theft & Security States
  const [dynamicWatermark, setDynamicWatermark] = useState(true)
  const [disableCopyPaste, setDisableCopyPaste] = useState(true)
  const [screenshotProtection, setScreenshotProtection] = useState(true)
  const [ndaRequired, setNdaRequired] = useState(false)
  const [selfDestructLinks, setSelfDestructLinks] = useState(false)
  const [invisibleFingerprint, setInvisibleFingerprint] = useState(true)
  const [focusBlurMode, setFocusBlurMode] = useState(false)
  const [vpnBlocker, setVpnBlocker] = useState(true)

  const uiProtection: SecurityToggle[] = [
    {
      key: 'watermark',
      title: 'العلامة المائية الديناميكية (Dynamic Watermark)',
      desc: 'طبع IP وإيميل القارئ بشفافية على النصوص والبوسترات.',
      icon: Droplets,
      value: dynamicWatermark,
      set: setDynamicWatermark,
    },
    {
      key: 'copypaste',
      title: 'منع النسخ واللصق والطباعة',
      desc: 'تعطيل Right-Click و Ctrl+C و Ctrl+P.',
      icon: CopyX,
      value: disableCopyPaste,
      set: setDisableCopyPaste,
    },
    {
      key: 'screenshot',
      title: 'التشويش وقت التصوير (Screenshot DRM)',
      desc: 'تعتيم الشاشة عند محاولة أخذ لقطة شاشة.',
      icon: ScanEye,
      value: screenshotProtection,
      set: setScreenshotProtection,
    },
    {
      key: 'focusblur',
      title: 'نطاق القراءة المحدود (Focus Blur)',
      desc: 'تغبيش النص بالكامل وتوضيح السطر الممرّر عليه فقط.',
      icon: Focus,
      value: focusBlurMode,
      set: setFocusBlurMode,
    },
  ]

  const accessLegal: SecurityToggle[] = [
    {
      key: 'fingerprint',
      title: 'البصمة الرقمية المخفية (Invisible Fingerprint)',
      desc: 'زرع كود سري بالصور لإثبات الملكية قانونياً.',
      icon: Fingerprint,
      value: invisibleFingerprint,
      set: setInvisibleFingerprint,
    },
    {
      key: 'nda',
      title: 'توقيع اتفاقية NDA إجبارية',
      desc: 'طلب موافقة رقمية قبل فتح أي سيناريو أو ملف حصري.',
      icon: FileSignature,
      value: ndaRequired,
      set: setNdaRequired,
    },
    {
      key: 'selfdestruct',
      title: 'روابط التدمير الذاتي (Self-Destruct)',
      desc: 'انتهاء صلاحية الرابط بعد فتحة واحدة فقط.',
      icon: Timer,
      value: selfDestructLinks,
      set: setSelfDestructLinks,
    },
    {
      key: 'vpn',
      title: 'حظر شبكات الـ VPN و Proxies',
      desc: 'منع المستخدمين المجهولين من الوصول للمحتوى الحساس.',
      icon: Globe,
      value: vpnBlocker,
      set: setVpnBlocker,
    },
  ]

  const activeCount =
    [...uiProtection, ...accessLegal].filter((t) => t.value).length
  const totalCount = uiProtection.length + accessLegal.length
  const shieldStrength = Math.round((activeCount / totalCount) * 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <ShieldCheck className={cn('h-7 w-7', accent)} />
            حماية المحتوى والأمان (Anti-Theft & DRM)
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ترسانة حماية فكرية متكاملة لمنع سرقة النصوص والميديا الخاصة بالمنصة.
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'rounded-xl px-6 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:opacity-90',
            execMode ? 'bg-destructive glow-alert' : 'bg-success',
          )}
        >
          تفعيل الدرع الأمني
        </button>
      </div>

      {/* Shield strength summary */}
      <div className={cn('glass rounded-2xl border p-6', execMode ? 'border-destructive/40' : 'border-success/40')}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">قوة الدرع الأمني</p>
            <p className={cn('mt-1 text-4xl font-black', accent)}>
              {shieldStrength}
              <span className="ms-1 text-lg font-bold text-muted-foreground">%</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeCount} من {totalCount} طبقات حماية مفعّلة
            </p>
          </div>
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              execMode ? 'bg-destructive/15' : 'bg-success/15',
            )}
          >
            <ShieldCheck className={cn('h-8 w-8', accent)} />
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={cn('h-full rounded-full transition-all', execMode ? 'bg-destructive' : 'bg-success')}
            style={{ width: `${shieldStrength}%` }}
          />
        </div>
      </div>

      {/* Two protection groups */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="glass rounded-2xl border border-border p-6">
          <h2 className="mb-4 border-b border-border pb-3 text-lg font-bold text-foreground">
            حماية الواجهة (UI Protection)
          </h2>
          <div className="space-y-1">
            {uiProtection.map((item) => (
              <ToggleRow key={item.key} item={item} accent={accent} execMode={execMode} />
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl border border-border p-6">
          <h2 className="mb-4 border-b border-border pb-3 text-lg font-bold text-foreground">
            قيود الوصول والملكية (Access & Legal)
          </h2>
          <div className="space-y-1">
            {accessLegal.map((item) => (
              <ToggleRow key={item.key} item={item} accent={accent} execMode={execMode} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
