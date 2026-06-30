'use client'

import { useState } from 'react'
import { X, ShoppingCart, Loader2, Truck, CheckCircle2, MapPin, PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import * as api from '@/services/api'
import type { Asset, DeliveryAddress, OrderTracking, OrderStatus } from '@/types'
import { kwd } from '@/lib/asset-config'

const ORDER_STEP_LABELS: Record<OrderStatus, string> = {
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم',
}

export function AssetCheckoutModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    country: asset.country,
    city: asset.city,
    line: '',
  })

  const itemKwd = (asset.purchaseKwd ?? 0) * quantity
  const deliveryFeeKwd = asset.deliveryFeeKwd ?? 0
  const totalKwd = Number((itemKwd + deliveryFeeKwd).toFixed(2))

  function update<K extends keyof DeliveryAddress>(key: K, value: DeliveryAddress[K]) {
    setAddress((a) => ({ ...a, [key]: value }))
  }

  async function handleBuy() {
    if (!address.fullName.trim() || !address.phone.trim() || !address.line.trim()) {
      toast.error('يرجى إكمال جميع حقول عنوان التوصيل.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.createOrder({
        assetId: asset.id,
        transactionType: 'buy',
        quantity,
        address,
        itemKwd,
        deliveryFeeKwd,
        totalKwd,
      })
      toast.success(res.message)
      setOrderId(res.orderId)
      const t = await api.trackOrder(res.orderId)
      setTracking(t)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر إتمام الطلب.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
            <ShoppingCart className="h-5 w-5 text-gold" />
            {tracking ? 'تتبع الطلب' : 'إتمام الشراء والتوصيل'}
          </h3>
          <button onClick={onClose} aria-label="إغلاق" className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {tracking ? (
          /* — Order tracking view — */
          <div className="space-y-5 p-5">
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 text-sm font-black text-foreground">تم تأكيد طلبك بنجاح</p>
              <p className="text-xs text-muted-foreground">رقم الطلب: {orderId}</p>
            </div>

            <div className="rounded-xl border border-border bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">شركة الشحن</span>
                <span className="font-bold text-foreground">{tracking.carrier}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">رقم التتبع</span>
                <span className="font-mono font-bold text-foreground">{tracking.trackingNumber}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الوصول المتوقع</span>
                <span className="font-bold text-success">{tracking.etaLabel}</span>
              </div>
            </div>

            {/* Timeline */}
            <ol className="relative space-y-4 border-s border-border ps-5">
              {tracking.steps.map((s) => (
                <li key={s.status} className="relative">
                  <span
                    className={cn(
                      'absolute -start-[1.6rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background',
                      s.done ? 'bg-success' : 'bg-muted',
                    )}
                  >
                    {s.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-bold', s.done ? 'text-foreground' : 'text-muted-foreground')}>
                      {s.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.date}</span>
                  </div>
                </li>
              ))}
            </ol>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90"
            >
              تم
            </button>
          </div>
        ) : (
          /* — Checkout form view — */
          <div className="space-y-5 p-5">
            {/* Item summary */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-white/5 p-3">
              <img src={asset.images[0] || '/placeholder.svg'} alt={asset.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-foreground">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{asset.condition === 'new' ? 'جديد' : 'مستعمل'}</p>
              </div>
              <div className="flex items-center rounded-lg border border-border">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-2.5 py-1 text-foreground hover:bg-white/10" aria-label="إنقاص الكمية">−</button>
                <span className="min-w-8 text-center text-sm font-black text-foreground">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-2.5 py-1 text-foreground hover:bg-white/10" aria-label="زيادة الكمية">+</button>
              </div>
            </div>

            {/* Delivery logistics */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-black text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                عنوان التوصيل
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Field label="الاسم الكامل" value={address.fullName} onChange={(v) => update('fullName', v)} />
                <Field label="رقم الهاتف" value={address.phone} onChange={(v) => update('phone', v)} dir="ltr" />
                <Field label="الدولة" value={address.country} onChange={(v) => update('country', v)} />
                <Field label="المدينة" value={address.city} onChange={(v) => update('city', v)} />
              </div>
              <Field label="العنوان التفصيلي" value={address.line} onChange={(v) => update('line', v)} full />
            </div>

            {/* Cost breakdown */}
            <div className="space-y-2 rounded-xl border border-border bg-white/5 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">قيمة المنتج ({quantity})</span>
                <span className="font-bold text-foreground">{kwd(itemKwd)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {asset.isShippable ? <Truck className="h-3.5 w-3.5" /> : <PackageCheck className="h-3.5 w-3.5" />}
                  رسوم التوصيل
                </span>
                <span className="font-bold text-foreground">{deliveryFeeKwd > 0 ? kwd(deliveryFeeKwd) : 'مجاناً'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="font-black text-foreground">الإجمالي</span>
                <span className="text-lg font-black text-gold">{kwd(totalKwd)}</span>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-black text-black shadow-lg shadow-gold/20 transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
              تأكيد الطلب والدفع
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  full,
  dir,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  full?: boolean
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <label className={cn('block', full && 'col-span-2')}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
      />
    </label>
  )
}
