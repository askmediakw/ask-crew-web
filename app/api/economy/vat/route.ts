import { NextResponse } from 'next/server'
import { computeVat, getCountry } from '@/lib/globalization'

// #17 International VAT computation + disclaimer for cross-border contracts.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const amount = Number(searchParams.get('amount') ?? 0)
  const country = (searchParams.get('country') ?? 'KW').toUpperCase()

  const result = computeVat(amount, country)
  const info = getCountry(country)

  return NextResponse.json({
    source: 'mock',
    country,
    countryName: info?.nameAr,
    amount,
    ...result,
    disclaimer:
      'منصة Ask Crew غير مسؤولة عن تحصيل ضريبة القيمة المضافة؛ الإقرار الضريبي على عاتق المستقل.',
  })
}
