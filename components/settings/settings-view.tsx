'use client'

import { useState } from 'react'
import {
  Settings,
  CreditCard,
  Wrench,
  Webhook,
  DatabaseBackup,
  ShieldAlert,
  Globe,
  BadgeCheck,
  Copyright,
  Crown,
  Bot,
  Rocket,
  LineChart,
  Palette,
  Gem,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { SecurityShield } from '@/components/settings/security-shield'
import { TwoFactorSetup } from '@/components/settings/two-factor-setup'

type ConfigKey = 'stripe' | 'tap' | 'maintenance' | 'webhooks' | 'backups' | 'geo'

type ConfigItem = {
  key: ConfigKey
  title: string
  desc: string
  icon: LucideIcon
  danger?: boolean
}

const items: ConfigItem[] = [
  { key: 'stripe', title: 'بوابة Stripe', desc: 'مدفوعات عالمية بالبطاقات الائتمانية', icon: CreditCard },
  { key: 'tap', title: 'بوابة Tap', desc: 'مدفوعات محلية (KNET ومدى)', icon: CreditCard },
  { key: 'webhooks', title: 'Webhooks', desc: 'إشعارات فورية للأنظمة الخارجية', icon: Webhook },
  { key: 'backups', title: 'النسخ الاحتياطي التلقائي', desc: 'نسخ يومي مشفّر للبيانات', icon: DatabaseBackup },
  { key: 'geo', title: 'التوجيه الجغرافي', desc: 'توزيع المحتوى حسب موقع المستخدم', icon: Globe },
  { key: 'maintenance', title: 'وضع الصيانة', desc: 'إيقاف الوصول للمنصة مؤقتاً', icon: Wrench, danger: true },
]

// Estimated monthly revenue contribution per active module (in KWD, illustrative)
const MODULE_REVENUE = {
  vipSupport: 1850,
  aiCopilot: 3200,
  profileBoost: 2400,
  advancedInsights: 1600,
  whiteLabel: 4100,
}

type PremiumModule = {
  key: keyof typeof MODULE_REVENUE
  title: string
  desc: string
  icon: LucideIcon
  active: boolean
  setActive: (v: boolean) => void
  tag: string
}

function PriceFeatureCard({
  icon: Icon,
  title,
  desc,
  price,
  setPrice,
  unit,
  accent,
}: {
  icon: LucideIcon
  title: string
  desc: string
  price: string
  setPrice: (v: string) => void
  unit: string
  accent: string
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-gold/30 bg-gold/5 p-5">
      <span className="absolute left-4 top-4 rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
        مصدر دخل
      </span>
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15">
          <Icon className="h-6 w-6 text-gold" />
        </span>
        <div className="leading-tight">
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-base pl-14 text-lg font-black"
            aria-label={`سعر ${title}`}
          />
          <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold', accent)}>
            د.ك
          </span>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function PremiumToggleCard({
  module,
  execMode,
  accent,
}: {
  module: PremiumModule
  execMode: boolean
  accent: string
}) {
  const Icon = module.icon
  const on = module.active
  return (
    <div
      className={cn(
        'glass flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors',
        on ? 'border-gold/40 bg-gold/5' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            on ? 'bg-gold/15' : 'bg-white/5',
          )}
        >
          <Icon className={cn('h-5 w-5', on ? 'text-gold' : 'text-muted-foreground')} />
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{module.title}</h3>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {module.tag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{module.desc}</p>
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-[11px] font-bold',
              on ? 'text-gold' : 'text-muted-foreground',
            )}
          >
            <TrendingUp className="h-3 w-3" />
            {MODULE_REVENUE[module.key].toLocaleString('en-US')} د.ك / شهرياً
          </span>
        </div>
      </div>
      <button
        onClick={() => module.setActive(!on)}
        role="switch"
        aria-checked={on}
        aria-label={module.title}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          on ? (execMode ? 'bg-destructive' : 'bg-gold') : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
            on ? 'right-1' : 'right-6',
          )}
        />
      </button>
    </div>
  )
}

