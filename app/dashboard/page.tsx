import { StatsRow } from '@/components/dashboard/stats-row'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { SystemHealth } from '@/components/dashboard/system-health'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { GeoHeatmap } from '@/components/dashboard/geo-heatmap'
import { Leaderboard } from '@/components/shared/leaderboard'

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">مركز القيادة التنفيذي</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            نظرة عامة على المنصة
          </h1>
        </div>
        <p className="font-mono text-sm text-muted-foreground">آخر تحديث: اليوم 14:32</p>
      </header>

      <StatsRow />
      <SystemHealth />
      <GeoHeatmap />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <Leaderboard />
      </div>
      <ActivityFeed />
    </div>
  )
}
