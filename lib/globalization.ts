// Pure, dependency-light helpers shared by API routes and client components.
// All values are illustrative mock data; swap for real services in the next phase.

// ----------------------------------------------------------------------------
// Countries: flags, dial codes, GCC membership, VAT + purchasing-power index
// ----------------------------------------------------------------------------
export type CountryInfo = {
  code: string
  nameAr: string
  flag: string
  gcc: boolean
  vatRate: number // standard VAT %
  // Purchasing-power index relative to Kuwait (1.0). <1 means cheaper labor.
  pppIndex: number
}

export const COUNTRIES: Record<string, CountryInfo> = {
  KW: { code: 'KW', nameAr: 'الكويت', flag: '🇰🇼', gcc: true, vatRate: 0, pppIndex: 1.0 },
  SA: { code: 'SA', nameAr: 'السعودية', flag: '🇸🇦', gcc: true, vatRate: 15, pppIndex: 0.78 },
  AE: { code: 'AE', nameAr: 'الإمارات', flag: '🇦🇪', gcc: true, vatRate: 5, pppIndex: 0.85 },
  QA: { code: 'QA', nameAr: 'قطر', flag: '🇶🇦', gcc: true, vatRate: 0, pppIndex: 0.9 },
  BH: { code: 'BH', nameAr: 'البحرين', flag: '🇧🇭', gcc: true, vatRate: 10, pppIndex: 0.72 },
  OM: { code: 'OM', nameAr: 'عُمان', flag: '🇴🇲', gcc: true, vatRate: 5, pppIndex: 0.7 },
  EG: { code: 'EG', nameAr: 'مصر', flag: '🇪🇬', gcc: false, vatRate: 14, pppIndex: 0.32 },
  JO: { code: 'JO', nameAr: 'الأردن', flag: '🇯🇴', gcc: false, vatRate: 16, pppIndex: 0.45 },
  LB: { code: 'LB', nameAr: 'لبنان', flag: '🇱🇧', gcc: false, vatRate: 11, pppIndex: 0.38 },
  US: { code: 'US', nameAr: 'أمريكا', flag: '🇺🇸', gcc: false, vatRate: 0, pppIndex: 1.6 },
  GB: { code: 'GB', nameAr: 'بريطانيا', flag: '🇬🇧', gcc: false, vatRate: 20, pppIndex: 1.45 },
}

export function getCountry(code: string): CountryInfo | undefined {
  return COUNTRIES[code?.toUpperCase()]
}

// ----------------------------------------------------------------------------
// Visa: does `residence` country require a visa to work in `target`?
// ----------------------------------------------------------------------------
export function visaStatus(residence: string, target = 'KW') {
  const res = getCountry(residence)
  const tgt = getCountry(target)
  if (!res || !tgt) return { required: true, label: 'يتطلب تأشيرة عمل' }
  // GCC nationals move freely within the GCC.
  if (res.gcc && tgt.gcc) {
    return { required: false, label: 'إقامة حرة (مواطن خليجي)' }
  }
  return { required: true, label: 'يتطلب تأشيرة عمل / كفالة' }
}

// ----------------------------------------------------------------------------
// Timezones (vs Kuwait, GMT+3)
// ----------------------------------------------------------------------------
export const TIMEZONES: Record<string, { tz: string; offset: number }> = {
  KW: { tz: 'Asia/Kuwait', offset: 3 },
  SA: { tz: 'Asia/Riyadh', offset: 3 },
  AE: { tz: 'Asia/Dubai', offset: 4 },
  EG: { tz: 'Africa/Cairo', offset: 2 },
  GB: { tz: 'Europe/London', offset: 0 },
  US: { tz: 'America/New_York', offset: -5 },
}

export function localTimeFor(countryCode: string, base = new Date()) {
  const info = TIMEZONES[countryCode?.toUpperCase()] ?? TIMEZONES.KW
  const utc = base.getTime() + base.getTimezoneOffset() * 60000
  const local = new Date(utc + info.offset * 3600000)
  const hh = local.getHours()
  const mm = local.getMinutes().toString().padStart(2, '0')
  const period = hh < 12 ? 'ص' : 'م'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return { time: `${h12}:${mm} ${period}`, offset: info.offset, tz: info.tz }
}

// ----------------------------------------------------------------------------
// Haversine distance (km) for the radius locator
// ----------------------------------------------------------------------------
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10
}

// ----------------------------------------------------------------------------
// Billing cycles (mirrors components/plans/types.ts CYCLE_META)
// ----------------------------------------------------------------------------
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export const CYCLE_MONTHS: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

export const CYCLE_DISCOUNT: Record<BillingCycle, number> = {
  monthly: 0,
  quarterly: 0.1,
  semiannual: 0.15,
  annual: 0.2,
}

/** Total price for a billing period given a monthly KWD base price. */
export function cyclePrice(monthlyPrice: number, cycle: BillingCycle): number {
  const months = CYCLE_MONTHS[cycle]
  const discount = CYCLE_DISCOUNT[cycle]
  return Math.round(monthlyPrice * months * (1 - discount) * 1000) / 1000
}

// ----------------------------------------------------------------------------
// VAT computation for cross-border contracts
// ----------------------------------------------------------------------------
export function computeVat(amount: number, countryCode: string) {
  const country = getCountry(countryCode)
  const rate = country?.vatRate ?? 0
  const vat = Math.round(amount * (rate / 100) * 1000) / 1000
  return {
    rate,
    vat,
    total: Math.round((amount + vat) * 1000) / 1000,
    platformLiable: false, // freelancer is responsible per T&C
  }
}

// ----------------------------------------------------------------------------
// Purchasing-power savings hint
// ----------------------------------------------------------------------------
export function purchasingPower(targetCountry: string, baseCountry = 'KW') {
  const target = getCountry(targetCountry)
  const base = getCountry(baseCountry)
  if (!target || !base) return { savingsPct: 0, cheaper: false }
  const savingsPct = Math.round((1 - target.pppIndex / base.pppIndex) * 100)
  return { savingsPct, cheaper: savingsPct > 0 }
}
