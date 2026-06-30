import { NextResponse } from 'next/server'
import { getCountry } from '@/lib/globalization'

// #5 Customs alert for cross-border equipment shipments (ATA Carnet).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? 'KW'
  const to = searchParams.get('to') ?? 'KW'

  const origin = getCountry(from)
  const dest = getCountry(to)
  const crossBorder = from.toUpperCase() !== to.toUpperCase()
  // GCC has a unified customs union — lighter requirements.
  const gccInternal = Boolean(origin?.gcc && dest?.gcc)

  return NextResponse.json({
    source: 'mock',
    crossBorder,
    carnetRequired: crossBorder && !gccInternal,
    message: !crossBorder
      ? 'شحن داخلي — لا توجد إجراءات جمركية.'
      : gccInternal
        ? 'شحن داخل الاتحاد الجمركي الخليجي — إجراءات مبسطة.'
        : 'شحن دولي — يتطلب تخليص كارنيه جمركي (ATA Carnet) قبل الشحن.',
  })
}
