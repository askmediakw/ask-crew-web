import {
  Clapperboard,
  MapPin,
  Camera,
  Theater,
  Building,
  Truck,
  Armchair,
  Shirt,
  MonitorPlay,
  UtensilsCrossed,
  FileCheck2,
  type LucideIcon,
} from 'lucide-react'
import type { AssetType } from '@/types'

// ============================================================================
// ASSET TYPE CONFIG — single source for Arabic labels, icons & badge styling.
// Keeps the marketplace cards and the details panel perfectly in sync.
// ============================================================================

export interface AssetTypeMeta {
  /** Arabic display label for the type badge. */
  label: string
  icon: LucideIcon
  /** Tailwind classes for the badge (border/bg/text). */
  badgeClass: string
  /** Whether this type is a physical venue (no shipping, no buy). */
  isVenue: boolean
}

export const ASSET_TYPES: Record<AssetType, AssetTypeMeta> = {
  studio: {
    label: 'استديو',
    icon: Clapperboard,
    badgeClass: 'border-primary/40 bg-primary/15 text-primary',
    isVenue: true,
  },
  location: {
    label: 'موقع تصوير',
    icon: MapPin,
    badgeClass: 'border-success/40 bg-success/15 text-success',
    isVenue: true,
  },
  equipment: {
    label: 'معدات',
    icon: Camera,
    badgeClass: 'border-gold/40 bg-gold/15 text-gold',
    isVenue: false,
  },
  theater: {
    label: 'مسرح',
    icon: Theater,
    badgeClass: 'border-accent/40 bg-accent/15 text-accent-foreground',
    isVenue: true,
  },
  arena: {
    label: 'صالة عرض ضخمة',
    icon: Building,
    badgeClass: 'border-primary/40 bg-primary/15 text-primary',
    isVenue: true,
  },
  vehicle: {
    label: 'كرفان وسيارات تصوير',
    icon: Truck,
    badgeClass: 'border-warning/40 bg-warning/15 text-warning',
    isVenue: false,
  },
  prop: {
    label: 'إكسسوارات',
    icon: Armchair,
    badgeClass: 'border-gold/40 bg-gold/15 text-gold',
    isVenue: false,
  },
  wardrobe: {
    label: 'أزياء',
    icon: Shirt,
    badgeClass: 'border-gold/40 bg-gold/15 text-gold',
    isVenue: false,
  },
  postproduction: {
    label: 'غرفة مونتاج وتلوين',
    icon: MonitorPlay,
    badgeClass: 'border-primary/40 bg-primary/15 text-primary',
    isVenue: true,
  },
  catering: {
    label: 'إعاشة وبوفيهات',
    icon: UtensilsCrossed,
    badgeClass: 'border-success/40 bg-success/15 text-success',
    isVenue: true,
  },
  permit: {
    label: 'تصاريح وتأمين',
    icon: FileCheck2,
    badgeClass: 'border-destructive/40 bg-destructive/15 text-destructive',
    isVenue: true,
  },
}

/** Ordered list of (type, label) for marketplace filter chips. */
export const ASSET_TYPE_FILTERS: { value: AssetType; label: string }[] = (
  Object.keys(ASSET_TYPES) as AssetType[]
).map((t) => ({ value: t, label: ASSET_TYPES[t].label }))

/** Format a KWD amount with the Arabic currency suffix. */
export function kwd(amount: number): string {
  return `${amount.toLocaleString('en-US')} د.ك`
}

// ============================================================================
// DYNAMIC MARKETPLACE PRICING & COMMISSION
// ----------------------------------------------------------------------------
// Vendors/users set THEIR price; the platform adds a commission and the client
// sees the final price. Used by the asset/service/job forms and VOD pricing.
// ============================================================================

/** Platform commission rate applied on top of the vendor's price (10%). */
export const PLATFORM_COMMISSION_RATE = 0.1

export interface PricingBreakdown {
  vendorPrice: number
  platformFee: number
  finalPrice: number
  ratePercent: number
}

/** Given the vendor's price, compute the platform fee + final client price. */
export function computePricing(vendorPrice: number, rate = PLATFORM_COMMISSION_RATE): PricingBreakdown {
  const safe = Number.isFinite(vendorPrice) && vendorPrice > 0 ? vendorPrice : 0
  const platformFee = Math.round(safe * rate * 1000) / 1000
  return {
    vendorPrice: safe,
    platformFee,
    finalPrice: Math.round((safe + platformFee) * 1000) / 1000,
    ratePercent: Math.round(rate * 100),
  }
}
