import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'
import { DashboardGuard } from '@/components/auth/dashboard-guard'

/**
 * Protected dashboard layout.
 *
 * Every `/dashboard/*` route is gated by DashboardGuard, which redirects any
 * visitor without a verified VIP session back to the login gateway before the
 * AppShell chrome (sidebar, topbar, breadcrumbs, command palette) renders.
 * Global providers (Theme, i18n, Currency) are supplied by the root layout.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardGuard>
      <AppShell>{children}</AppShell>
    </DashboardGuard>
  )
}
