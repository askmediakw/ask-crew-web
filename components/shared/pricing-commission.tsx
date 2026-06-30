'use client'

import { Info } from 'lucide-react'
import { computePricing, kwd } from '@/lib/asset-config'

// ============================================================================
// PRICING + COMMISSION FIELD
// ----------------------------------------------------------------------------
// A reusable "Your Price" input that live-computes the platform commission and
// the final price shown to the client. Used in asset/service/job/VOD forms.
//
//   <PricingCommissionField value={price} onChange={setPrice} label="سعرك اليومي" />
// ============================================================================

export function PricingCommissionField({
  value,
  onChange,
  label = 'سعرك (د.ك)',
  hint,
}: {
  /** The raw vendor price as a string (controlled). */
  value: string
  onChange: (v: string) => void
  label?: string
  hint?: string
}) {
  const breakdown = computePricing(Number(value))

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white/5 p-4">
      <div>
        <label className="mb-2 block text-sm font-bold text-foreground">{label}</label>
        <div className="flex items-center overflow-hidden rounded-xl border border-border bg-background focus-within:border-primary">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.000"
            className="w-full bg-transparent px-3 py-2.5 text-foreground outline-none"
          />
          <span className="bg-secondary px-4 py-2.5 text-sm font-bold text-muted-foreground">د.ك</span>
        </div>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </div>

      {/* Live read-only commission breakdown */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            عمولة المنصة ({breakdown.ratePercent}%)
            <Info className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="font-bold text-warning">+ {kwd(breakdown.platformFee)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
          <span className="text-sm font-bold text-foreground">السعر النهائي للعميل</span>
          <span className="text-base font-black text-success">{kwd(breakdown.finalPrice)}</span>
        </div>
      </div>
    </div>
  )
}
