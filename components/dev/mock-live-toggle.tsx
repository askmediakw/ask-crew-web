'use client'

import { Database, Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMockMode } from '@/lib/mock-mode'

/**
 * Prominent header switch: "وضع الاختبار (Mock)" vs "وضع الربط (Live API)".
 * Reflects + controls the runtime flag the API layer reads.
 */
export function MockLiveToggle() {
  const { mockMode, toggleMockMode } = useMockMode()

  return (
    <button
      onClick={toggleMockMode}
      role="switch"
      aria-checked={!mockMode}
      title={mockMode ? 'البيانات وهمية — اضغط للتبديل إلى الـ API الحقيقي' : 'متصل بالـ API الحقيقي'}
      className={cn(
        'group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition',
        mockMode
          ? 'border-warning/40 bg-warning/10 text-warning'
          : 'border-success/40 bg-success/10 text-success',
      )}
    >
      {mockMode ? <Database className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
      <span className="hidden sm:inline">{mockMode ? 'وضع الاختبار' : 'وضع الربط'}</span>

      {/* Track */}
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          mockMode ? 'bg-warning/30' : 'bg-success/40',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
            mockMode ? 'right-0.5' : 'right-4',
          )}
        />
      </span>
    </button>
  )
}
