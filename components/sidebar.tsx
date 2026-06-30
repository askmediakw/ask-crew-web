'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/nav'
import { useExecMode } from '@/lib/exec-mode'
import { getAuthUser } from '@/lib/auth'

function NavList({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  const { execMode } = useExecMode()
  const { t } = useTranslation()

  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 scrollbar-thin">
      {navItems.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        const label = t(`nav.${item.key}`, item.label)
        return (
          <Link
            key={item.href}
            href={item.href}
            title={label}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? execMode
                  ? 'bg-destructive/15 text-foreground'
                  : 'bg-primary/15 text-primary-foreground'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            {active && (
              <span
                className={cn(
                  'absolute inset-y-1.5 start-0 w-1 rounded-full',
                  execMode ? 'bg-destructive glow-alert' : 'bg-primary glow-brand',
                )}
              />
            )}
            <Icon
              className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                active
                  ? execMode
                    ? 'text-destructive'
                    : 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  const { execMode, toggleExecMode } = useExecMode()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 border-b border-sidebar-border px-4 py-5">
      <button
        type="button"
        onClick={toggleExecMode}
        aria-pressed={execMode}
        title={execMode ? t('sidebar.disableGodMode') : t('sidebar.enableGodMode')}
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl border transition-all duration-500 hover:scale-105',
          collapsed ? 'h-11 w-11' : 'h-16 w-16',
          execMode ? 'border-destructive glow-alert' : 'border-primary/40 glow-brand',
        )}
      >
        <Image src="/logo.png" alt="شعار ASK CREW" fill className="object-cover" sizes="64px" />
      </button>
      {!collapsed && (
        <div className="text-center leading-tight">
          <p className="text-base font-black tracking-widest text-foreground">ASK CREW</p>
          <p
            className={cn(
              'mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors',
              execMode ? 'animate-pulse text-destructive' : 'text-accent',
            )}
          >
            {execMode ? t('sidebar.godMode') : t('sidebar.brandTagline')}
          </p>
        </div>
      )}
    </div>
  )
}

function Profile({ collapsed }: { collapsed: boolean }) {
  const { execMode } = useExecMode()
  const { t } = useTranslation()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    setUser(getAuthUser())
  }, [])

  const userName = (user?.name || user?.full_name || user?.email || 'مستخدم') as string
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ع'

  return (
    <div className="border-t border-sidebar-border p-4">
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-all',
          !collapsed && execMode && 'glow-alert',
          collapsed && 'justify-center',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-primary-foreground transition-colors',
            execMode
              ? 'bg-gradient-to-br from-destructive to-gold'
              : 'bg-gradient-to-br from-primary to-accent',
          )}
        >
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
            <p
              className={cn(
                'truncate text-xs',
                execMode ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {t('sidebar.role')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function Sidebar({
  open,
  mobileOpen,
  onCloseMobile,
}: {
  open: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const { execMode } = useExecMode()
  const { t } = useTranslation()

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-e bg-sidebar/80 backdrop-blur-xl transition-all duration-500 ease-in-out md:flex',
          execMode ? 'border-destructive/30' : 'border-sidebar-border',
          open ? 'w-64' : 'w-20',
        )}
      >
        <Brand collapsed={!open} />
        <NavList collapsed={!open} />
        <Profile collapsed={!open} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="absolute start-0 top-0 flex h-full w-72 flex-col border-e border-sidebar-border bg-sidebar">
            <div className="relative">
              <Brand collapsed={false} />
              <button
                onClick={onCloseMobile}
                className="absolute end-4 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label={t('sidebar.closeMenu')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={onCloseMobile} className="flex flex-1 flex-col">
              <NavList collapsed={false} />
            </div>
            <Profile collapsed={false} />
          </aside>
        </div>
      )}
    </>
  )
}
