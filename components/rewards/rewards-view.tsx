'use client'

import { Gift, Ticket, Plus, Award, Share2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { PromoCodeForm } from '@/components/shared/add-entity-forms'

const affiliates = [
  { name: 'منى الصباح', code: 'MONA-REF', referrals: 38, earned: '420 د.ك' },
  { name: 'يوسف الحمد', code: 'YOUSEF-VIP', referrals: 21, earned: '215 د.ك' },
  { name: 'لمياء فهد', code: 'LAMYA-PRO', referrals: 14, earned: '160 د.ك' },
]

const prizes = [
  { name: 'اشتراك مجاني (شهر)', cost: 'متاح للاستبدال بـ 500 نقطة' },
  { name: 'شارة التوثيق الذهبية', cost: 'متاح للاستبدال بـ 1,200 نقطة' },
  { name: 'جلسة استشارية خاصة', cost: 'متاح للاستبدال بـ 2,000 نقطة' },
]

const codes = [
  { code: 'SUMMER24', detail: 'خصم 20% • تم استخدامه 142 مرة', active: true },
  { code: 'WELCOME10', detail: 'خصم 10% • تم استخدامه 512 مرة', active: true },
  { code: 'VIP2025', detail: 'خصم 50% • منتهي الصلاحية', active: false },
]

export function RewardsView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Award className={cn('h-6 w-6', accent)} />
            نظام الجوائز وأكواد الخصم
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة المكافآت والكوبونات الترويجية للمستخدمين.</p>
        </div>
        <button
          onClick={() => openModal({ title: 'إنشاء كود خصم جديد', content: <PromoCodeForm />, size: 'sm' })}
          className={cn(
            'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90',
            execMode ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20',
          )}
        >
          <Plus className="h-4 w-4" />
          إنشاء كود خصم جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Prizes */}
        <div className="glass relative overflow-hidden rounded-2xl border border-border p-6">
          <Gift className="absolute -left-4 -top-4 h-24 w-24 text-foreground/5" />
          <div className="relative">
            <h3 className="text-lg font-bold text-foreground">الجوائز النشطة</h3>
            <p className="mb-4 text-sm text-muted-foreground">إدارة المكافآت للمستخدمين المتميزين.</p>
            <div className="space-y-3">
              {prizes.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-3"
                >
                  <span className="text-sm font-bold text-foreground">{p.name}</span>
                  <span className="text-xs text-success">{p.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Promo codes */}
        <div className="glass relative overflow-hidden rounded-2xl border border-border p-6">
          <Ticket className="absolute -left-4 -top-4 h-24 w-24 text-foreground/5" />
          <div className="relative">
            <h3 className="text-lg font-bold text-foreground">أكواد الخصم (Promo Codes)</h3>
            <p className="mb-4 text-sm text-muted-foreground">إدارة الكوبونات وتاريخ استخدامها.</p>
            <div className="space-y-3">
              {codes.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-3"
                >
                  <div>
                    <span className="font-black tracking-widest text-gold">{c.code}</span>
                    <p className="text-[10px] text-muted-foreground">{c.detail}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded px-2 py-1 text-xs font-bold',
                      c.active ? 'bg-success/20 text-success' : 'bg-white/10 text-muted-foreground',
                    )}
                  >
                    {c.active ? 'فعال' : 'منتهٍ'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate marketing */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Share2 className={cn('h-5 w-5', accent)} />
            التسويق بالعمولة (Affiliates)
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            <TrendingUp className="h-3.5 w-3.5" />
            73 إحالة هذا الشهر
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">المسوّق</th>
                <th className="px-5 py-4 font-semibold">كود الإحالة</th>
                <th className="px-5 py-4 font-semibold">عدد الإحالات</th>
                <th className="px-5 py-4 font-semibold">العمولة المكتسبة</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.code} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                  <td className="px-5 py-4 font-bold text-foreground">{a.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-black tracking-widest text-gold">{a.code}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{a.referrals}</td>
                  <td className="px-5 py-4 font-bold text-success">{a.earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
