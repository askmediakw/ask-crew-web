'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Menu, PanelRightClose, Search, CheckCheck, X, Sun, Moon, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useTheme } from '@/lib/theme'
import { clearAuthToken } from '@/lib/auth'
import { RoleSimulator } from '@/components/dev/role-simulator'
import { MockLiveToggle } from '@/components/dev/mock-live-toggle'
import { LanguageSwitcher } from '@/components/settings/language-switcher'

const tickerItems = [
  "اشتركت 'رويال للإنتاج' بباقة VIP — 1,152 د.ك",
  "فعّلت 'سينما آرت' باقة Enterprise — 336 د.ك",
  "انضمت 12 موهبة جديدة خلال الساعة الأخيرة",
  "ترقية باقة لـ 'فوكس ميديا' إلى Pro — 48 د.ك",
  "تجاوزت المبيعات اليومية 4,800 د.ك",
]

type Notification = {
  id: number
  title: string
  time: string
  tone: 'info' | 'success' | 'alert'
  read: boolean
}

const initialNotifications: Notification[] = [
  { id: 1, title: "اشتراك جديد من 'رويال للإنتاج' بباقة VIP", time: 'قبل دقيقتين', tone: 'success', read: false },
  { id: 2, title: "اقترب عقد 'استوديو النخبة' من الانتهاء (4 أيام)", time: 'قبل 18 دقيقة', tone: 'alert', read: false },
  { id: 3, title: 'تم رفع 6 بوسترات جديدة بانتظار المراجعة', time: 'قبل ساعة', tone: 'info', read: false },
  { id: 4, title: "فعّلت 'سينما آرت' المصادقة الثنائية", time: 'قبل 3 ساعات', tone: 'info', read: true },
]

const toneDot: Record<Notification['tone'], string> = {
  info: 'bg-primary',
  success: 'bg-success',
  alert: 'bg-destructive',
}

export function Topbar({
  onToggleSidebar,
  onToggleMobileSidebar,
  onOpenCommand,
}: {
  onToggleSidebar: () => void
  onToggleMobileSidebar: () => void
  onOpenCommand: () => void
}) {
  const { execMode } = useExecMode()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    clearAuthToken()
    router.push('/')
  }

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markOneRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-20 items-center justify-start gap-4 border-b bg-background/70 px-4 backdrop-blur-xl transition-colors duration-500 md:px-8',
        execMode ? 'border-destructive/30' : 'border-border',
      )}
    >
      {/* Sidebar toggles */}
      <button
        onClick={onToggleSidebar}
        className="hidden rounded-lg bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:inline-flex"
        aria-label="طي الشريط الجانبي"
      >
        <PanelRightClose className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleMobileSidebar}
        className="rounded-lg bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Tightly grouped: ticker, search, bell */}
      <div className="flex min-w-0 items-center gap-4">
        {/* Live activity ticker */}
        <div
          className={cn(
            'hidden min-w-0 items-center gap-3 rounded-full border py-1.5 pr-4 backdrop-blur-md transition-colors duration-500 lg:flex lg:w-80',
            execMode
              ? 'border-destructive/30 bg-destructive/10 glow-alert'
              : 'border-primary/20 bg-primary/10',
          )}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                execMode ? 'bg-destructive' : 'bg-primary',
              )}
            />
            <span
              className={cn(
                'relative inline-flex h-2.5 w-2.5 rounded-full',
                execMode ? 'bg-destructive' : 'bg-primary',
              )}
            />
          </span>
          <span
            className={cn(
              'shrink-0 text-xs font-bold',
              execMode ? 'text-destructive' : 'text-primary',
            )}
          >
            نشاط حي
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs text-muted-foreground">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Command search */}
        <button
          onClick={onOpenCommand}
          className="hidden items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>بحث سريع...</span>
          <kbd className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={onOpenCommand}
          className="rounded-xl border border-border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground sm:hidden"
          aria-label="بحث"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notification bell + dropdown */}
        <div ref={wrapperRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            className={cn(
              'relative rounded-xl border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground',
              open ? (execMode ? 'border-destructive/50 text-foreground' : 'border-primary/50 text-foreground') : 'border-border',
            )}
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full animate-pulse-ring rounded-full',
                    execMode ? 'bg-destructive' : 'bg-accent',
                  )}
                />
                <span
                  className={cn(
                    'relative inline-flex h-3 w-3 rounded-full border-2 border-background',
                    execMode ? 'bg-destructive glow-alert' : 'bg-accent',
                  )}
                />
              </span>
            )}
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 origin-top-left overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">الإشعارات</h3>
                  {unread > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold text-white',
                        execMode ? 'bg-destructive' : 'bg-primary',
                      )}
                    >
                      {unread} جديد
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  disabled={unread === 0}
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium transition disabled:opacity-40',
                    execMode ? 'text-destructive hover:opacity-80' : 'text-primary hover:opacity-80',
                  )}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  تعليم الكل كمقروء
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-right transition-colors last:border-0 hover:bg-white/5',
                      !n.read && 'bg-white/[0.03]',
                    )}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', toneDot[n.tone])} />
                    <span className="min-w-0 flex-1 leading-snug">
                      <span
                        className={cn(
                          'block text-sm',
                          n.read ? 'text-muted-foreground' : 'font-medium text-foreground',
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{n.time}</span>
                    </span>
                    {!n.read && (
                      <span
                        className={cn(
                          'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                          execMode ? 'bg-destructive' : 'bg-accent',
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer pushes the group to the start (right in RTL) */}
      <div className="flex-1" />

      {/* Mock vs Live (DX) + Theme toggle (#9) + Role simulator (#17) + Logout */}
      <div className="flex items-center gap-2">
        <MockLiveToggle />
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          aria-label="تبديل السمة"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <RoleSimulator />
        <button
          onClick={handleLogout}
          className="rounded-xl border border-border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-destructive"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
