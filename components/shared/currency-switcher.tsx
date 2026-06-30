'use client'

import { Coins } from 'lucide-react'
import { useCurrency, CURRENCY_META, type CurrencyCode } from '@/lib/currency'

// Compact selector that drives the global currency context (#12).
export function CurrencySwitcher() {
  const { currency, setCurrency, isLive } = useCurrency()
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2">
      <Coins className="h-4 w-4 text-muted-foreground" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="اختيار العملة"
        className="bg-transparent text-sm font-bold text-foreground outline-none"
      >
        {(Object.keys(CURRENCY_META) as CurrencyCode[]).map((c) => (
          <option key={c} value={c} className="bg-popover">
            {c} — {CURRENCY_META[c].label}
          </option>
        ))}
      </select>
      <span
        className={`text-[10px] font-medium ${isLive ? 'text-success' : 'text-muted-foreground'}`}
        title={isLive ? 'أسعار صرف مباشرة' : 'أسعار صرف تقديرية'}
      >
        {isLive ? 'مباشر' : 'تقديري'}
      </span>
    </label>
  )
}
