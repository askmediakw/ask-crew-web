import { NextResponse } from 'next/server'

// #11 Subtitle generation request for a VOD title.
// TODO(api-keys): enqueue a transcription job (OpenAI Whisper / AWS Transcribe) and track status.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const titleId = body?.titleId ?? null
  const title = body?.title ?? ''
  const langs: string[] = body?.langs ?? ['ar', 'en']

  return NextResponse.json({
    source: 'mock',
    jobId: `sub_${Math.random().toString(36).slice(2, 10)}`,
    titleId,
    title,
    langs,
    status: 'queued',
    etaMinutes: 12,
  })
}
