import { NextResponse } from 'next/server'

// #8 Bilingual (AR/EN) contract generation.
// TODO(api-keys): render a real PDF (e.g. @react-pdf/renderer) once contract data is wired.
const CLAUSES = [
  {
    ar: 'يتعهد الطرف الثاني بتقديم الخدمات المتفق عليها وفق الجدول الزمني المحدد.',
    en: 'The second party undertakes to deliver the agreed services per the defined schedule.',
  },
  {
    ar: 'تكون جميع حقوق الملكية الفكرية للعمل النهائي ملكاً للطرف الأول.',
    en: 'All intellectual property rights of the final work shall belong to the first party.',
  },
  {
    ar: 'يقع الإقرار الضريبي على عاتق الطرف الثاني وفقاً لبلد إقامته.',
    en: 'Tax declaration is the responsibility of the second party per their country of residence.',
  },
]

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const company: string = body?.company ?? 'الطرف الأول'
  const talent: string = body?.talent ?? 'الطرف الثاني'

  return NextResponse.json({
    source: 'mock',
    company,
    talent,
    format: 'bilingual',
    clauses: CLAUSES,
    // Placeholder; real impl returns a signed PDF URL.
    pdfUrl: null,
  })
}
