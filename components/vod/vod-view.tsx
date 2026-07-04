'use client'

import { useEffect, useState } from 'react'
import { Film, Star, Loader2, Play, Lock, Globe, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as api from '@/services/api'
import type { VodTitle } from '@/types'
import { VodTitleModal } from '@/components/vod/vod-title-modal'
import { Uploader } from '@/components/shared/uploader'

type Tab = 'catalog' | 'studio'

export function VodView() {
  const [tab, setTab] = useState<Tab>('catalog')
  const [top10, setTop10] = useState<VodTitle[]>([])
  const [catalog, setCatalog] = useState<VodTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<VodTitle | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([api.fetchVodTop10(), api.fetchVodCatalog()]).then(([t, c]) => {
      if (active) {
        setTop10(t)
        setCatalog(c)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">منصة البث والمحتوى المرئي</p>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
            <Film className="h-7 w-7 text-primary" />
            VOD — مكتبة الأعمال
          </h1>
        </div>
        <div className="flex rounded-lg bg-secondary/30 p-1">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-bold transition',
              tab === 'catalog' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            دليل المشاهدة
          </button>
          <button
            type="button"
            onClick={() => setTab('studio')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-bold transition',
              tab === 'studio' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            استوديو المنتِج
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : tab === 'catalog' ? (
        <>
          {/* Netflix-style Top 10 carousel */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">الأكثر مشاهدة اليوم — Top 10</h2>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
              {top10.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t)}
                  aria-label={`مشاهدة ${t.title}`}
                  className="group relative flex shrink-0 items-end"
                >
                  {/* Giant rank numeral */}
                  <span
                    className="select-none font-black leading-none text-transparent"
                    style={{
                      fontSize: '7rem',
                      WebkitTextStroke: '2px var(--color-gold)',
                      marginInlineEnd: '-1.5rem',
                    }}
                    aria-hidden
                  >
                    {t.top10Rank}
                  </span>
                  <div className="relative h-44 w-28 overflow-hidden rounded-lg border border-border transition group-hover:border-primary">
                    <img src={t.poster || '/placeholder.svg'} alt={t.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Full catalog */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">كل الأعمال</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {catalog.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t)}
                  aria-label={`مشاهدة ${t.title}`}
                  className="group overflow-hidden rounded-xl border border-border text-right transition hover:border-primary/60"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={t.poster || '/placeholder.svg'}
                      alt={t.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {t.accessTiers.includes('free') && (
                      <span className="absolute start-1.5 top-1.5 rounded bg-success/90 px-1.5 py-0.5 text-[10px] font-black text-white">
                        مجاني
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 p-2.5">
                    <p className="truncate text-xs font-black text-foreground">{t.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 text-gold">
                        <Star className="h-3 w-3 fill-gold" />
                        {t.rating.toFixed(1)}
                      </span>
                      <span>{t.year}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <StudioPanel />
      )}

      {selected && <VodTitleModal title={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function StudioPanel() {
  const [drmEnabled, setDrmEnabled] = useState(true)
  const [geoBlock, setGeoBlock] = useState(false)
  const [watermark, setWatermark] = useState(true)

  const toggles = [
    { label: 'تشفير DRM للمحتوى', desc: 'حماية الفيديو من النسخ غير المصرّح به', Icon: Lock, value: drmEnabled, set: setDrmEnabled },
    { label: 'الحجب الجغرافي', desc: 'تقييد المشاهدة حسب الدولة', Icon: Globe, value: geoBlock, set: setGeoBlock },
    { label: 'العلامة المائية الديناميكية', desc: 'إضافة معرّف المشاهد فوق الفيديو', Icon: ShieldCheck, value: watermark, set: setWatermark },
  ]

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-bold text-foreground">رفع عمل جديد</h2>
        <Uploader accept="video/*" />
      </section>

      <section className="glass rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-bold text-foreground">إعدادات الحماية (DRM)</h2>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between rounded-xl border border-border bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <t.Icon className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={t.value}
                aria-label={t.label}
                onClick={() => t.set((v) => !v)}
                className={cn('relative h-6 w-11 shrink-0 rounded-full transition', t.value ? 'bg-primary' : 'bg-muted')}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all',
                    t.value ? 'left-0.5' : 'left-[22px]',
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
