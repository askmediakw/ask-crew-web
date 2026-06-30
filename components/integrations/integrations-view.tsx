'use client'

import { useState } from 'react'
import { Plug, Save, Mail, Globe, AtSign, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

export function IntegrationsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [google, setGoogle] = useState(true)
  const [apple, setApple] = useState(true)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Plug className={cn('h-6 w-6', accent)} />
            التحقق والربط (Integrations & Auth)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة العناوين البريدية، تطبيقات التواصل الاجتماعي، والتوكنات.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90">
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* SMTP */}
        <div className="glass rounded-2xl border border-border p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-border/60 pb-4">
            <Mail className={cn('h-5 w-5', accent)} />
            <h3 className="text-lg font-bold text-foreground">العناوين البريدية (SMTP & Mails)</h3>
          </div>
          <div className="space-y-4">
            <Field label="البريد الرسمي للمنصة (Sender Email)" defaultValue="noreply@askcrew.com" />
            <Field label="مفتاح مزود الخدمة (SMTP API Key)" defaultValue="sk_test_123456789" type="password" />
          </div>
        </div>

        {/* Social */}
        <div className="glass rounded-2xl border border-border p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-border/60 pb-4">
            <Globe className={cn('h-5 w-5', accent)} />
            <h3 className="text-lg font-bold text-foreground">تطبيقات والتوكنات الاجتماعية</h3>
          </div>
          <div className="space-y-5">
            <OAuthRow
              badge="G"
              badgeClass="bg-white text-black"
              title="تسجيل الدخول بـ Google"
              sub="Google OAuth 2.0 Client ID"
              on={google}
              onToggle={() => setGoogle((v) => !v)}
              execMode={execMode}
            />
            <OAuthRow
              badge="A"
              badgeClass="border border-white/20 bg-black text-white"
              title="تسجيل الدخول بـ Apple"
              sub="Apple Services ID & Token"
              on={apple}
              onToggle={() => setApple((v) => !v)}
              execMode={execMode}
            />
            <div className="pt-2">
              <label className="mb-2 block text-xs font-bold text-muted-foreground">
                روابط الحسابات الاجتماعية (تظهر بالتطبيق)
              </label>
              <div className="space-y-2">
                <IconInput icon={AtSign} placeholder="رابط حساب Instagram" />
                <IconInput icon={Hash} placeholder="رابط حساب X (Twitter)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, defaultValue, type = 'text' }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <input type={type} defaultValue={defaultValue} className="input-base" />
    </div>
  )
}

function IconInput({ icon: Icon, placeholder }: { icon: typeof AtSign; placeholder: string }) {
  return (
    <div className="relative">
      <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input type="text" placeholder={placeholder} className="input-base pr-10" />
    </div>
  )
}

function OAuthRow({
  badge,
  badgeClass,
  title,
  sub,
  on,
  onToggle,
  execMode,
}: {
  badge: string
  badgeClass: string
  title: string
  sub: string
  on: boolean
  onToggle: () => void
  execMode: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full font-black', badgeClass)}>
          {badge}
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={title}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          on ? (execMode ? 'bg-destructive' : 'bg-success') : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
            on ? 'right-0.5' : 'right-5',
          )}
        />
      </button>
    </div>
  )
}
