import { NextResponse } from 'next/server'

// #6 National holiday sync per country (affects crew availability).
// Mock calendar; real impl would call a holidays API (e.g. Nager.Date).
const MOCK_HOLIDAYS: Record<string, { date: string; name: string }[]> = {
  KW: [
    { date: '2026-02-25', name: 'العيد الوطني' },
    { date: '2026-02-26', name: 'يوم التحرير' },
  ],
  AE: [{ date: '2026-12-02', name: 'اليوم الوطني الإماراتي' }],
  SA: [{ date: '2026-09-23', name: 'اليوم الوطني السعودي' }],
  EG: [{ date: '2026-07-23', name: 'ثورة 23 يوليو' }],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') ?? 'KW').toUpperCase()
  const holidays = MOCK_HOLIDAYS[country] ?? []

  return NextResponse.json({ source: 'mock', country, holidays })
}
