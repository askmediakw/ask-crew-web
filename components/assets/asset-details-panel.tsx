'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Loader2,
  Star,
  MapPin,
  Globe,
  Truck,
  PackageCheck,
  Users,
  CircleParking,
  UserCheck,
  UtensilsCrossed,
  Tag,
  CalendarPlus,
  ShoppingCart,
  ListChecks,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { useEscrow } from '@/lib/escrow-store'
import * as api from '@/services/api'
import type { Asset, AssetAvailability, TransactionType } from '@/types'
import { ASSET_TYPES, kwd } from '@/lib/asset-config'
import { AvailabilityCalendar } from '@/components/users/availability-calendar'
import { AssetCheckoutModal } from '@/components/assets/asset-checkout-modal'

export function AssetDetailsPanel({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const { toast } = useToast()
  const { refresh } = useEscrow()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [availability, setAvailability] = useState<AssetAvailability | null>(null)
  const [shown, setShown] = useState(false)
  const [tab, setTab] = useState<TransactionType>('rent')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [days, setDays] = useState(1)
  const [shipping, setShipping] = useState(false)
  const [booking, setBooking] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    let active = true
    setAsset(null)
    setAvailability(null)
    api.fetchAssetById(assetId).then((a) => {
      if (!active) return
      setAsset(a)
      // Default the transaction tab to whatever the asset supports first.
      setTab(a.transactionTypes.includes('rent') ? 'rent' : 'buy')
      setShipping(Boolean(a.isShippable))
    })
    api.fetchAssetAvailability(assetId).then((av) => {
      if (active) setAvailability(av)
    })
    return () => {
      active = false
    }
  }, [assetId])

  function handleClose() {
    setShown(false)
    setTimeout(onClose, 250)
  }

  async function handleBookRental() {
    if (!asset || asset.dayRateKwd === undefined) return
    if (!selectedDate) {
      toast.error('يرجى اختيار تاريخ من الرزنامة أولاً.')
      return
    }
    const amount = asset.dayRateKwd * days + (shipping ? asset.deliveryFeeKwd ?? 0 : 0)
    setBooking(true)
    try {
      const res = await api.bookAsset({ assetId: asset.id, date: selectedDate, days, shipping, amountKwd: amount })
      toast.success(res.message)
      refresh()
      const av = await api.fetchAssetAvailability(asset.id)
      setAvailability(av)
      setSelectedDate(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر تأكيد الحجز.')
    } finally {
      setBooking(false)
    }
  }

  const meta = asset ? ASSET_TYPES[asset.type] : null
  const TypeIcon = meta?.icon ?? Globe
  const canRent = asset?.transactionTypes.includes('rent')
  const canBuy = asset?.transactionTypes.includes('buy')
  const rentalTotal =
    asset && asset.dayRateKwd !== undefined
      ? asset.dayRateKwd * days + (shipping ? asset.deliveryFeeKwd ?? 0 : 0)
      : 0

  return (
    <div className="fixed inset-0 z-[120]" role="presentation">
      {/* Scrim */}
      <div
        className={cn('absolute inset-0 bg-black/60 transition-opacity duration-300', shown ? 'opacity-100' : 'opacity-0')}
        onClick={handleClose}
      />

      {/* Drawer — anchored to inline-end, opposite the sidebar. */}
      <aside
        className={cn(
          'absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-border bg-background shadow-2xl transition-transform duration-300 ease-out',
          shown ? 'translate-x-0' : 'rtl:-translate-x-full ltr:translate-x-full',
        )}
        role="dialog"
        aria-label="تفاصيل الأصل"
      >
        {!asset ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">جارٍ تحميل بيانات الأصل...</p>
          </div>
        ) : (
          <>
            {/* Header with cover image */}
            <header className="relative">
              <div className="relative aspect-video w-full overflow-hidden">
                <img src={asset.images[0] || '/placeholder.svg'} alt={asset.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <button
                  onClick={handleClose}
                  aria-label="إغلاق"
                  className="absolute end-3 top-3 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
                <span
                  className={cn(
                    'absolute start-3 top-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black backdrop-blur-sm',
                    meta?.badgeClass,
                  )}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  {meta?.label}
                </span>
              </div>
              <div className="px-5 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-black leading-snug text-foreground">{asset.name}</h2>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-black text-gold">
                    <Star className="h-4 w-4 fill-gold" />
                    {asset.rating.toFixed(1)}
                    <span className="text-xs font-normal text-muted-foreground">({asset.reviewCount})</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{asset.provider}</p>
              </div>
            </header>

            {/* Scrollable body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
              <p className="text-sm leading-relaxed text-foreground/90">{asset.description}</p>

              {/* Geographic availability */}
              <Section icon={MapPin} title="التوفر الجغرافي">
                <Row label="الموقع" value={`${asset.city}، ${asset.country}`} />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">متوفر في:</span>
                  {asset.availableIn.map((c) => (
                    <span key={c} className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                      <Globe className="h-3 w-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Shipping & logistics toggle — equipment/props/wardrobe only */}
              {!meta?.isVenue && (
                <Section icon={Truck} title="الشحن والتوصيل">
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3',
                      asset.isShippable ? 'border-success/40 bg-success/10' : 'border-border bg-white/5',
                    )}
                  >
                    {asset.isShippable ? (
                      <Truck className="h-6 w-6 shrink-0 text-success" />
                    ) : (
                      <PackageCheck className="h-6 w-6 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className={cn('text-sm font-black', asset.isShippable ? 'text-success' : 'text-foreground')}>
                        {asset.isShippable ? 'قابل للشحن' : 'استلام شخصي فقط'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset.isShippable
                          ? `رسوم التوصيل: ${kwd(asset.deliveryFeeKwd ?? 0)}`
                          : 'يُستلم من موقع المزوّد مباشرة.'}
                      </p>
                    </div>
                  </div>
                </Section>
              )}

              {/* Dynamic type-specific metadata */}
              <Section icon={Sparkles} title="المواصفات">
                <div className="grid grid-cols-2 gap-2">
                  {asset.capacity !== undefined && (
                    <MetaTile icon={Users} label="السعة" value={`${asset.capacity.toLocaleString('en-US')} مقعد`} />
                  )}
                  {asset.hasParking !== undefined && (
                    <MetaTile icon={CircleParking} label="مواقف سيارات" value={asset.hasParking ? 'متوفرة' : 'غير متوفرة'} />
                  )}
                  {asset.hasDriver !== undefined && (
                    <MetaTile icon={UserCheck} label="السائق" value={asset.hasDriver ? 'يشمل سائق' : 'بدون سائق'} />
                  )}
                  {asset.mealCount !== undefined && (
                    <MetaTile icon={UtensilsCrossed} label="عدد الوجبات" value={`${asset.mealCount} وجبة`} />
                  )}
                  {asset.condition && (
                    <MetaTile icon={Tag} label="الحالة" value={asset.condition === 'new' ? 'جديد' : 'مستعمل'} />
                  )}
                  {Object.entries(asset.metadata).map(([k, v]) => (
                    <MetaTile key={k} icon={ListChecks} label={k} value={String(v)} />
                  ))}
                </div>
              </Section>

              {/* Availability calendar */}
              <Section icon={CalendarPlus} title="تاريخ التوفر">
                {availability ? (
                  <AvailabilityCalendar
                    month={availability.month}
                    bookedDates={availability.bookedDates}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border border-border bg-white/5 py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </Section>

              {/* Transaction type tabs (rent vs buy) */}
              {canRent && canBuy && (
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-white/5 p-1">
                  <TabButton label="تأجير" active={tab === 'rent'} onClick={() => setTab('rent')} />
                  <TabButton label="شراء" active={tab === 'buy'} onClick={() => setTab('buy')} />
                </div>
              )}
            </div>

            {/* Sticky footer action */}
            <footer className="border-t border-border bg-background/95 p-4 backdrop-blur">
              {tab === 'rent' && canRent && asset.dayRateKwd !== undefined ? (
                <>
                  {/* Rental controls */}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">عدد الأيام</span>
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => setDays((d) => Math.max(1, d - 1))}
                          className="px-2.5 py-1 text-foreground hover:bg-white/10"
                          aria-label="إنقاص الأيام"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm font-black text-foreground">{days}</span>
                        <button
                          type="button"
                          onClick={() => setDays((d) => d + 1)}
                          className="px-2.5 py-1 text-foreground hover:bg-white/10"
                          aria-label="زيادة الأيام"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {!meta?.isVenue && asset.isShippable && (
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-foreground">
                        <input
                          type="checkbox"
                          checked={shipping}
                          onChange={(e) => setShipping(e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                        توصيل ({kwd(asset.deliveryFeeKwd ?? 0)})
                      </label>
                    )}
                  </div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">الإجمالي</span>
                    <span className="text-xl font-black text-foreground">{kwd(rentalTotal)}</span>
                  </div>
                  <button
                    onClick={handleBookRental}
                    disabled={booking}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                    حجز الأصل
                  </button>
                </>
              ) : (
                canBuy &&
                asset.purchaseKwd !== undefined && (
                  <>
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">سعر الشراء (ملكية كاملة)</span>
                      <span className="text-xl font-black text-foreground">{kwd(asset.purchaseKwd)}</span>
                    </div>
                    <button
                      onClick={() => setCheckoutOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-black text-black shadow-lg shadow-gold/20 transition hover:opacity-90 glow-gold"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      شراء الآن
                    </button>
                  </>
                )
              )}
            </footer>
          </>
        )}
      </aside>

      {checkoutOpen && asset && asset.purchaseKwd !== undefined && (
        <AssetCheckoutModal
          asset={asset}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  )
}

// — Small presentational helpers —
function Section({ icon: Icon, title, children }: { icon: typeof Globe; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  )
}

function MetaTile({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/5 p-3">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 text-sm font-black text-foreground">{value}</p>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg py-2 text-sm font-black transition',
        active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
