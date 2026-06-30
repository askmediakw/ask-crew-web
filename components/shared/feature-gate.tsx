'use client'

import type { ReactNode } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// FEATURE GATE (Freemium padlock)
// ----------------------------------------------------------------------------
// Wrap any premium UI. When `locked` is true the content is blurred and a
// padlock + upgrade prompt is overlaid. Free-tier users see the padlock; paid
// users pass `locked={false}` and see the real feature.
//
//   <FeatureGate locked={!isPro} feature="تحليلات متقدمة" requiredTier="احترافي">
//     <AdvancedAnalytics />
//   </FeatureGate>
// ============================================================================

export function FeatureGate({
  locked,
  feature,
  requiredTier = 'احترافي',
  onUpgrade,
  children,
  className,
}: {
  locked: boolean
  feature: string
  requiredTier?: string
  onUpgrade?: () => void
  children: ReactNode
  className?: string
}) {
  if (!locked) return <>{children}</>

  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)}>
      {/* Real content, blurred + non-interactive */}
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-6 text-center backdrop-blur-[2px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-black text-foreground">{feature}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            هذه الميزة متاحة لباقة «{requiredTier}» وما فوق.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
        >
          <Sparkles className="h-3.5 w-3.5" />
          ترقية الباقة
        </button>
      </div>
    </div>
  )
}

/** Small inline padlock badge for list items / menu entries. */
export function LockBadge({ tier = 'مدفوع' }: { tier?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
      <Lock className="h-3 w-3" />
      {tier}
    </span>
  )
}
