'use client'

import { cn } from '@/lib/utils'
import type { BnplProvider } from '@/types'

const INSTALLMENTS = 4

// Brand-styled pill logos (no external assets needed). Tabby = mint green,
// Tamara = warm coral — shown as distinct chips, never as a mixed gradient.
const providers: {
  id: BnplProvider
  name: string
  arabic: string
  badgeCls: string
  ringCls: string
}[] = [
  {
    id: 'tabby',
    name: 'tabby',
    arabic: 'تابي',
    badgeCls: 'bg-[#3eedbf] text-[#063b2e]',
    ringCls: 'border-[#3eedbf] bg-[#3eedbf]/10',
  },
  {
    id: 'tamara',
    name: 'tamara',
    arabic: 'تمارا',
    badgeCls: 'bg-[#ff6f61] text-white',
    ringCls: 'border-[#ff6f61] bg-[#ff6f61]/10',
  },
]

/**
 * Buy-Now-Pay-Later selector. Displays Tabby & Tamara with a live per-provider
 * installment breakdown. Controlled via `selected` / `onSelect`.
 */
export function BnplWidget({
  amountKwd,
  selected,
  onSelect,
}: {
  amountKwd: number
  selected: BnplProvider | null
  onSelect: (provider: BnplProvider) => void
}) {
  const perInstallment = amountKwd > 0 ? (amountKwd / INSTALLMENTS).toFixed(2) : '0.00'

  return (
    <div className="rounded-2xl border border-border bg-white/5 p-4">
      <p className="mb-3 text-sm font-bold text-foreground">
        قسّم فاتورتك على {INSTALLMENTS} دفعات بدون فوائد مع تابي أو تمارا
      </p>
      <div className="grid grid-cols-2 gap-2">
        {providers.map((p) => {
          const active = selected === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              aria-pressed={active}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition',
                active ? p.ringCls : 'border-border bg-white/5 hover:bg-white/10',
              )}
            >
              <span
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-black lowercase tracking-tight',
                  p.badgeCls,
                )}
              >
                {p.name}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground">{p.arabic}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {INSTALLMENTS} دفعات بقيمة{' '}
        <span className="font-black text-foreground">{perInstallment} د.ك</span> لكل دفعة
      </p>
    </div>
  )
}
