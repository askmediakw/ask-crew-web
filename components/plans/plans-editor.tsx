'use client'

import { useState } from 'react'
import {
  Copy,
  Crown,
  Globe,
  GripVertical,
  Infinity as InfinityIcon,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useTranslation } from 'react-i18next'
import { MobilePreview } from '@/components/plans/mobile-preview'
import type { Feature, BillingCycle, PlanVariant } from '@/components/plans/types'
import { CYCLE_META } from '@/components/plans/types'

const planTypes = [
  'مستقل (Pro)',
  'شركة (Enterprise)',
  'مميّز (VIP)',
  'تجريبي (Trial)',
  'طالب سينما / أكاديمي (Student)',
  'استوديو إنتاج (Production House)',
  'مورد معدات (Equipment Hub)',
  'باقة مدى الحياة (Lifetime)',
  'باقة المشروع الواحد (Pay-per-Project)',
]

const badgeOptions = [
  '',
  'اختيار المحترفين (Pro\u2019s Choice)',
  'موصى بها للمخرجين (Directors\u2019 Pick)',
  'باقة الانطلاقة (Starter Kit)',
  'عرض لفترة محدودة (Limited Time)',
  'الأعلى توفيراً (Max Savings)',
  'حصري للمعدات (Gear Exclusive)',
]

// Psychological-pricing accents: the discount % uses a distinct bright color
// per cycle to draw the eye toward higher-value (longer) commitments.
const CYCLE_ACCENT: Record<BillingCycle, { name: string; discount: string; crown?: boolean }> = {
  monthly: { name: 'text-purple-400', discount: '' },
  quarterly: { name: 'text-foreground', discount: 'text-blue-400' },
  semiannual: { name: 'text-foreground', discount: 'text-emerald-400' },
  annual: { name: 'text-foreground', discount: 'text-yellow-400', crown: true },
}

const landingPages = [
  'الصفحة الرئيسية (Default)',
  'صفحة صناع المحتوى (Content Creators)',
  'صفحة الممثلين والمواهب (Talents & Actors)',
  'صفحة شركات الإنتاج (Production Houses)',
  'صفحة الطلبة والمبتدئين (Students)',
  'حملة بلاك فرايداي (Black Friday Promo)',
  'عروض الصيف الكبرى (Summer Sale)',
  'خصم نهاية العام (End of Year)',
  'حملة شهر رمضان (Ramadan Promo)',
  'رابط مخفي لكبار الشخصيات (VIP Private Link)',
  'صفحة التسويق بالعمولة (Affiliates Link)',
  'صفحة الورش التعليمية (Workshops Landing)',
  'صفحة المهرجانات السينمائية (Festivals)',
  'رابط بايو انستغرام (IG Bio Link)',
  'رابط بايو تيك توك (TikTok Bio Link)',
  'صفحة رعاة المشروع (Sponsors)',
  'صفحة المستثمرين (Investors Pitch)',
  'صفحة تحميل التطبيق (App Download Promo)',
  'حملة إعادة الاستهداف (Retargeting Campaign)',
  'صفحة مسابقة آسك كرو (Ask Crew Contest)',
]

const initialFeatures: Feature[] = [
  { id: 1, name: 'نشر وظيفة', selected: true, limit: 3, unlimited: false },
  { id: 2, name: 'نشر فيلم', selected: false, limit: 1, unlimited: false },
  { id: 3, name: 'طلب حجز', selected: true, limit: 0, unlimited: true },
  { id: 4, name: 'نشر إعلان', selected: false, limit: 5, unlimited: false },
  { id: 5, name: 'إدارة فريق', selected: true, limit: 10, unlimited: false },
  { id: 6, name: 'تقارير وتحليلات', selected: false, limit: 0, unlimited: true },
]

function Toggle({
  checked,
  onChange,
  variant = 'brand',
}: {
  checked: boolean
  onChange: () => void
  variant?: 'brand' | 'accent'
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked
          ? variant === 'accent'
            ? 'bg-accent'
            : 'bg-primary'
          : 'bg-secondary',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          checked ? 'right-0.5' : 'right-[calc(100%-1.375rem)]',
        )}
      />
    </button>
  )
}

