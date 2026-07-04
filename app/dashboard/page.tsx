'use client'

import { useState, useEffect } from 'react'
import { StatsRow } from '@/components/dashboard/stats-row'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { SystemHealth } from '@/components/dashboard/system-health'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { GeoHeatmap } from '@/components/dashboard/geo-heatmap'
import { Leaderboard } from '@/components/shared/leaderboard'
import { EnterprisesTable } from '@/components/dashboard/enterprises-table'
import { apiServices, type DashboardStatsType } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardStatsType | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await apiServices.fetchDashboardStats()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">مركز القيادة التنفيذي</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            نظرة عامة على المنصة
          </h1>
        </div>
        <p className="font-mono text-sm text-muted-foreground">آخر تحديث: {new Date().toLocaleString('ar-EG')}</p>
      </header>

      <StatsRow data={dashboardData} />
      <SystemHealth />
      <GeoHeatmap />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={dashboardData} />
        <Leaderboard data={dashboardData?.leaderboard} />
      </div>
      <EnterprisesTable
        loading={loading}
        rows={dashboardData?.recent_enterprises}
      />
      <ActivityFeed data={dashboardData?.activity} />
    </div>
  )
}
