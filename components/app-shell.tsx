'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { GlobalFeedback } from '@/components/global-feedback'
import { RawJsonInspector } from '@/components/dev/raw-json-inspector'
import { DevDock } from '@/components/dev/dev-dock'
import { ErrorBoundary } from '@/components/dev/error-boundary'
import { AutoLockScreen } from '@/components/security/auto-lock-screen'
import { useExecMode } from '@/lib/exec-mode'

function ShellInner({ children }: { children: ReactNode }) {
  const { execMode } = useExecMode()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Ambient God Mode-aware background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-1000">
        <div
          className={
            execMode
              ? 'absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-destructive/25 blur-[130px] transition-all duration-1000'
              : 'absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px] transition-all duration-1000'
          }
        />
        <div
          className={
            execMode
              ? 'absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-gold/20 blur-[130px] transition-all duration-1000'
              : 'absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-accent/15 blur-[120px] transition-all duration-1000'
          }
        />
      </div>

      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
          onOpenCommand={() => setCommandOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-8">
          <Breadcrumbs />
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <GlobalFeedback />
      <RawJsonInspector />
      <DevDock />
      <AutoLockScreen />
    </div>
  )
}

/**
 * Dashboard chrome (sidebar + topbar + ambient background + dev overlays).
 *
 * Providers are NOT included here — they are mounted globally in the root
 * layout via `components/providers.tsx`. This component is rendered by
 * `app/dashboard/layout.tsx` so every protected route shares the same shell.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return <ShellInner>{children}</ShellInner>
}
