import { NextResponse } from 'next/server'

// #13 Payment gateway routing by user country.
// TODO(api-keys): connect Stripe / Tap / MyFatoorah and return real capability flags.
const GATEWAYS_BY_COUNTRY: Record<string, string[]> = {
  KW: ['KNET', 'VISA', 'MASTERCARD', 'APPLE_PAY'],
  SA: ['MADA', 'VISA', 'MASTERCARD', 'APPLE_PAY', 'STC_PAY'],
  AE: ['VISA', 'MASTERCARD', 'APPLE_PAY'],
  EG: ['FAWRY', 'VISA', 'MASTERCARD', 'MEEZA'],
  US: ['VISA', 'MASTERCARD', 'APPLE_PAY', 'PAYPAL'],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') ?? 'KW').toUpperCase()
  const gateways = GATEWAYS_BY_COUNTRY[country] ?? ['VISA', 'MASTERCARD']

  return NextResponse.json({ source: 'mock', country, gateways })
}
