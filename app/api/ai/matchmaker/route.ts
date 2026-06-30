import { NextResponse } from 'next/server'
import { getCountry, purchasingPower, visaStatus } from '@/lib/globalization'

// #16 AI matchmaker: rank talents for a project by locale fit.
// TODO(api-keys): replace heuristic with an embeddings/LLM ranking via AI Gateway.
const MOCK_TALENTS = [
  { id: 1, name: 'أحمد خالد', role: 'مونتير', residence: 'EG' },
  { id: 2, name: 'سارة محمد', role: 'مخرجة', residence: 'AE' },
  { id: 3, name: 'خالد الفهد', role: 'مصور', residence: 'KW' },
  { id: 4, name: 'ليلى حسن', role: 'كاتبة', residence: 'JO' },
]

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const target = (body?.country ?? 'KW').toUpperCase()
  const budgetSensitive = Boolean(body?.budgetSensitive ?? true)

  const ranked = MOCK_TALENTS.map((t) => {
    const ppp = purchasingPower(t.residence, target)
    const visa = visaStatus(t.residence, target)
    // Simple score: cheaper + no visa hassle ranks higher.
    let score = 50
    if (budgetSensitive && ppp.cheaper) score += Math.min(ppp.savingsPct, 40)
    if (!visa.required) score += 15
    return {
      ...t,
      country: getCountry(t.residence)?.nameAr,
      savingsPct: ppp.savingsPct,
      visaRequired: visa.required,
      matchScore: Math.min(score, 99),
      tag: score > 80 ? 'أفضل تطابق' : score > 65 ? 'مرشح قوي' : 'مناسب',
    }
  }).sort((a, b) => b.matchScore - a.matchScore)

  return NextResponse.json({ source: 'mock', target, results: ranked })
}
