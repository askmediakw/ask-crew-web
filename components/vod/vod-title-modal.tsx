'use client'

import { useState } from 'react'
import {
  X,
  Star,
  Clock,
  Download,
  Users,
  Play,
  Loader2,
  Check,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import * as api from '@/services/api'
import type { VodTitle, VodAccessTier } from '@/types'

const TIER_LABEL: Record<VodAccessTier, string> = {
  free: 'مجاني',
  rent: 'تأجير',
  buy: 'شراء',
  subscription: 'بالاشتراك',
}

function formatViews(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return `${v}`
}

export function VodTitleModal({ title, onClose }: { title: VodTitle; onClose: () => void }) {
  const { toast } = useToast()
  const [busyTier, setBusyTier] = useState<VodAccessTier | null>(null)
  const [owned, setOwned] = useState<VodAccessTier | null>(null)
  const [offline, setOffline] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  // Watch party
  const [partyOpen, setPartyOpen] = useState(false)
  const [invitees, setInvitees] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [chatEnabled, setChatEnabled] = useState(true)
  const [creatingParty, setCreatingParty] = useState(false)
  const [partyUrl, setPartyUrl] = useState<string | null>(null)

  async function handleAccess(tier: VodAccessTier) {
    if (tier === 'free' || tier === 'subscription') {
      setOwned(tier)
      toast.success(tier === 'free' ? 'العنوان متاح للمشاهدة المجانية.' : 'تم تفعيل الوصول عبر اشتراكك.')
      return
    }
    const amount = tier === 'rent' ? title.rentKwd ?? 0 : title.buyKwd ?? 0
    setBusyTier(tier)
    try {
      const res = await api.checkoutVod({ titleId: title.id, tier, amountKwd: amount, offline })
      setOwned(res.tier)
      toast.success(res.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذّر إتمام العملية.')
    } finally {
      setBusyTier(null)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    // Simulate DRM-protected offline packaging.
    await new Promise((r) => setTimeout(r, 1500))
    setDownloading(false)
    setDownloaded(true)
    toast.success('تم تنزيل نسخة محمية بـ DRM للمشاهدة دون اتصال.')
  }

  async function handleCreateParty() {
    const list = invitees
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    setCreatingParty(true)
    try {
      const res = await api.createWatchParty({
        titleId: title.id,
        scheduledAt: scheduledAt || new Date().toISOString(),
        invitees: list,
        chatEnabled,
      })
      setPartyUrl(res.joinUrl)
      toast.success(res.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذّر إنشاء حفلة المشاهدة.')
    } finally {
      setCreatingParty(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`تفاصيل ${title.title}`}
      onClick={onClose}
    >
      <div
        className="glass relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img src={title.poster || '/placeholder.svg'} alt={title.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
          {title.top10Rank && (
            <span className="absolute start-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-black text-white">
              #{title.top10Rank} في Top 10
            </span>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-2xl font-black text-foreground">{title.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-bold text-gold">
                <Star className="h-3.5 w-3.5 fill-gold" />
                {title.rating.toFixed(1)}
              </span>
              <span>{title.year}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {title.durationMin} د
              </span>
              <span className="rounded border border-border px-1.5 py-0.5">{title.maturity}</span>
              <span>{title.genre}</span>
              <span>{formatViews(title.views)} مشاهدة</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">من إنتاج: {title.producer}</p>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">{title.synopsis}</p>

          {/* Access tiers — producer pricing */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground">خيارات المشاهدة</h3>
            <div className="flex flex-wrap gap-2">
              {title.accessTiers.map((tier) => {
                const isOwned = owned === tier
                const price =
                  tier === 'rent' ? title.rentKwd : tier === 'buy' ? title.buyKwd : undefined
                return (
                  <button
                    key={tier}
                    type="button"
                    disabled={busyTier !== null || isOwned}
                    onClick={() => handleAccess(tier)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition',
                      isOwned
                        ? 'border-success bg-success/15 text-success'
                        : 'border-border bg-white/5 text-foreground hover:border-primary',
                    )}
                  >
                    {busyTier === tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOwned ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {TIER_LABEL[tier]}
                    {price !== undefined && <span className="text-xs text-muted-foreground">{price} د.ك</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Offline download (DRM) */}
          {title.offlineEnabled && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-bold text-foreground">التنزيل للمشاهدة دون اتصال</p>
                  <p className="text-xs text-muted-foreground">نسخة محمية بـ DRM تُحذف تلقائياً عند انتهاء الصلاحية</p>
                </div>
              </div>
              {!owned ? (
                <span className="text-xs text-muted-foreground">يتطلب وصولاً</span>
              ) : downloaded ? (
                <span className="flex items-center gap-1 text-xs font-bold text-success">
                  <Check className="h-4 w-4" />
                  مُنزّل
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  تنزيل
                </button>
              )}
            </div>
          )}

          {/* Watch party */}
          <div className="rounded-xl border border-border bg-white/5 p-4">
            <button
              type="button"
              onClick={() => setPartyOpen((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Users className="h-5 w-5 text-gold" />
                حفلة مشاهدة جماعية
              </span>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </button>

            {partyOpen && (
              <div className="mt-4 space-y-3">
                {partyUrl ? (
                  <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
                    <p className="font-bold">تم إنشاء الحفلة!</p>
                    <p className="mt-1 break-all font-mono text-xs">{partyUrl}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">المدعوون (افصل بفاصلة)</label>
                      <input
                        className="input-base"
                        placeholder="نورة، أحمد، سارة"
                        value={invitees}
                        onChange={(e) => setInvitees(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">موعد العرض</label>
                      <input
                        type="datetime-local"
                        className="input-base"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={chatEnabled}
                        onChange={(e) => setChatEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border"
                      />
                      تفعيل الدردشة أثناء المشاهدة
                    </label>
                    <button
                      type="button"
                      onClick={handleCreateParty}
                      disabled={creatingParty}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-60"
                    >
                      {creatingParty ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                      إنشاء الحفلة وإرسال الدعوات
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
