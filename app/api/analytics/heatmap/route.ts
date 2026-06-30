import { NextResponse } from 'next/server'

// #18 Geographic user-distribution heatmap data.
// TODO(db): aggregate real users by city; mock returns weighted points.
const MOCK_CITIES = [
  { city: 'الكويت', country: 'KW', lat: 29.3759, lng: 47.9774, users: 4200 },
  { city: 'الرياض', country: 'SA', lat: 24.7136, lng: 46.6753, users: 3100 },
  { city: 'دبي', country: 'AE', lat: 25.2048, lng: 55.2708, users: 2800 },
  { city: 'القاهرة', country: 'EG', lat: 30.0444, lng: 31.2357, users: 5400 },
  { city: 'الدوحة', country: 'QA', lat: 25.2854, lng: 51.531, users: 1500 },
  { city: 'عمّان', country: 'JO', lat: 31.9454, lng: 35.9284, users: 1200 },
  { city: 'بيروت', country: 'LB', lat: 33.8938, lng: 35.5018, users: 900 },
]

export async function GET() {
  const max = Math.max(...MOCK_CITIES.map((c) => c.users))
  const points = MOCK_CITIES.map((c) => ({ ...c, intensity: c.users / max }))
  return NextResponse.json({
    source: 'mock',
    total: MOCK_CITIES.reduce((s, c) => s + c.users, 0),
    points,
  })
}
