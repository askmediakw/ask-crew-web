import { NextResponse } from 'next/server'

// #10 Name pronunciation audio.
// TODO(api-keys): synthesize via AWS Polly / ElevenLabs and return a real audio URL.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') ?? ''

  // Naive Latin transliteration hint as a safe fallback.
  return NextResponse.json({
    source: 'mock',
    name,
    phonetic: name ? `/${name.trim().replace(/\s+/g, '-').toLowerCase()}/` : '',
    audioUrl: null, // no TTS key yet
  })
}
