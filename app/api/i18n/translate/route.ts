import { NextResponse } from 'next/server'

// #7 Chat auto-translate & #9 bio translation.
// TODO(api-keys): replace mock with Vercel AI Gateway (generateText) or DeepL/Google Translate.
const MOCK_DICT: Record<string, string> = {
  'Can we change the shooting location to the beach?':
    'هل يمكننا تغيير موقع التصوير إلى الشاطئ؟',
  'I am available next week.': 'أنا متاح الأسبوع القادم.',
  'Please send the final cut.': 'يرجى إرسال النسخة النهائية.',
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const text: string = body?.text ?? ''
  const target: string = body?.target ?? 'ar'

  // Safe fallback: return a known translation or a clearly-marked echo.
  const translation =
    MOCK_DICT[text.trim()] ?? `[ترجمة تلقائية → ${target}] ${text}`

  return NextResponse.json({
    source: 'mock',
    detectedLang: /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en',
    target,
    original: text,
    translation,
  })
}
