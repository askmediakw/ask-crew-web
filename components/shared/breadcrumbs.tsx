'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { ChevronLeft, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

// #5 — Auto breadcrumbs driven by the App Router pathname.
// Each segment is matched against navItems to recover a human label (i18n
// aware via the `nav.<key>` namespace), falling back to the raw segment.
export function Breadcrumbs() {
  const pathname = usePathname()
  const { t } = useTranslation()

  // Build a lookup of href -> nav item for fast label resolution.
  const byHref = new Map(navItems.map((item) => [item.href, item]))

  // The dashboard root needs no breadcrumb trail (the Home icon represents it).
  if (pathname === '/dashboard') return null

  const allSegments = pathname.split('/').filter(Boolean)
  // The leading "dashboard" segment is represented by the Home icon, so the
  // trail is built from the segments that follow it.
  const segments = allSegments[0] === 'dashboard' ? allSegments.slice(1) : allSegments
  const basePrefix = allSegments[0] === 'dashboard' ? '/dashboard' : ''

  // Accumulate hrefs so each crumb links to its own level.
  const crumbs = segments.map((seg, i) => {
    const href = basePrefix + '/' + segments.slice(0, i + 1).join('/')
    const item = byHref.get(href)
    const label = item ? t(`nav.${item.key}`, item.label) : decodeURIComponent(seg)
    return { href, label }
  })

  const homeLabel = t('nav.home', 'الرئيسية')

  return (
    <nav aria-label="مسار التنقل" className="mb-5 flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">{homeLabel}</span>
      </Link>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <Fragment key={crumb.href}>
            {/* ChevronLeft points in the natural reading direction for RTL. */}
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
            {isLast ? (
              <span aria-current="page" className="font-semibold text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cn('text-muted-foreground transition-colors hover:text-foreground')}
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
