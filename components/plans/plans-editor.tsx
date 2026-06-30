'use client'

import { useState, useEffect } from 'react'
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
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useTranslation } from 'react-i18next'
import { MobilePreview } from '@/components/plans/mobile-preview'
import type { Feature, BillingCycle, PlanVariant } from '@/components/plans/types'
import { CYCLE_META } from '@/components/plans/types'
import { useApi, apiServices } from '@/lib/api'

type PlanFeature = {
  id?: number
  feature_key: string
  limit?: number | null
}

type Plan = {
  id?: number | null
  plan_type: 'enterprise' | 'student'
  tier: string
  name: string
  description?: string
  price: number
  currency: string
  is_active: boolean
  features: PlanFeature[]
  created_at?: string
  updated_at?: string
}

const PLAN_TYPE_OPTIONS = [
  { value: 'enterprise', label: 'شركة (Enterprise)' },
  { value: 'student', label: 'طالب سينما / أكاديمي (Student)' },
]

const FEATURE_KEY_OPTIONS = [
  { value: 'post_question', label: 'نشر سؤال' },
  { value: 'post_answer', label: 'نشر إجابة' },
  { value: 'post_job', label: 'نشر وظيفة' },
  { value: 'apply_job', label: 'التقديم على وظائف' },
  { value: 'post_workshop', label: 'نشر ورشة عمل' },
  { value: 'apply_workshop', label: 'التقديم على ورش عمل' },
  { value: 'post_item', label: 'نشر عنصر للحجز' },
  { value: 'request_booking', label: 'طلب حجز' },
  { value: 'publish_movie', label: 'نشر فيلم' },
  { value: 'publish_series', label: 'نشر مسلسل' },
  { value: 'publish_advertise', label: 'نشر إعلان' },
]

