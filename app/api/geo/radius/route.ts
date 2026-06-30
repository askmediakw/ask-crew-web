import { NextResponse } from 'next/server'
import { haversineKm } from '@/lib/globalization'

// #4 Radius locator: distance between a user point and nearby venues/talent.
// Mock venues around Kuwait; real impl would use PostGIS ST_DWithin.
const MOCK_POINTS = [
  { id: 'v1', name: 'استوديو مدينة الكويت', lat: 29.3759, lng: 47.9774 },
  { id: 'v2', name: 'موقع حولي', lat: 29.3328, lng: 48.0263 },
  { id: 'v3', name: 'استوديو الأحمدي', lat: 29.0769, lng: 48.0838 },
  { id: 'v4', name: 'الجهراء', lat: 29.3375, lng: 47.6581 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat') ?? 29.3759)
  const lng = Number(searchParams.get('lng') ?? 47.9774)
  const radius = Number(searchParams.get('radius') ?? 30)

  const origin = { lat, lng }
  const results = MOCK_POINTS.map((p) => ({
    ...p,
    distanceKm: haversineKm(origin, { lat: p.lat, lng: p.lng }),
  }))
    .filter((p) => p.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  return NextResponse.json({ source: 'mock', radius, count: results.length, results })
}
