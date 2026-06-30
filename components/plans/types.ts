export type Feature = {
  id: number
  name: string
  selected: boolean
  limit: number
  unlimited: boolean
}

export type PlanVariant = 'A' | 'B' | 'VIP'

export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

// Months covered + marketing discount per cycle (used for live price preview).
export const CYCLE_META: Record<
  BillingCycle,
  { label: string; short: string; months: number; discount: number; unit: string }
> = {
  monthly: { label: 'شهري', short: 'شهري', months: 1, discount: 0, unit: 'د.ك / شهرياً' },
  quarterly: { label: 'ربع سنوي (-10%)', short: 'ربع سنوي', months: 3, discount: 0.1, unit: 'د.ك / ربع سنوي' },
  semiannual: { label: 'نصف سنوي (-15%)', short: 'نصف سنوي', months: 6, discount: 0.15, unit: 'د.ك / نصف سنوي' },
  annual: { label: 'سنوي (-20%)', short: 'سنوي', months: 12, discount: 0.2, unit: 'د.ك / سنوياً' },
}