const badgeOptions = [
  '',
  'اختيار المحترفين (Pro\'s Choice)',
  'موصى بها للمخرجين (Directors\' Pick)',
  'باقة الانطلاقة (Starter Kit)',
  'عرض لفترة محدودة (Limited Time)',
  'الأكثر توفيراً (Max Savings)',
  'حصري للمعدات (Gear Exclusive)',
]

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
  const { request } = useApi()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [planName, setPlanName] = useState('باقة المستقل')
  const [planType, setPlanType] = useState<'enterprise' | 'student'>('enterprise')
  const [tier, setTier] = useState('basic')
  const [price, setPrice] = useState('0.00')
  const [currency, setCurrency] = useState('KWD')
  const [isActive, setIsActive] = useState(true)
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [dragId, setDragId] = useState<number | null>(null)
  const [savedToast, setSavedToast] = useState<string | null>(null)

  // Advanced state
  const [newFeatureName, setNewFeatureName] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [planBadge, setPlanBadge] = useState('اختيار المحترفين (Pro\'s Choice)')
  const [lastSavedFeatures, setLastSavedFeatures] = useState<Feature[] | null>(null)

  // Landing page + clone modal
  const [selectedLandingPage, setSelectedLandingPage] = useState(landingPages[0])
  const [ctaText, setCtaText] = useState('اشترك الآن')
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [clonePlanName, setClonePlanName] = useState('')

  const accentText = execMode ? 'text-destructive' : 'text-primary'

  // Fetch all plans on initial load
  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiServices.fetchPlans()
        const plansList = Array.isArray(data) ? data : (data as any)?.results || []
        setPlans(plansList)
        if (plansList.length > 0) {
          selectPlan(plansList[0])
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  // Select a plan
  function selectPlan(plan: Plan) {
    setCurrentPlanId(plan.id ?? null)
    setPlanName(plan.name)
    setPlanType(plan.plan_type)
    setTier(plan.tier)
    setPrice(plan.price.toString())
    setCurrency(plan.currency)
    setIsActive(plan.is_active)
    setDescription(plan.description || '')
    setFeatures(
      plan.features.map((feature, index) => ({
        id: feature.id ?? index,
        name: FEATURE_KEY_OPTIONS.find((o) => o.value === feature.feature_key)?.label || feature.feature_key,
        selected: true,
        limit: feature.limit ?? 0,
        unlimited: feature.limit === null || feature.limit === undefined,
      }))
    )
  }

  // Convert current form to Plan object
  function getCurrentPlan(): Plan {
    return {
      id: currentPlanId,
      plan_type: planType,
      tier,
      name: planName,
      description,
      price: parseFloat(price),
      currency,
      is_active: isActive,
      features: features.filter((f) => f.selected).map((f) => ({
        id: f.id,
        feature_key: FEATURE_KEY_OPTIONS.find((o) => o.label === f.name)?.value || f.name,
        limit: f.unlimited ? null : f.limit,
      })),
    }
  }

  // Save current plan
  async function savePlan() {
    setSaving(true)
    try {
      const planData = getCurrentPlan()
      let savedPlan
      if (planData.id) {
        savedPlan = await apiServices.updatePlan(planData.id, planData)
      } else {
        savedPlan = await apiServices.createPlan(planData)
      }
      // Refresh plans list
      const data = await apiServices.fetchPlans()
      const plansList = Array.isArray(data) ? data : (data as any)?.results || []
      setPlans(plansList)
      selectPlan(savedPlan as Plan)
      setSavedToast('تم حفظ الباقة بنجاح!')
      setTimeout(() => setSavedToast(null), 2500)
    } catch (err) {
      console.error('Failed to save plan:', err)
    } finally {
      setSaving(false)
    }
  }

  // Create a new plan
  function createNewPlan() {
    setCurrentPlanId(null)
    setPlanName('باقة جديدة')
    setPlanType('enterprise')
    setTier('new')
    setPrice('0.00')
    setCurrency('KWD')
    setIsActive(false)
    setDescription('')
    setFeatures([])
  }

  const toggleFeature = (id: number) => {
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)))
  }

  const toggleUnlimited = (id: number) => {
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, unlimited: !f.unlimited } : f)))
  }

  const updateLimit = (id: number, value: number) =>
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, limit: Math.max(0, value) } : f)))

  const addNewFeature = () => {
    const name = newFeatureName.trim()
    if (!name) return
    const newId = features.length > 0 ? Math.max(...features.map((f) => f.id)) + 1 : 1
    setFeatures((fs) => [...fs, { id: newId, name, selected: true, limit: 1, unlimited: false }])
    setNewFeatureName('')
  }

  const removeFeature = (id: number) => {
    setLastSavedFeatures(features)
    setFeatures((fs) => fs.filter((f) => f.id !== id))
  }

  const handleUndo = () => {
    if (!lastSavedFeatures) return
    setFeatures(lastSavedFeatures)
    setLastSavedFeatures(null)
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
  }

  const showToast = (msg: string) => {
    setSavedToast(msg)
    setTimeout(() => setSavedToast(null), 2500)
  }

  const handleOpenCloneModal = () => {
    setClonePlanName(`${planName} (نسخة)`)
    setIsCloneModalOpen(true)
  }

  const confirmClonePlan = async () => {
    if (!clonePlanName.trim()) return
    const currentPlan = getCurrentPlan()
    const newPlan = {
      ...currentPlan,
      id: undefined,
      name: clonePlanName,
      tier: `${currentPlan.tier}_clone_${Date.now()}`,
    }
    try {
      const savedPlan = await apiServices.createPlan(newPlan)
      const data = await apiServices.fetchPlans()
      const plansList = Array.isArray(data) ? data : (data as any)?.results || []
      setPlans(plansList)
      selectPlan(savedPlan as Plan)
    } catch (err) {
      console.error('Failed to clone plan:', err)
    }
    setIsCloneModalOpen(false)
    showToast(`تم إنشاء الباقة الجديدة: ${clonePlanName}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">جارٍ تحميل الباقات...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr_340px]">
        {/* Plans list sidebar */}
        <div className="rounded-2xl border border-border glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">الباقات</h2>
            <button
              onClick={createNewPlan}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90',
                execMode ? 'bg-destructive glow-alert' : 'bg-primary text-primary-foreground glow-brand',
              )}
            >
              <Plus className="h-4 w-4" />
              جديد
            </button>
          </div>

          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => selectPlan(plan)}
                className={cn(
                  'w-full text-right px-3 py-2 rounded-lg transition text-sm',
                  plan.id === currentPlanId
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'hover:bg-white/10 text-muted-foreground',
                )}
              >
                <div className="flex items-center gap-2">
                  {plan.is_active ? (
                    <div className="w-2 h-2 rounded-full bg-success" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  )}
                  <span>{plan.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor column */}
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border glass p-5">
            <div>
              <h1 className="text-xl font-black text-foreground md:text-2xl">{t('plans.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('plans.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setIsActive((v) => !v)
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-black transition-all',
                  isActive
                    ? 'border-success/50 bg-success/15 text-success'
                    : 'border-border bg-secondary text-muted-foreground',
                )}
              >
                {isActive ? '● باقة مفعلة (Live)' : '○ مسودة (Draft)'}
              </button>

              <button
                onClick={handleOpenCloneModal}
                className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                نسخة
              </button>
              <button
                onClick={savePlan}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50',
                  execMode ? 'bg-destructive glow-alert' : 'bg-primary text-primary-foreground glow-brand',
                )}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>

          {/* Basic fields */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t('plans.planName')}</label>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="input-base"
                  placeholder="مثال: باقة المستقل"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">نوع الباقة</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as 'enterprise' | 'student')}
                  className="input-base"
                >
                  {PLAN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-popover">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">المنتج (Tier)</label>
                <input
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="input-base"
                  placeholder="مثال: basic, silver, gold, diamond"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t('plans.price')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-base font-mono flex-1"
                    placeholder="0.00"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-base w-24"
                  >
                    <option value="KWD" className="bg-popover">د.ك</option>
                    <option value="SAR" className="bg-popover">ر.س</option>
                    <option value="USD" className="bg-popover">$</option>
                    <option value="EUR" className="bg-popover">€</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">الوصف</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-base min-h-[100px]"
                  placeholder="وصف الباقة..."
                />
              </div>
            </div>

            {/* Billing cycle + marketing badge */}
            <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl border border-border bg-white/5 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t('plans.billingCycle')}</label>
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-[#2a2b36] p-1">
                  {(Object.keys(CYCLE_META) as BillingCycle[]).map((cycle) => {
                    const meta = CYCLE_META[cycle]
                    const isActive = billingCycle === cycle
                    const pct = Math.round(meta.discount * 100)
                    return (
                      <button
                        key={cycle}
                        onClick={() => {
                          setBillingCycle(cycle)
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all',
                          isActive
                            ? 'bg-white/10 ring-1 ring-inset ring-white/20'
                            : 'hover:bg-white/5',
                        )}
                      >
                        <span>{t(`plans.${cycle}`, meta.short)}</span>
                        {pct > 0 && (
                          <span className="font-black text-blue-400">{`(-${pct}%)`}</span>
                        )}
                        {cycle === 'annual' && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t('plans.marketingBadge')}</label>
                <select
                  value={planBadge}
                  onChange={(e) => {
                    setPlanBadge(e.target.value)
                  }}
                  className="input-base"
                >
                  {badgeOptions.map((b) => (
                    <option key={b || 'none'} value={b} className="bg-popover">
                      {b || t('common.noBadge')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Landing page settings */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <Globe className={cn('h-5 w-5', accentText)} />
              <h2 className="text-lg font-bold text-foreground">إعدادات صفحة الهبوط</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">نشر الباقة في صفحة</label>
                <select
                  value={selectedLandingPage}
                  onChange={(e) => {
                    setSelectedLandingPage(e.target.value)
                  }}
                  className="input-base"
                >
                  {landingPages.map((p) => (
                    <option key={p} value={p} className="bg-popover">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">نص زر الاشتراك (CTA)</label>
                <input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="input-base"
                  placeholder="مثال: ابدأ الآن مجاناً"
                />
              </div>
            </div>
          </div>

          {/* Upsell trigger */}
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors',
              execMode ? 'border-destructive/40 bg-destructive/10' : 'border-success/30 bg-success/10',
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
            <Toggle checked={true} onChange={() => {}} variant="accent" />
          </div>

          {/* Features */}
          <div className="rounded-2xl border border-border glass p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className={cn('h-5 w-5', accentText)} />
                <h2 className="text-lg font-bold text-foreground">مميزات الباقة</h2>
                <span className="text-sm text-muted-foreground">(اختيار من القائمة)</span>
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

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">إضافة ميزة</label>
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedOption = FEATURE_KEY_OPTIONS.find((o) => o.value === e.target.value)
                      if (selectedOption) {
                        const newId = features.length > 0 ? Math.max(...features.map((f) => f.id)) + 1 : 1
                        setFeatures((fs) => [...fs, { id: newId, name: selectedOption.label, selected: true, limit: 1, unlimited: false }])
                      }
                    }
                  }}
                  className="input-base"
                >
                  <option value="" disabled className="bg-popover">اختر ميزة...</option>
                  {FEATURE_KEY_OPTIONS.filter((opt) => !features.some((f) => f.name === opt.label)).map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-popover">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MobilePreview
            planName={planName}
            planType={PLAN_TYPE_OPTIONS.find((o) => o.value === planType)?.label || planType}
            price={price}
            variant={'A'}
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
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">اسم الباقة الجديدة</label>
              <input
                autoFocus
                value={clonePlanName}
                onChange={(e) => setClonePlanName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmClonePlan()}
                className="input-base"
              />
            </div>
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