export function SettingsView() {
  const { execMode } = useExecMode()
  const [config, setConfig] = useState<Record<ConfigKey, boolean>>({
    stripe: true,
    tap: true,
    maintenance: false,
    webhooks: true,
    backups: true,
    geo: false,
  })

  // Premium & Monetization States
  const [blueBadgePrice, setBlueBadgePrice] = useState('15') // Monthly price for verification
  const [textCopyrightPrice, setTextCopyrightPrice] = useState('5') // Pay-per-stamp
  const [vipSupportActive, setVipSupportActive] = useState(true)
  const [aiCopilotActive, setAiCopilotActive] = useState(false)
  const [profileBoostActive, setProfileBoostActive] = useState(true)
  const [advancedInsightsActive, setAdvancedInsightsActive] = useState(true)
  const [whiteLabelExport, setWhiteLabelExport] = useState(false)

  const accent = execMode ? 'text-destructive' : 'text-primary'
  const toggle = (key: ConfigKey) => setConfig((prev) => ({ ...prev, [key]: !prev[key] }))

  const premiumModules: PremiumModule[] = [
    {
      key: 'vipSupport',
      title: 'دعم VIP ذو أولوية',
      desc: 'قناة دعم مخصصة برد خلال 5 دقائق ومدير حساب',
      icon: Crown,
      active: vipSupportActive,
      setActive: setVipSupportActive,
      tag: 'اشتراك',
    },
    {
      key: 'aiCopilot',
      title: 'مساعد AI الذكي (Copilot)',
      desc: 'توليد محتوى وتحليل تلقائي مدعوم بالذكاء الاصطناعي',
      icon: Bot,
      active: aiCopilotActive,
      setActive: setAiCopilotActive,
      tag: 'إضافة',
    },
    {
      key: 'profileBoost',
      title: 'تعزيز الملف (Boost)',
      desc: 'إبراز الحساب في نتائج البحث والصفحة الرئيسية',
      icon: Rocket,
      active: profileBoostActive,
      setActive: setProfileBoostActive,
      tag: 'مدفوع',
    },
    {
      key: 'advancedInsights',
      title: 'تحليلا�� متقدمة',
      desc: 'لوحات تحليلية تفصيلية للجمهور والأداء والإيرادات',
      icon: LineChart,
      active: advancedInsightsActive,
      setActive: setAdvancedInsightsActive,
      tag: 'اشتراك',
    },
    {
      key: 'whiteLabel',
      title: 'تصدير White-Label',
      desc: 'تقارير وعلامة تجارية مخصصة بدون شعار المنصة',
      icon: Palette,
      active: whiteLabelExport,
      setActive: setWhiteLabelExport,
      tag: 'مؤسسات',
    },
  ]

  const estimatedUplift = premiumModules
    .filter((m) => m.active)
    .reduce((sum, m) => sum + MODULE_REVENUE[m.key], 0)
  const activeCount = premiumModules.filter((m) => m.active).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <Gem className={cn('h-6 w-6', execMode ? 'text-destructive' : 'text-gold')} />
          مركز الخدمات المميزة (Premium Add-ons)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة وتكوين الميزات الإضافية المتقدمة للمنصة.
        </p>
      </div>

      {/* Revenue uplift summary */}
      <div
        className={cn(
          'glass relative overflow-hidden rounded-2xl border p-6',
          execMode ? 'border-destructive/40' : 'border-gold/40',
          'glow-gold',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">الدخل الإضافي المتوقع شهرياً</p>
            <p className={cn('mt-1 text-4xl font-black', execMode ? 'text-destructive' : 'text-gold')}>
              {estimatedUplift.toLocaleString('en-US')}
              <span className="ms-2 text-lg font-bold text-muted-foreground">د.ك</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeCount} من {premiumModules.length} وحدات مفعّلة · تحقق أزرق {blueBadgePrice} د.ك ·
              ختم حقوق {textCopyrightPrice} د.ك
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
            <TrendingUp className={cn('h-8 w-8', execMode ? 'text-destructive' : 'text-gold')} />
          </div>
        </div>
      </div>

      {/* General preferences */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Globe className={cn('h-5 w-5', accent)} />
          التفضيلات العامة (Preferences)
        </h2>
        <TwoFactorSetup />
      </section>

      {/* Verification & copyright pricing */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <BadgeCheck className={cn('h-5 w-5', execMode ? 'text-destructive' : 'text-gold')} />
          التحقق وحقوق الملكية
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PriceFeatureCard
            icon={BadgeCheck}
            title="الشارة الزرقاء (Blue Badge)"
            desc="توثيق الحساب الرسمي مع علامة تحقق مميزة"
            price={blueBadgePrice}
            setPrice={setBlueBadgePrice}
            unit="/ شهرياً"
            accent={execMode ? 'text-destructive' : 'text-gold'}
          />
          <PriceFeatureCard
            icon={Copyright}
            title="ختم حقوق النص (Copyright)"
            desc="بصمة ملكية موثقة لكل نص أو منشور"
            price={textCopyrightPrice}
            setPrice={setTextCopyrightPrice}
            unit="/ لكل ختم"
            accent={execMode ? 'text-destructive' : 'text-gold'}
          />
        </div>
      </section>

      {/* Premium up-sell modules */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Crown className={cn('h-5 w-5', execMode ? 'text-destructive' : 'text-gold')} />
          أدوات النمو والترقيات (Growth & Upgrades)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {premiumModules.map((m) => (
            <PremiumToggleCard key={m.key} module={m} execMode={execMode} accent={accent} />
          ))}
        </div>
      </section>

      {/* System integrations */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Settings className={cn('h-5 w-5', accent)} />
          تكاملات النظام
        </h2>

        <SecurityShield execMode={execMode} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon
            const on = config[item.key]
            const isDangerOn = item.danger && on
            return (
              <div
                key={item.key}
                className={cn(
                  'glass flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors',
                  isDangerOn ? 'border-destructive/50 bg-destructive/10 glow-alert' : 'border-border',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      isDangerOn ? 'bg-destructive/20' : 'bg-white/5',
                    )}
                  >
                    {item.danger ? (
                      <ShieldAlert className={cn('h-5 w-5', isDangerOn ? 'text-destructive' : accent)} />
                    ) : (
                      <Icon className={cn('h-5 w-5', on ? accent : 'text-muted-foreground')} />
                    )}
                  </span>
                  <div className="leading-tight">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                    <span
                      className={cn(
                        'mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold',
                        on
                          ? isDangerOn
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-success/15 text-success'
                          : 'bg-white/5 text-muted-foreground',
                      )}
                    >
                      {on ? 'مُفعّل' : 'متوقف'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  role="switch"
                  aria-checked={on}
                  aria-label={item.title}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    on
                      ? item.danger
                        ? 'bg-destructive'
                        : execMode
                          ? 'bg-destructive'
                          : 'bg-primary'
                      : 'bg-white/15',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
                      on ? 'right-1' : 'right-6',
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
