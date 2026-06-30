import Link from 'next/link'
import { Check, Lock, Sparkles } from 'lucide-react'
import { PublicNav } from '@/components/public/public-nav'

export const metadata = {
  title: 'الأسعار · ASK CREW',
  description: 'باقات اشتراك ASK CREW — ابدأ مجاناً وارتقِ عند الحاجة. نموذج فريميوم مع ميزات مدفوعة.',
}

// ── Master feature list — every tier marks each as unlocked or locked ──
const FEATURES = [
  'مشاهدة المحتوى المجاني (VOD)',
  'ملف تعريفي احترافي',
  'التقديم على الوظائف والكاستينج',
  'عقود ذكية بتوقيع رقمي',
  'سوق المعدات والتأجير',
  'بث VOD بدقة 4K بدون إعلانات',
  'ورش عمل وتدريب حصري',
  'تحليلات متقدمة + تكامل API',
  'مدير حساب ودعم أولوية',
] as const

type Tier = {
  name: string
  price: string
  period: string
  badge?: string
  highlighted?: boolean
  cta: string
  /** Index count from FEATURES that are unlocked (rest show a padlock). */
  unlocked: number
}

const TIERS: Tier[] = [
  { name: 'مجاني', price: '0', period: 'للأبد', badge: 'ابدأ هنا', cta: 'ابدأ مجاناً', unlocked: 2 },
  { name: 'مستقل', price: '9', period: 'شهرياً', cta: 'اشترك الآن', unlocked: 5 },
  { name: 'احترافي', price: '29', period: 'شهرياً', badge: 'الأكثر شيوعاً', highlighted: true, cta: 'اشترك الآن', unlocked: 7 },
  { name: 'شركة', price: '99', period: 'شهرياً', cta: 'تواصل معنا', unlocked: 9 },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            نموذج فريميوم — ابدأ مجاناً
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-balance md:text-5xl">باقات تناسب الجميع</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            جرّب المنصة مجاناً، ثم افتح الميزات المتقدمة عندما تكون جاهزاً.
          </p>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`glass relative flex flex-col rounded-2xl border p-6 ${
                t.highlighted ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              {t.badge && (
                <span
                  className={`absolute -top-3 right-6 rounded-full px-3 py-1 text-[11px] font-black ${
                    t.highlighted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                  }`}
                >
                  {t.badge}
                </span>
              )}
              <h2 className="text-lg font-bold">{t.name}</h2>
              <p className="mt-3">
                <span className="text-4xl font-black">{t.price}</span>
                <span className="text-sm text-muted-foreground"> د.ك / {t.period}</span>
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {FEATURES.map((f, i) => {
                  const unlocked = i < t.unlocked
                  return (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${unlocked ? 'text-foreground' : 'text-muted-foreground/60'}`}
                    >
                      {unlocked ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-label="ميزة مقفلة" />
                      )}
                      <span className={unlocked ? '' : 'line-through decoration-muted-foreground/30'}>{f}</span>
                    </li>
                  )
                })}
              </ul>

              <Link
                href="/auth/register"
                className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
                  t.highlighted
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'border border-border text-foreground hover:bg-white/5'
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          الميزات المقفلة تظهر مع قفل — قم بالترقية لفتحها في أي وقت.
        </p>
      </main>
    </div>
  )
}
