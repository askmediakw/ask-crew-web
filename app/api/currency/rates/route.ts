import { NextResponse } from 'next/server'

// #12 Dynamic currency conversion rates (base = KWD).
// TODO(api-keys): proxy ExchangeRate-API / Fixer and cache; falls back to static rates.
const FALLBACK = { KWD: 1, SAR: 12.25, AED: 11.99, EGP: 161.5, USD: 3.26 }

export async function GET() {
  const key = process.env.EXCHANGERATE_API_KEY
  if (key) {
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${key}/latest/KWD`,
        { next: { revalidate: 3600 } },
      )
      if (res.ok) {
        const data = await res.json()
        const c = data?.conversion_rates ?? {}
        return NextResponse.json({
          live: true,
          base: 'KWD',
          rates: {
            KWD: 1,
            SAR: c.SAR ?? FALLBACK.SAR,
            AED: c.AED ?? FALLBACK.AED,
            EGP: c.EGP ?? FALLBACK.EGP,
            USD: c.USD ?? FALLBACK.USD,
          },
        })
      }
    } catch {
      /* fall through to mock */
    }
  }
  return NextResponse.json({ live: false, base: 'KWD', rates: FALLBACK, source: 'mock' })
}
