import Image from 'next/image'
import { Check, Infinity as InfinityIcon } from 'lucide-react'
import type { Feature, BillingCycle, PlanVariant } from '@/components/plans/types'
import { CYCLE_META } from '@/components/plans/types'

export function MobilePreview({
  planName,
  planType,
  price,
  variant,
  features,
  execMode = false,
  badge = '',
  billingCycle = 'monthly',
  ctaText = 'اشترك الآن',
}: {
  planName: string
  planType: string
  price: string
  variant: PlanVariant
  features: Feature[]
  execMode?: boolean
  badge?: string
  billingCycle?: BillingCycle
  ctaText?: string
}) {
  const selected = features.filter((f) => f.selected)
  const accentClass = execMode
    ? 'text-destructive'
    : variant === 'VIP'
      ? 'text-gold'
      : variant === 'B'
        ? 'text-accent'
        : 'text-primary'
  const buttonClass = execMode
    ? 'bg-destructive text-white'
    : variant === 'VIP'
      ? 'bg-gold text-background'
      : variant === 'B'
        ? 'bg-accent text-accent-foreground'
        : 'bg-primary text-primary-foreground'

  const numericPrice = Number(price) || 0
  const meta = CYCLE_META[billingCycle]
  // Total for the billing period with the cycle's marketing discount applied.
  const displayPrice = Math.round(numericPrice * meta.months * (1 - meta.discount))
  const cycleLabel = meta.unit

  return (
    <div className="mx-auto w-[300px] shrink-0">
      <div
        className={`relative h-[600px] w-[300px] overflow-hidden rounded-[2.75rem] border-[10px] border-black bg-black shadow-2xl ${execMode ? 'glow-alert' : 'glow-brand'}`}
      >
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />

        <div className="flex h-full flex-col overflow-y-auto bg-[#0f0a1e] scrollbar-thin" dir="rtl">
          {/* app header */}
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4 pt-7">
            <div className="relative h-7 w-7 overflow-hidden rounded-lg">
              <Image src="/logo.png" alt="ASK CREW" fill className="object-cover" sizes="28px" />
            </div>
            <span className="text-sm font-black tracking-widest text-white">ASK CREW</span>
            <span className="mr-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
              {variant === 'VIP' ? 'VIP' : `نسخة ${variant}`}
            </span>
          </div>

          <div className="flex-1 p-4">
            <p className="text-center text-[11px] font-medium text-white/40">معاينة التطبيق</p>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              {badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black tracking-wide shadow-lg ${
                    execMode ? 'bg-destructive text-white' : 'bg-gold text-black'
                  }`}
                >
                  {badge}
                </span>
              )}
              <p className={`text-xs font-bold ${accentClass}`}>{planType || 'نوع الباقة'}</p>
              <h3 className="mt-1 text-xl font-black text-white">{planName || 'اسم الباقة'}</h3>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-black text-white">{displayPrice || '0'}</span>
                <span className="mb-1 text-xs text-white/50">{cycleLabel}</span>
              </div>
              {/* #12 Dynamic currency conversion (KWD → SAR ≈ 12.25) */}
              <p className="mt-1 text-[11px] text-white/40">
                ≈ {Math.round(displayPrice * 12.25).toLocaleString('en-US')} ريال سعودي (عملتك المحلية)
              </p>

              <ul className="mt-5 space-y-3">
                {selected.length === 0 && (
                  <li className="rounded-lg border border-dashed border-white/10 py-4 text-center text-xs italic text-white/40">
                    لم يتم اختيار مميزات بعد
                  </li>
                )}
                {selected.map((f) => (
                  <li key={f.id} className="flex items-center gap-2.5 text-sm text-white/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span
                      className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        f.unlimited
                          ? 'bg-gold/15 text-gold'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {f.unlimited ? (
                        <>
                          <InfinityIcon className="h-3 w-3" />
                          مفتوح
                        </>
                      ) : (
                        <span>{f.limit}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-6 w-full rounded-xl py-3 text-sm font-bold shadow-lg ${buttonClass}`}
              >
                {ctaText || 'اشترك الآن'}
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] text-white/30">
              يمكنك الإلغاء في أي وقت — بدون التزامات
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
