'use client'

import { useState, useEffect } from 'react'
import { Globe2, Save, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { apiServices, type SiteSettingsType, type ConstanceConfigType } from '@/lib/api'

export function SiteSettingsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettingsType | null>(null)
  const [constanceConfig, setConstanceConfig] = useState<ConstanceConfigType | null>(null)
  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    WATERMARK_PRICE: 0,
    THREE_MONTHS_DISCOUNT: 0,
    YEARLY_DISCOUNT: 0,
    BOOKING_COMMISION_RATE: 0,
    CONTENT_COMMISION_RATE: 0,
  })

  // Fetch data
  const loadData = async () => {
    setLoading(true)
    try {
      const [site, config] = await Promise.all([
        apiServices.fetchSiteSettings(),
        apiServices.fetchConstanceConfig(),
      ])
      setSiteSettings(site)
      setConstanceConfig(config)
      setFormData({
        domain: site.domain,
        name: site.name,
        WATERMARK_PRICE: config.WATERMARK_PRICE,
        THREE_MONTHS_DISCOUNT: config.THREE_MONTHS_DISCOUNT,
        YEARLY_DISCOUNT: config.YEARLY_DISCOUNT,
        BOOKING_COMMISION_RATE: config.BOOKING_COMMISION_RATE,
        CONTENT_COMMISION_RATE: config.CONTENT_COMMISION_RATE,
      })
    } catch (err) {
      console.error('Failed to load site settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }))
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        apiServices.updateSiteSettings({ domain: formData.domain, name: formData.name }),
        apiServices.updateConstanceConfig({
          WATERMARK_PRICE: formData.WATERMARK_PRICE,
          THREE_MONTHS_DISCOUNT: formData.THREE_MONTHS_DISCOUNT,
          YEARLY_DISCOUNT: formData.YEARLY_DISCOUNT,
          BOOKING_COMMISION_RATE: formData.BOOKING_COMMISION_RATE,
          CONTENT_COMMISION_RATE: formData.CONTENT_COMMISION_RATE,
        }),
      ])
      await loadData() // Refresh
      alert('تم حفظ التغييرات بنجاح!')
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('فشل في حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Globe2 className={cn('h-6 w-6', accent)} />
            الإعدادات العامة للموقع
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">التحكم في الهوية العامة للمنصة وبيانات التسعير.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'جار الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Site Information */}
        <div className="glass rounded-2xl border border-border p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">معلومات الموقع</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">اسم الموقع</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">اسم النطاق (Domain)</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Commissions */}
        <div className="glass rounded-2xl border border-border p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">التسعير والعمولات</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">سعر العلامة المائية</label>
              <input
                type="number"
                step="0.01"
                name="WATERMARK_PRICE"
                value={formData.WATERMARK_PRICE}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">خصم 3 أشهر (%)</label>
                <input
                  type="number"
                  name="THREE_MONTHS_DISCOUNT"
                  value={formData.THREE_MONTHS_DISCOUNT}
                  onChange={handleChange}
                  className="input-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">خصم سنوي (%)</label>
                <input
                  type="number"
                  name="YEARLY_DISCOUNT"
                  value={formData.YEARLY_DISCOUNT}
                  onChange={handleChange}
                  className="input-base"
                />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">عمولة الحجوزات (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="BOOKING_COMMISION_RATE"
                  value={formData.BOOKING_COMMISION_RATE}
                  onChange={handleChange}
                  className="input-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">عمولة المحتوى (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="CONTENT_COMMISION_RATE"
                  value={formData.CONTENT_COMMISION_RATE}
                  onChange={handleChange}
                  className="input-base"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
