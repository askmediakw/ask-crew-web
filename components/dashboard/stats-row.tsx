import { ArrowDownRight, ArrowUpRight, Building2, TrendingUp, Users, Wallet } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/sparkline'
import { cn } from '@/lib/utils'

type Stat = {
  title: string
  value: string
  trend: string
  down?: boolean
  icon: typeof Wallet
  spark: number[]
  color: string
}

const stats: Stat[] = [
  {
    title: 'إجمالي المبيعات',
    value: '68,780 د.ك',
    trend: '+12.5%',
    icon: Wallet,
    color: 'var(--primary)',
    spark: [12, 18, 14, 22, 19, 28, 24, 34, 30, 42],
  },
  {
    title: 'الشركات النشطة',
    value: '142',
    trend: '+5.2%',
    icon: Building2,
    color: 'var(--accent)',
    spark: [20, 22, 21, 25, 24, 27, 29, 28, 33, 35],
  },
  {
    title: 'المواهب المستقلة',
    value: '3,890',
    trend: '+18.1%',
    icon: Users,
    color: 'var(--success)',
    spark: [8, 12, 16, 14, 20, 26, 24, 32, 38, 46],
  },
  {
    title: 'الوظائف المنجزة',
    value: '874',
    trend: '-2.4%',
    down: true,
    icon: TrendingUp,
    color: 'var(--gold)',
    spark: [40, 38, 42, 36, 39, 33, 35, 30, 32, 28],
  },
]

export function StatsRow() {
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
