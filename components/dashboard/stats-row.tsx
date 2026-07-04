import { ArrowDownRight, ArrowUpRight, Building2, TrendingUp, Users, Wallet, Loader2 } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/sparkline'
import { cn } from '@/lib/utils'
import { type DashboardStatsType } from '@/lib/api'

type Stat = {
  title: string
  value: string
  trend: string
  down?: boolean
  icon: typeof Wallet
  spark: number[]
  color: string
}

interface StatsRowProps {
  data?: DashboardStatsType | null
}

export function StatsRow({ data }: StatsRowProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats: Stat[] = [
    {
      title: 'إجمالي المبيعات',
      value: `${data.stats.total_revenue.toLocaleString('ar-EG')} د.ك`,
      trend: data.stats.total_revenue_trend,
      icon: Wallet,
      color: 'var(--primary)',
      spark: data.sparklines.revenue,
    },
    {
      title: 'الشركات النشطة',
      value: data.stats.total_enterprises.toLocaleString('ar-EG'),
      trend: data.stats.total_enterprises_trend,
      icon: Building2,
      color: 'var(--accent)',
      spark: data.sparklines.enterprises,
    },
    {
      title: 'المواهب المستقلة',
      value: data.stats.total_students.toLocaleString('ar-EG'),
      trend: data.stats.total_students_trend,
      icon: Users,
      color: 'var(--success)',
      spark: data.sparklines.students,
    },
    {
      title: 'الوظائف المنجزة',
      value: data.stats.completed_bookings.toLocaleString('ar-EG'),
      trend: data.stats.completed_bookings_trend,
      down: data.stats.completed_bookings_down,
      icon: TrendingUp,
      color: 'var(--gold)',
      spark: data.sparklines.bookings,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-border glass p-5 transition-all duration-300 hover:-translate-y-1"
            style={{ ['--c' as string]: stat.color }}
          >
            <div
              className="absolute -left-10 -top-10 h-28 w-28 rounded-full opacity-15 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: stat.color }}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in oklch, ${stat.color} 18%, transparent)` }}
              >
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </span>
            </div>

            <div className="relative mt-4 flex items-end justify-between gap-3">
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                  stat.down
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-[var(--success)]/15 text-[var(--success)]',
                )}
              >
                {stat.down ? (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
                {stat.trend}
              </span>
              <Sparkline data={stat.spark} color={stat.color} down={stat.down} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
