import { NextResponse } from 'next/server'
import { purchasingPower, getCountry } from '@/lib/globalization'

// #14 Purchasing-power savings hint for producers hiring across borders.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const target = (searchParams.get('target') ?? 'EG').toUpperCase()
  const base = (searchParams.get('base') ?? 'KW').toUpperCase()

  const { savingsPct, cheaper } = purchasingPower(target, base)
  const country = getCountry(target)

  return NextResponse.json({
    source: 'mock',
    target,
    base,
    cheaper,
    savingsPct,
    message: cheaper
      ? `تعيين مستقل من (${country?.nameAr ?? target}) قد يوفر حتى ${savingsPct}% من ميزانيتك.`
      : 'لا توجد وفورات تكلفة ملحوظة لهذا البلد.',
  })
}
