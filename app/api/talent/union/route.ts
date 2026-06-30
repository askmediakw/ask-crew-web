import { NextResponse } from 'next/server'

// #19 Union / syndicate membership tags for talent (e.g. actors syndicate).
// TODO(db): verify membership against an official registry.
const MOCK_UNIONS: Record<number, { union: string; verified: boolean }[]> = {
  1: [{ union: 'نقابة المهن السينمائية (مصر)', verified: true }],
  2: [{ union: 'جمعية الإمارات للسينما', verified: true }],
  4: [{ union: 'نقابة الفنانين (الأردن)', verified: false }],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get('userId') ?? 0)
  return NextResponse.json({
    source: 'mock',
    userId,
    memberships: MOCK_UNIONS[userId] ?? [],
  })
}
