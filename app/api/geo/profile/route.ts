import { NextResponse } from 'next/server'
import { getCountry, visaStatus, localTimeFor } from '@/lib/globalization'

// #1 Dual nationality/residence flags, #2 visa status, #3 timezone for a talent.
// Mock: derives everything from query params with safe fallbacks.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nationality = searchParams.get('nationality') ?? 'KW'
  const residence = searchParams.get('residence') ?? 'KW'
  const target = searchParams.get('target') ?? 'KW'

  const nat = getCountry(nationality) ?? getCountry('KW')!
  const res = getCountry(residence) ?? getCountry('KW')!
  const visa = visaStatus(residence, target)
  const time = localTimeFor(residence)

  return NextResponse.json({
    source: 'mock',
    nationality: { code: nat.code, name: nat.nameAr, flag: nat.flag },
    residence: { code: res.code, name: res.nameAr, flag: res.flag },
    visa,
    localTime: time,
  })
}
