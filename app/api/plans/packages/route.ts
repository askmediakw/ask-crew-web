import { NextResponse } from 'next/server'
import { cyclePrice, type BillingCycle } from '@/lib/globalization'

// #21 Package versions (A/B/VIP) + #22 billing cycles pricing engine.
// TODO(db): load packages/features from storage; mock defines a catalog.
type Variant = 'A' | 'B' | 'VIP'

const BASE_MONTHLY: Record<Variant, number> = { A: 5, B: 8, VIP: 20 }

const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const variant = (searchParams.get('variant') ?? 'A').toUpperCase() as Variant
  const monthly = BASE_MONTHLY[variant] ?? BASE_MONTHLY.A

  const pricing = CYCLES.map((cycle) => ({
    cycle,
    total: cyclePrice(monthly, cycle),
    currency: 'KWD',
  }))

  return NextResponse.json({ source: 'mock', variant, monthly, pricing })
}
