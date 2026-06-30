'use client'

import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users2, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

const mrrSeries = [38, 42, 41, 48, 53, 51, 58, 64, 62, 71, 78, 84]
const months = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس']

export function AnalyticsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const barColor = execMode ? 'bg-destructive' : 'bg-primary'
  const max = Math.max(...mrrSeries)

  const cac = 18
  const ltv = 142
  const ltvCacRatio = (ltv / cac).toFixed(1)

  const kpis = [
    {
      label: 'الإيراد الشهري المتكرر (MRR)',
      value: '84,200 د.ك',
      delta: '+12.4%',
      up: true,
      icon: DollarSign,
    },
    {
      label: 'معدل التسرّب (Churn)',
      value: '2.1%',
      delta: '-0.6%',
      up: false,
      icon: Repeat,
    },
    {
      label: 'عملاء نشطون',
      value: '1,284',
      delta: '+86',
      up: true,
      icon: Users2,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <BarChart3 className={cn('h-6 w-6', accent)} />
          التحليلات المالية
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة تنفيذية على الإيرادات والنمو وكفاءة اكتساب العملاء
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="glass rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className={cn('h-5 w-5', accent)} />
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                    k.up ? 'bg-success/15 text-success' : 'bg-success/15 text-success',
                  )}
                >
                  {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
              <p className="mt-4 text-2xl font-black text-foreground">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* MRR chart */}
        <div className="glass rounded-2xl border border-border p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">نمو الإيراد الشهري المتكرر</h2>
              <p className="text-xs text-muted-foreground">آخر 12 شهراً (بالألف د.ك)</p>
            </div>
            <span className={cn('text-sm font-bold', accent)}>+121% سنوياً</span>
          </div>
          <div className="flex h-52 items-end justify-between gap-2">
            {mrrSeries.map((v, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={cn('w-full rounded-t-md transition-all hover:opacity-80', barColor)}
                  style={{ height: `${Math.max((v / max) * 176, 4)}px` }}
                  title={`${v} ألف د.ك`}
                />
                <span className="text-[10px] text-muted-foreground">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CAC vs LTV */}
        <div className="glass flex flex-col rounded-2xl border border-border p-6">
          <h2 className="font-bold text-foreground">CAC مقابل LTV</h2>
          <p className="text-xs text-muted-foreground">كفاءة اكتساب العميل</p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">تكلفة الاكتساب (CAC)</span>
                <span className="font-mono font-bold text-warning">{cac} د.ك</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-warning" style={{ width: '13%' }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">القيمة الدائمة (LTV)</span>
                <span className="font-mono font-bold text-success">{ltv} د.ك</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-success" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div
            className={cn(
              'mt-auto flex items-center justify-between rounded-xl border p-4',
              execMode ? 'border-destructive/30 bg-destructive/10' : 'border-success/30 bg-success/10',
            )}
          >
            <div>
              <p className="text-xs text-muted-foreground">نسبة LTV : CAC</p>
              <p className="text-2xl font-black text-foreground">{ltvCacRatio}x</p>
            </div>
            <span className="rounded-lg bg-success/20 px-3 py-1.5 text-xs font-bold text-success">
              صحية جداً
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
