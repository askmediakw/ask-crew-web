import { ok, fail, safe } from '@/lib/server/mock'
import { getCountry, cyclePrice, computeVat, type BillingCycle } from '@/lib/globalization'

// #20 — Checkout Session stub (+ #24 gateway routing, #23 VAT/tax liability).
// Accepts { packageId, billingCycle, country } and returns a mock success URL.
// The structure mirrors what Stripe/Tap return so we can swap the live call
// in later without changing the frontend.
//
// To go live:
//   - GCC countries  -> Tap Payments  (set TAP_SECRET_KEY)
//   - US/EU / other  -> Stripe        (set STRIPE_SECRET_KEY)

const MONTHLY: Record<string, number> = { A: 5, B: 8, VIP: 20 }
const VALID_CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export async function POST(req: Request) {
  let body: { packageId?: string; billingCycle?: string; country?: string }
  try {
    body = await req.json()
  } catch {
    return fail('Invalid JSON body')
  }

  const packageId = (body.packageId ?? 'A').toUpperCase()
  const billingCycle = (body.billingCycle ?? 'monthly') as BillingCycle
  const countryCode = (body.country ?? 'KW').toUpperCase()

  if (!(packageId in MONTHLY)) return fail(`Unknown packageId: ${packageId}`)
  if (!VALID_CYCLES.includes(billingCycle)) return fail(`Unknown billingCycle: ${billingCycle}`)

  const country = getCountry(countryCode)
  // #24 Payment Gateway Router: GCC -> Tap, otherwise -> Stripe.
  const gateway = country?.gcc ? 'tap' : 'stripe'
  const subtotal = cyclePrice(MONTHLY[packageId], billingCycle)
  // #23 VAT/tax liability flag (EU/UAE etc. carry tax).
  const { vat, total, rate } = computeVat(subtotal, countryCode)
  const taxLiability = rate > 0

  const provider = gateway === 'tap' ? 'TAP_SECRET_KEY' : 'STRIPE_SECRET_KEY'

  const { value, mock } = await safe(
    [provider],
    async () => {
      // TODO: BACKEND — create a real Stripe/Tap Checkout Session here and
      // return its hosted payment URL. Throwing falls back to the mock below.
      throw new Error('live gateway not wired')
    },
    () => {
      const sessionId = `cs_mock_${gateway}_${Math.random().toString(36).slice(2, 11)}`
      return {
        sessionId,
        gateway,
        packageId,
        billingCycle,
        currency: 'KWD',
        subtotal,
        vat,
        total,
        taxLiability,
        successUrl: `/payments?status=success&session=${sessionId}`,
        cancelUrl: `/plans?status=cancelled`,
      }
    },
  )

  return ok(value, mock)
}
