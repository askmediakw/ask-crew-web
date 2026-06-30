'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import { ASSET_TYPES, computePricing } from '@/lib/asset-config'
import { PricingCommissionField } from '@/components/shared/pricing-commission'
import type { Asset, AssetType, TransactionType } from '@/types'

// ============================================================================
// ADD ASSET — marketplace listing form with dynamic vendor pricing.
// The vendor enters THEIR price; the platform commission + final client price
// are computed live (see PricingCommissionField). On save we build a complete
// Asset object and hand it back to the marketplace via `onCreated`.
// TODO(backend): POST /api/assets { ...asset, vendorPrice, platformFee }.
// ============================================================================

const TYPE_OPTIONS = (Object.keys(ASSET_TYPES) as AssetType[]).map((t) => ({ value: t, label: ASSET_TYPES[t].label }))

function AssetFormBody({ onCreated }: { onCreated: (a: Asset) => void }) {
  const { closeModal } = useModal()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [type, setType] = useState<AssetType>('equipment')
  const [provider, setProvider] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('الكويت')
  const [description, setDescription] = useState('')
  const [txTypes, setTxTypes] = useState<TransactionType[]>(['rent'])
  const [dayPrice, setDayPrice] = useState('')
  const [buyPrice, setBuyPrice] = useState('')

  const isVenue = ASSET_TYPES[type].isVenue
  const canRent = txTypes.includes('rent')
  const canBuy = txTypes.includes('buy')
  const valid = name.trim() && provider.trim() && (canRent ? Number(dayPrice) > 0 : true) && (canBuy ? Number(buyPrice) > 0 : true)

  const toggleTx = (t: TransactionType) =>
    setTxTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const save = () => {
    const dayFinal = computePricing(Number(dayPrice)).finalPrice
    const buyFinal = computePricing(Number(buyPrice)).finalPrice
    const asset: Asset = {
      id: `as_${Date.now()}`,
      name: name.trim(),
      type,
      description: description.trim() || 'لا يوجد وصف.',
      provider: provider.trim(),
      images: ['/placeholder.svg'],
      country,
      city: city.trim() || country,
      availableIn: [country],
      transactionTypes: txTypes.length ? txTypes : ['rent'],
      dayRateKwd: canRent ? dayFinal : undefined,
      purchaseKwd: canBuy ? buyFinal : undefined,
      isShippable: !isVenue,
      rating: 5,
      reviewCount: 0,
      metadata: {
        'سعر المزوّد (تأجير/يوم)': canRent ? `${dayPrice} د.ك` : '—',
        'سعر المزوّد (شراء)': canBuy ? `${buyPrice} د.ك` : '—',
      },
    }
    onCreated(asset)
    toast.success(`تمت إضافة الأصل: ${asset.name}`)
    closeModal()
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">اسم الأصل</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="مثال: كاميرا RED Komodo 6K" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">النوع</label>
            <select value={type} onChange={(e) => setType(e.target.value as AssetType)} className="input-base">
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-popover">{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">المزوّد</label>
            <input value={provider} onChange={(e) => setProvider(e.target.value)} className="input-base" placeholder="اسم المزوّد" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">الدولة</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">المدينة</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input-base" placeholder="مدينة الكويت" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">طريقة الإتاحة</label>
          <div className="flex gap-2">
            <TxToggle label="للتأجير" active={canRent} onClick={() => toggleTx('rent')} />
            {!isVenue && <TxToggle label="للبيع" active={canBuy} onClick={() => toggleTx('buy')} />}
          </div>
        </div>

        {/* Dynamic pricing — vendor price → commission → final client price */}
        {canRent && (
          <PricingCommissionField value={dayPrice} onChange={setDayPrice} label="سعر التأجير اليومي (سعرك)" hint="هذا هو المبلغ الذي تستلمه — تضيف المنصة عمولتها فوقه." />
        )}
        {canBuy && (
          <PricingCommissionField value={buyPrice} onChange={setBuyPrice} label="سعر البيع (سعرك)" />
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الوصف</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-base h-24 resize-none" placeholder="تفاصيل الأصل ومواصفاته..." />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={closeModal} className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10">
          إلغاء
        </button>
        <button
          onClick={save}
          disabled={!valid}
          className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          نشر الأصل
        </button>
      </div>
    </div>
  )
}

function TxToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white/5 text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

export function AddAssetButton({ onCreated }: { onCreated: (a: Asset) => void }) {
  const { openModal } = useModal()
  return (
    <button
      onClick={() => openModal({ title: 'إضافة أصل جديد للسوق', content: <AssetFormBody onCreated={onCreated} />, size: 'lg' })}
      className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      إضافة أصل جديد
    </button>
  )
}
