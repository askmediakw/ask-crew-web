'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, Star, MapPin, Truck, PackageCheck, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import * as api from '@/services/api'
import type { Asset, AssetType } from '@/types'
import { ASSET_TYPES, ASSET_TYPE_FILTERS, kwd } from '@/lib/asset-config'
import { AssetDetailsPanel } from '@/components/assets/asset-details-panel'
import { RowActions, type CrudField } from '@/components/shared/crud'
import { AddAssetButton } from '@/components/assets/asset-form'
import { Leaderboard } from '@/components/shared/leaderboard'

const assetEditFields = (a: Asset): CrudField[] => [
  { key: 'name', label: 'اسم الأصل', value: a.name, full: true },
  { key: 'provider', label: 'المزوّد', value: a.provider },
  { key: 'city', label: 'المدينة', value: a.city },
  { key: 'dayRateKwd', label: 'سعر التأجير اليومي (د.ك)', value: a.dayRateKwd?.toString() ?? '', type: 'number' },
  { key: 'purchaseKwd', label: 'سعر الشراء (د.ك)', value: a.purchaseKwd?.toString() ?? '', type: 'number' },
]

export function AssetsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [filter, setFilter] = useState<AssetType | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api.fetchAssets().then((a) => {
      if (active) setAssets(a)
    })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!assets) return []
    return assets.filter((a) => {
      const matchesType = filter === 'all' || a.type === filter
      const matchesQuery =
        !query.trim() ||
        a.name.includes(query) ||
        a.provider.includes(query) ||
        a.city.includes(query)
      return matchesType && matchesQuery
    })
  }, [assets, filter, query])

  const editAsset = (id: string, v: Record<string, string>) =>
    setAssets((prev) =>
      (prev ?? []).map((a) =>
        a.id === id
          ? {
              ...a,
              name: v.name || a.name,
              provider: v.provider || a.provider,
              city: v.city || a.city,
              dayRateKwd: v.dayRateKwd ? Number(v.dayRateKwd) : a.dayRateKwd,
              purchaseKwd: v.purchaseKwd ? Number(v.purchaseKwd) : a.purchaseKwd,
            }
          : a,
      ),
    )

  const removeAsset = (id: string) => setAssets((prev) => (prev ?? []).filter((a) => a.id !== id))

  const addAsset = (asset: Asset) => setAssets((prev) => [asset, ...(prev ?? [])])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Boxes className={cn('h-6 w-6', accent)} />
            المعدات والمواقع
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سوق متكامل لتأجير وشراء الاستديوهات والمواقع والمعدات وكل ما يخدم الإنتاج السينمائي.
          </p>
        </div>
        <AddAssetButton onCreated={addAsset} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground end-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن أصل، مزوّد، أو مدينة..."
          className="w-full rounded-xl border border-border bg-white/5 py-2.5 pe-10 ps-4 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {/* Type filter chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip label="الكل" active={filter === 'all'} onClick={() => setFilter('all')} />
        {ASSET_TYPE_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </div>

      {/* Grid */}
      {assets === null ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">لا توجد أصول مطابقة للبحث.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onOpen={() => setSelectedId(asset.id)}
              onEdit={(v) => editAsset(asset.id, v)}
              onDelete={() => removeAsset(asset.id)}
            />
          ))}
        </div>
      )}

      <Leaderboard defaultCategory="assets" />

      {selectedId && <AssetDetailsPanel assetId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function AssetCard({
  asset,
  onOpen,
  onEdit,
  onDelete,
}: {
  asset: Asset
  onOpen: () => void
  onEdit: (v: Record<string, string>) => void
  onDelete: () => void
}) {
  const meta = ASSET_TYPES[asset.type]
  const TypeIcon = meta.icon
  const canBuy = asset.transactionTypes.includes('buy')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`عرض تفاصيل ${asset.name}`}
      className="glass group cursor-pointer overflow-hidden rounded-2xl border border-border text-right transition hover:border-primary/50"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={asset.images[0] || '/placeholder.svg'}
          alt={asset.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={cn(
            'absolute start-2 top-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black backdrop-blur-sm',
            meta.badgeClass,
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {meta.label}
        </span>
        {!meta.isVenue && (
          <span
            className={cn(
              'absolute end-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm',
              asset.isShippable ? 'bg-success/80 text-white' : 'bg-muted/80 text-foreground',
            )}
          >
            {asset.isShippable ? <Truck className="h-3 w-3" /> : <PackageCheck className="h-3 w-3" />}
            {asset.isShippable ? 'قابل للشحن' : 'استلام شخصي'}
          </span>
        )}
        {/* CRUD actions — stop propagation so the card click (open) doesn't fire */}
        <div className="absolute bottom-2 end-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <RowActions
            entityLabel="الأصل"
            entityName={asset.name}
            fields={assetEditFields(asset)}
            onEdited={onEdit}
            onDeleted={onDelete}
          />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black leading-snug text-foreground">{asset.name}</h3>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-gold">
            <Star className="h-3 w-3 fill-gold" />
            {asset.rating.toFixed(1)}
          </span>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {asset.city}، {asset.country}
        </p>
        <div className="flex items-end justify-between pt-1">
          <div>
            {asset.dayRateKwd !== undefined && (
              <p className="text-sm font-black text-foreground">
                {kwd(asset.dayRateKwd)}
                <span className="text-xs font-normal text-muted-foreground"> / يوم</span>
              </p>
            )}
            {canBuy && asset.purchaseKwd !== undefined && (
              <p className="text-xs text-muted-foreground">شراء: {kwd(asset.purchaseKwd)}</p>
            )}
          </div>
          {canBuy && (
            <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-black text-gold">
              للبيع والتأجير
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