export function PlansEditor() {
  const { execMode } = useExecMode()
  const { t } = useTranslation()
  const [planName, setPlanName] = useState('باقة المستقل')
  const [planType, setPlanType] = useState(planTypes[0])
  const [price, setPrice] = useState('5.0')
  const [variant, setVariant] = useState<PlanVariant>('A')
  const [upsell, setUpsell] = useState(true)
  const [features, setFeatures] = useState<Feature[]>(initialFeatures)
  const [dragId, setDragId] = useState<number | null>(null)
  const [savedToast, setSavedToast] = useState<string | null>(null)

  // Advanced state
  const [newFeatureName, setNewFeatureName] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [planBadge, setPlanBadge] = useState('اختيار المحترفين (Pro\u2019s Choice)')
  const [isPublished, setIsPublished] = useState(false)
  const [lastSavedFeatures, setLastSavedFeatures] = useState<Feature[] | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  // Landing page + clone modal
  const [selectedLandingPage, setSelectedLandingPage] = useState(landingPages[0])
  const [ctaText, setCtaText] = useState('اشترك الآن')
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [clonePlanName, setClonePlanName] = useState('')

  const accentText = execMode ? 'text-destructive' : 'text-primary'

  const triggerAutoSave = () => {
    setSaveStatus('saving')
    setTimeout(() => setSaveStatus('saved'), 1200)
  }

  const toggleFeature = (id: number) => {
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)))
    triggerAutoSave()
  }

  const toggleUnlimited = (id: number) => {
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, unlimited: !f.unlimited } : f)))
    triggerAutoSave()
  }

  const updateLimit = (id: number, value: number) =>
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, limit: Math.max(0, value) } : f)))

  const addNewFeature = () => {
    const name = newFeatureName.trim()
    if (!name) return
    const newId = features.length > 0 ? Math.max(...features.map((f) => f.id)) + 1 : 1
    setFeatures((fs) => [...fs, { id: newId, name, selected: true, limit: 1, unlimited: false }])
    setNewFeatureName('')
    triggerAutoSave()
  }

  const removeFeature = (id: number) => {
    setLastSavedFeatures(features)
    setFeatures((fs) => fs.filter((f) => f.id !== id))
    triggerAutoSave()
  }

  const handleUndo = () => {
    if (!lastSavedFeatures) return
    setFeatures(lastSavedFeatures)
    setLastSavedFeatures(null)
    triggerAutoSave()
  }

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return
    setFeatures((fs) => {
      const next = [...fs]
      const from = next.findIndex((f) => f.id === dragId)
      const to = next.findIndex((f) => f.id === targetId)
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDragId(null)
    triggerAutoSave()
  }

  const showToast = (msg: string) => {
    setSavedToast(msg)
    setTimeout(() => setSavedToast(null), 2500)
  }

  const handleOpenCloneModal = () => {
    setClonePlanName(`${planName} (نسخة)`)
    setIsCloneModalOpen(true)
  }

  const confirmClonePlan = () => {
    if (!clonePlanName.trim()) return
    setPlanName(clonePlanName)
    setIsCloneModalOpen(false)
    triggerAutoSave()
    showToast(`تم إنشاء الباقة الجديدة: ${clonePlanName}`)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Editor column */}
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border glass p-5">
            <div>
              <h1 className="text-xl font-black text-foreground md:text-2xl">{t('plans.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('plans.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Autosave + publish status */}
              <div className="flex items-center gap-3 border-l border-border pl-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      saveStatus === 'saving' ? 'animate-pulse bg-gold' : 'bg-success',
                    )}
                  />
                  {saveStatus === 'saving' ? 'جاري الحفظ...' : 'تم الحفظ'}
                </span>
                <button
                  onClick={() => {
                    setIsPublished((v) => !v)
                    triggerAutoSave()
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-black transition-all',
                    isPublished
                      ? 'border-success/50 bg-success/15 text-success'
                      : 'border-border bg-secondary text-muted-foreground',
                  )}
                >
                  {isPublished ? '● باقة مفعلة (Live)' : '○ مسودة (Draft)'}
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">{t('plans.version')}</span>
                <div className="flex rounded-lg border border-border bg-background/60 p-0.5">
                  {(['A', 'B', 'VIP'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setVariant(v)
                        triggerAutoSave()
                      }}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-black transition-all',
                        variant === v
                          ? v === 'VIP'
                            ? 'bg-gold text-background'
                            : v === 'B'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {v === 'VIP' ? 'VIP' : `نسخة ${v}`}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleOpenCloneModal}
                className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                نسخ الباقة
              </button>
              <button
                onClick={() => showToast('تم حفظ الباقة بنجاح')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90',
                  execMode
                    ? 'bg-destructive glow-alert'
                    : 'bg-primary text-primary-foreground glow-brand',
                )}
              >
                <Save className="h-4 w-4" />
                حفظ
              </button>
            </div>
          </div>

          {/* Basic fields */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={t('plans.planName')}>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="input-base"
                  placeholder="مثال: باقة المستقل"
                />
              </Field>
              <Field label={t('plans.planType')}>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="input-base"
                >
                  {planTypes.map((opt) => (
                    <option key={opt} value={opt} className="bg-popover">
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('plans.price')}>
                <input
                  type="number"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-base font-mono"
                  placeholder="0.0"
                />
              </Field>
              <Field label={t('plans.status')}>
                <div className="flex h-[46px] items-center gap-2 rounded-xl border border-border bg-white/5 px-4">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-foreground">{t('plans.statusActive')}</span>
                </div>
              </Field>
            </div>

            {/* Billing cycle + marketing badge */}
            <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl border border-border bg-white/5 p-4 sm:grid-cols-2">
              <Field label={t('plans.billingCycle')}>
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-[#2a2b36] p-1">
                  {(Object.keys(CYCLE_META) as BillingCycle[]).map((cycle) => {
                    const meta = CYCLE_META[cycle]
                    const accent = CYCLE_ACCENT[cycle]
                    const isActive = billingCycle === cycle
                    const pct = Math.round(meta.discount * 100)
                    return (
                      <button
                        key={cycle}
                        onClick={() => {
                          setBillingCycle(cycle)
                          triggerAutoSave()
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all',
                          isActive
                            ? 'bg-white/10 ring-1 ring-inset ring-white/20'
                            : 'hover:bg-white/5',
                        )}
                      >
                        <span className={cn(accent.name)}>{t(`plans.${cycle}`, meta.short)}</span>
                        {pct > 0 && (
                          <span className={cn('font-black', accent.discount)}>{`(-${pct}%)`}</span>
                        )}
                        {accent.crown && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                      </button>
                    )
                  })}
                </div>
              </Field>
              <Field label={t('plans.marketingBadge')}>
                <select
                  value={planBadge}
                  onChange={(e) => {
                    setPlanBadge(e.target.value)
                    triggerAutoSave()
                  }}
                  className="input-base"
                >
                  {badgeOptions.map((b) => (
                    <option key={b || 'none'} value={b} className="bg-popover">
                      {b || t('common.noBadge')}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Landing page settings */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <Globe className={cn('h-5 w-5', accentText)} />
              <h2 className="text-lg font-bold text-foreground">إعدادات صفحة الهبوط</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="نشر الباقة في صفحة">
                <select
                  value={selectedLandingPage}
                  onChange={(e) => {
                    setSelectedLandingPage(e.target.value)
                    triggerAutoSave()
                  }}
                  className="input-base"
                >
                  {landingPages.map((p) => (
                    <option key={p} value={p} className="bg-popover">
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="نص زر الاشتراك (CTA)">
                <input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="input-base"
                  placeholder="مثال: ابدأ الآن مجاناً"
                />
              </Field>
            </div>
          </div>

          {/* Upsell trigger */}
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors',
              upsell && 'glow-gold',
              execMode
                ? 'border-destructive/40 bg-destructive/10'
                : 'border-success/30 bg-success/10',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  execMode ? 'bg-destructive/20' : 'bg-success/20',
                )}
              >
                <TrendingUp
                  className={cn('h-5 w-5', execMode ? 'text-destructive' : 'text-success')}
                />
              </span>
              <div>
                <h3
                  className={cn(
                    'font-bold',
                    execMode ? 'text-destructive' : 'text-success',
                  )}
                >
                  إشعارات الترقية الذكية (Upsell)
                </h3>
                <p className="text-sm text-muted-foreground">
                  إرسال إشعار تلقائي للمستخدم عند استهلاك 90% من حدود الباقة
                </p>
              </div>
            </div>
            <Toggle checked={upsell} onChange={() => setUpsell((v) => !v)} variant="accent" />
          </div>

          {/* Features */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className={cn('h-5 w-5', accentText)} />
                <h2 className="text-lg font-bold text-foreground">مميزات الباقة</h2>
                <span className="text-sm text-muted-foreground">(اسحب لإعادة الترتيب)</span>
              </div>
              {lastSavedFeatures && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Undo2 className="h-4 w-4" />
                  تراجع عن الحذف
                </button>
              )}
            </div>

            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={() => setDragId(feature.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(feature.id)}
                  className={cn(
                    'group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white/5 p-4 transition-all',
                    dragId === feature.id ? 'opacity-50' : 'hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground active:cursor-grabbing" />
                    <button
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors',
                        feature.selected
                          ? execMode
                            ? 'border-destructive bg-destructive'
                            : 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent',
                      )}
                      aria-pressed={feature.selected}
                    >
                      {feature.selected && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={cn(
                        'font-medium',
                        feature.selected ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {feature.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {feature.selected && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">الحد</label>
                          <input
                            type="number"
                            min={0}
                            disabled={feature.unlimited}
                            value={feature.unlimited ? '' : feature.limit}
                            onChange={(e) => updateLimit(feature.id, Number(e.target.value))}
                            className="w-20 rounded-lg border border-border bg-white/5 px-2 py-1.5 text-center text-sm text-foreground outline-none focus:border-primary disabled:opacity-40"
                            placeholder="∞"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleUnlimited(feature.id)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                            feature.unlimited
                              ? 'border-primary/40 bg-primary/15 text-primary'
                              : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <InfinityIcon className="h-3.5 w-3.5" />
                          مفتوح
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature.id)}
                      aria-label={`حذف ${feature.name}`}
                      className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new feature */}
            <div className="mt-4 flex gap-3">
              <input
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewFeature()}
                placeholder="أضف ميزة جديدة للباقة..."
                className="input-base flex-1"
              />
              <button
                onClick={addNewFeature}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90',
                  execMode ? 'bg-destructive glow-alert' : 'bg-primary text-primary-foreground glow-brand',
                )}
              >
                <Plus className="h-4 w-4" />
                إضافة
              </button>
            </div>
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MobilePreview
            planName={planName}
            planType={planType}
            price={price}
            variant={variant}
            features={features}
            execMode={execMode}
            badge={planBadge}
            billingCycle={billingCycle}
            ctaText={ctaText}
          />
        </div>
      </div>

      {/* Clone modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className={cn(
              'w-full max-w-md rounded-3xl border bg-popover p-6 shadow-2xl',
              execMode ? 'border-destructive/50 glow-alert' : 'border-primary/50 glow-brand',
            )}
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-xl font-black text-foreground">نسخ الباقة الحالية</h3>
              <button
                onClick={() => setIsCloneModalOpen(false)}
                aria-label="إغلاق"
                className="rounded-lg p-1 text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              سيتم إنشاء نسخة مطابقة بجميع المميزات والحدود. أدخل اسماً للنسخة الجديدة.
            </p>
            <Field label="اسم الباقة الجديدة">
              <input
                autoFocus
                value={clonePlanName}
                onChange={(e) => setClonePlanName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmClonePlan()}
                className="input-base"
              />
            </Field>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                onClick={confirmClonePlan}
                className={cn(
                  'flex-1 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90',
                  execMode ? 'bg-destructive' : 'bg-primary text-primary-foreground',
                )}
              >
                تأكيد وإنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      {savedToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-primary/40 bg-popover px-5 py-3 text-sm font-semibold text-foreground shadow-2xl glow-brand">
          {savedToast}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
