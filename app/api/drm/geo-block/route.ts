import { NextResponse } from 'next/server'

// #15 Geo-blocking rules for content broadcast rights.
// GET: fetch current rules for a title. POST: save new rules.
// TODO(db): persist rules; mock keeps them in-memory per request.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const titleId = searchParams.get('titleId') ?? 'unknown'
  return NextResponse.json({
    source: 'mock',
    titleId,
    mode: 'global', // 'global' | 'allow' | 'block'
    countries: [],
  })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const mode = body?.mode ?? 'global'
  const countries: string[] = body?.countries ?? []
  return NextResponse.json({
    source: 'mock',
    saved: true,
    mode,
    countries,
    message:
      mode === 'global'
        ? 'البث مسموح عالمياً.'
        : `${mode === 'block' ? 'حظر' : 'سماح'} ${countries.length} دولة.`,
  })
}
