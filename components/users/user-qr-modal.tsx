'use client'

import { useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Check, Download, X, QrCode, Eye, Crown, Rocket, Building2, BadgeCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tier = 'VIP' | 'Pro' | 'Corporate' | 'Beginner' | 'Default'

type UserQRModalProps = {
  userId: number
  userName: string
  // Accepts any string so unknown package names from the backend safely fall back to "Default".
  tier?: string
  onClose: () => void
}

type TierTheme = {
  label: string
  icon: LucideIcon
  border: string
  glow: string
  badgeClass: string
  qrFrame: string
  accent: string
  button: string
}

// Multi-tier theme system. The QR itself always renders on a white card so it stays scannable.
const tierThemes: Record<Tier, TierTheme> = {
  VIP: {
    label: 'عضوية VIP',
    icon: Crown,
    border: 'border-gold/40',
    glow: 'shadow-[0_10px_40px_-10px] shadow-gold/40',
    badgeClass: 'bg-gold/15 text-gold border border-gold/40',
    qrFrame: 'border-gold/50 ring-2 ring-gold/30',
    accent: 'text-gold',
    button: 'bg-gold text-background',
  },
  Pro: {
    label: 'باقة برو',
    icon: Rocket,
    border: 'border-primary/40',
    glow: 'shadow-[0_10px_40px_-10px] shadow-primary/40',
    badgeClass: 'bg-primary/15 text-primary border border-primary/40',
    qrFrame: 'border-primary/40 ring-2 ring-primary/20',
    accent: 'text-primary',
    button: 'bg-primary text-primary-foreground',
  },
  Corporate: {
    label: 'حساب شركة',
    icon: Building2,
    border: 'border-accent/40',
    glow: 'shadow-[0_10px_40px_-10px] shadow-accent/40',
    badgeClass: 'bg-accent/15 text-accent border border-accent/40',
    qrFrame: 'border-accent/40 ring-2 ring-accent/20',
    accent: 'text-accent',
    button: 'bg-accent text-accent-foreground',
  },
  Beginner: {
    label: 'عضو أساسي',
    icon: BadgeCheck,
    border: 'border-border',
    glow: 'shadow-2xl',
    badgeClass: 'bg-white/5 text-muted-foreground border border-border',
    qrFrame: 'border-white/10',
    accent: 'text-primary',
    button: 'bg-primary text-primary-foreground',
  },
  // Fallback for any unrecognized tier sent by the backend.
  Default: {
    label: 'عضو موثق',
    icon: BadgeCheck,
    border: 'border-border',
    glow: 'shadow-2xl',
    badgeClass: 'bg-white/5 text-muted-foreground border border-border',
    qrFrame: 'border-white/10',
    accent: 'text-muted-foreground',
    button: 'bg-secondary text-secondary-foreground',
  },
}

export function UserQRModal({ userId, userName, tier = 'Default', onClose }: UserQRModalProps) {
  const profileUrl = `https://askcrew.com/view-profile/${userId}`
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  // Robust lookup: known tier → its theme; unknown/undefined → Default.
  const theme = tierThemes[(tier as Tier)] ?? tierThemes.Default
  const TierIcon = theme.icon

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  // Render the QR SVG onto a white canvas and download as PNG (works cross-browser)
  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const pad = 32
      canvas.width = img.width + pad * 2
      canvas.height = img.height + pad * 2
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, pad, pad)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `AskCrew_User_${userId}_QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'glass w-full max-w-sm rounded-2xl border p-6 text-center animate-slide-up',
          theme.border,
          theme.glow,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="qr-modal-title" className="flex items-center gap-2 text-lg font-black text-foreground">
            <QrCode className={cn('h-5 w-5', theme.accent)} />
            بطاقة زائر
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            للقراءة فقط
          </span>
        </div>

        {/* Tier badge */}
        <div className="mb-4 flex justify-center">
          <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', theme.badgeClass)}>
            <TierIcon className="h-3.5 w-3.5" />
            {theme.label}
          </span>
        </div>

        <p className="mb-4 truncate text-sm font-semibold text-foreground">{userName}</p>

        {/* QR stays on a white card so it remains scannable */}
        <div className="mb-5 flex justify-center">
          <div ref={qrRef} className={cn('rounded-xl border bg-white p-4', theme.qrFrame)}>
            <QRCode value={profileUrl} size={188} level="H" />
          </div>
        </div>

        <input
          type="text"
          value={profileUrl}
          readOnly
          dir="ltr"
          onFocus={(e) => e.currentTarget.select()}
          className="mb-4 w-full rounded-lg border border-border bg-white/5 px-3 py-2.5 text-left text-xs text-muted-foreground outline-none focus:border-primary"
        />

        <div className="mb-3 flex gap-2">
          <button
            onClick={handleCopy}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold transition hover:opacity-90',
              copied ? 'bg-success text-white' : theme.button,
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
          <button
            onClick={downloadQR}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2.5 text-sm font-bold text-secondary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            تحميل الصورة
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-transparent px-3 py-2 text-sm font-bold text-destructive transition hover:bg-destructive hover:text-white"
        >
          <X className="h-4 w-4" />
          إغلاق
        </button>
      </div>
    </div>
  )
}
