// ============================================================================
// SHARED DOMAIN TYPES — single source of truth for the entire platform.
// ----------------------------------------------------------------------------
// BACKEND DEV: These interfaces describe the EXACT data shape the dashboard
// expects from your REST API. Match your JSON responses to these contracts and
// the UI will work without changes. All monetary amounts are in KWD (the base
// accounting currency); display conversion happens at render time.
// ============================================================================

// ---------------------------------------------------------------------------
// Users & identity
// ---------------------------------------------------------------------------
export type UserRole = 'admin' | 'client' | 'freelancer' | 'company'
export type KycStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  /** KYC document review status. */
  kycStatus: KycStatus
  /** Admin-controlled gate that unlocks the wallet for withdrawals. */
  financiallyVerified: boolean
  createdAt: string
}

// ---------------------------------------------------------------------------
// Escrow & financial engine
// ---------------------------------------------------------------------------
// Lifecycle: held → (job completed) → cleared → withdrawn
//            held → (conflict) → disputed → released | refunded
export type EscrowStatus = 'held' | 'cleared' | 'withdrawn' | 'disputed' | 'refunded'

export interface EscrowTransaction {
  id: string
  project: string
  client: string
  freelancer: string
  /** Gross amount the client funded into escrow. */
  grossKwd: number
  /** Commission rate captured at funding time (e.g. 0.1 = 10%). */
  commissionRate: number
  status: EscrowStatus
  startDate: string
  deliveryDate: string
}

export interface BankDetails {
  iban: string
  bankName: string
  accountHolder: string
  verified: boolean
}

/** Aggregate wallet snapshot returned by the API. */
export interface WalletData {
  /** Sum of funds still locked in escrow (held + disputed). */
  pendingEscrowKwd: number
  /** Cleared funds available for withdrawal. */
  availableKwd: number
  /** Lifetime total already withdrawn. */
  totalWithdrawnKwd: number
  /** Active platform commission rate (e.g. 0.1 = 10%). */
  commissionRate: number
  /** Whether the admin has financially verified this user. */
  financiallyVerified: boolean
  bank: BankDetails
  ledger: EscrowTransaction[]
}

// ---------------------------------------------------------------------------
// Disputes & arbitration
// ---------------------------------------------------------------------------
export type DisputeStatus = 'open' | 'refunded' | 'released'
export type EvidenceAuthor = 'client' | 'freelancer' | 'admin'
export type DisputeOutcome = 'refund' | 'release'

export interface EvidenceMessage {
  id: string
  author: EvidenceAuthor
  name: string
  text: string
  time: string
  attachment?: string
}

export interface Dispute {
  id: string
  txnId: string
  project: string
  client: string
  freelancer: string
  amountKwd: number
  reason: string
  status: DisputeStatus
  openedAt: string
  evidence: EvidenceMessage[]
}

// ---------------------------------------------------------------------------
// Smart booking & calendar
// ---------------------------------------------------------------------------
export type BookingStatus = 'requested' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  client: string
  freelancer: string
  service: string
  status: BookingStatus
  /** ISO date the engagement starts. */
  startDate: string
  /** ISO date the engagement ends. */
  endDate: string
  amountKwd: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Content (Movies / portfolios) & workshops
// ---------------------------------------------------------------------------
export type ContentStatus = 'draft' | 'published' | 'archived'

export interface Content {
  id: string
  title: string
  type: 'movie' | 'portfolio' | 'short'
  status: ContentStatus
  posterUrl?: string
  /** Tagged cast & crew (user ids or display names). */
  credits: string[]
  releaseDate?: string
  views: number
}

export interface Workshop {
  id: string
  title: string
  instructor: string
  priceKwd: number
  seatsTotal: number
  seatsBooked: number
  startDate: string
  status: 'open' | 'full' | 'finished'
}

// ---------------------------------------------------------------------------
// Device pairing — "Watch via Code" (TV / external viewer linking)
// ---------------------------------------------------------------------------
export type DeviceKind = 'tv' | 'mobile' | 'desktop' | 'console'

export interface PairedDevice {
  id: string
  /** Human-friendly device label, e.g. "Samsung Smart TV". */
  name: string
  kind: DeviceKind
  /** Approximate location / network shown to the user. */
  location: string
  /** ISO timestamp of the last active session. */
  lastActive: string
  /** Whether a stream is currently playing on this device. */
  streaming: boolean
}

export interface PairingResult {
  success: boolean
  deviceId: string
  message: string
}

// ---------------------------------------------------------------------------
// Rich user profile (CRM "User Details" panel)
// ---------------------------------------------------------------------------
export type UserAccountStatus = 'active' | 'idle' | 'banned'

export interface UserSocialLink {
  platform: 'instagram' | 'linkedin' | 'x' | 'youtube' | 'website' | 'tiktok'
  handle: string
  url: string
}

export interface UserFinancial {
  iban: string
  bankName: string
  accountHolder: string
  verified: boolean
  availableKwd: number
  pendingEscrowKwd: number
  totalEarnedKwd: number
  /** Loyalty / reward points balance. */
  points: number
  /** Subscription tier label, e.g. "Free" | "VIP". */
  plan: string
  /** Human-friendly subscription expiry date (or "—" for free plans). */
  planExpiry: string
}

export interface UserPlatformStats {
  activeContracts: number
  completedProjects: number
  escrowHeldKwd: number
  vodTitles: number
  vodViews: number
  vodRevenueKwd: number
  avgRating: number
}

export interface MagicLinkEvent {
  time: string
  ip: string
  device: string
}

export interface UserSecurityStatus {
  twoFAEnabled: boolean
  twoFAMethod: string
  lastMagicLinkAt: string | null
  magicLinkHistory: MagicLinkEvent[]
  pairedDevices: { name: string; kind: DeviceKind; lastActive: string }[]
}

/**
 * Canonical account archetype. Drives the prominent role badge AND which
 * dynamic metadata fields the UI renders.
 */
export type UserRoleType = 'company' | 'student' | 'viewer' | 'freelancer' | 'crew' | 'vip' | 'admin'

// ---------------------------------------------------------------------------
// Trust system, portfolio & media gallery
// ---------------------------------------------------------------------------
export interface UserReview {
  id: string
  author: string
  authorInitials: string
  rating: number
  comment: string
  date: string
  project: string
}

export interface PortfolioItem {
  id: string
  type: 'video' | 'image'
  title: string
  /** Local thumbnail path under /public. */
  thumbnail: string
  /** Video runtime label, e.g. "2:14" (video items only). */
  duration?: string
  /** View count (video items only). */
  views?: number
}

export interface UserProfileDetail {
  id: number
  name: string
  email: string
  phone: string
  initials: string
  role: string
  /** Machine-readable archetype used for badges + metadata adaptation. */
  roleType: UserRoleType
  tier: string
  status: UserAccountStatus
  countryFlag: string
  country: string
  city: string
  joinedAt: string
  bio: string
  /** Dynamic capability tags, e.g. ["مخرج", "ممثل", "مهندس صوت"]. */
  specifications: string[]
  /** Access-control tags, e.g. ["Super Admin", "Staff"]. */
  permissions: string[]
  socials: UserSocialLink[]
  financial: UserFinancial
  stats: UserPlatformStats
  security: UserSecurityStatus
  /** Aggregate trust rating (0–5). */
  rating: number
  /** Total number of reviews behind the rating. */
  reviewCount: number
  /** Recent written reviews. */
  reviews: UserReview[]
  /** Showreel / media gallery items. */
  portfolio: PortfolioItem[]
  /**
   * Free-form, role-specific fields. ANY key/value the backend sends here is
   * rendered automatically as a neat labelled row — so new DB columns need no
   * front-end changes. Example (Company):
   *   { commercialRegister: "12345/2021", taxId: "KW-998", companyProfile: "..." }
   */
  metadata: Record<string, string | number>
}

// ---------------------------------------------------------------------------
// Availability calendar & bookings
// ---------------------------------------------------------------------------
export interface UserAvailability {
  userId: number
  /** Month being described, e.g. "2026-06". */
  month: string
  /** ISO dates (yyyy-mm-dd) that are already booked / unavailable. */
  bookedDates: string[]
  /** Default day rate used to pre-fill the booking request. */
  dayRateKwd: number
}

export interface UserBooking {
  id: string
  userId: number
  title: string
  /** Human-friendly date label. */
  date: string
  status: 'completed' | 'upcoming'
  role: string
  amountKwd: number
}

/** Buy-Now-Pay-Later providers supported at checkout. */
export type BnplProvider = 'tabby' | 'tamara'

export interface BookingRequest {
  userId: number
  /** ISO date being requested. */
  date: string
  note?: string
  amountKwd: number
  payment:
    | { method: 'wallet' }
    | { method: 'bnpl'; provider: BnplProvider; installments: number }
}

export interface BookingResult {
  success: boolean
  bookingId: string
  status: 'upcoming'
  message: string
}

/** Result of a (mock) profile PDF generation/download. */
export interface ProfileDownloadResult {
  success: boolean
  fileName: string
  url: string
  watermarked: boolean
  /** Amount charged from the wallet (0 for the free tier). */
  chargedKwd: number
  /** Remaining wallet balance after a paid export (undefined for free tier). */
  walletBalanceKwd?: number
  message: string
}

// ---------------------------------------------------------------------------
// Generic API envelope
// ---------------------------------------------------------------------------
export interface ApiResult<T> {
  success: boolean
  data: T
  message?: string
}

// ===========================================================================
// ASSETS MARKETPLACE — rental, buy/sell & logistics (360° production)
// ===========================================================================

/**
 * Canonical asset archetype. Drives the type badge AND which dynamic metadata
 * fields + transaction options the Asset Details panel renders.
 */
export type AssetType =
  | 'studio' // استديو
  | 'location' // موقع تصوير
  | 'equipment' // معدات
  | 'theater' // مسرح
  | 'arena' // صالة عرض ضخمة
  | 'vehicle' // كرفان / سيارة تصوير
  | 'prop' // إكسسوارات
  | 'wardrobe' // أزياء
  | 'postproduction' // غرفة مونتاج وتلوين
  | 'catering' // إعاشة وبوفيهات
  | 'permit' // تصاريح وتأمين

/** Whether an asset can be rented, purchased, or both. */
export type TransactionType = 'rent' | 'buy'

/** Physical condition (for buyable goods). */
export type AssetCondition = 'new' | 'used'

export interface Asset {
  id: string
  name: string
  type: AssetType
  /** Short Arabic description shown in the details panel. */
  description: string
  /** Provider / owner display name. */
  provider: string
  /** Cover + gallery thumbnails (local /public paths). */
  images: string[]
  // — Geographic availability —
  country: string
  city: string
  /** Extra countries the asset can serve, e.g. ["الكويت", "السعودية"]. */
  availableIn: string[]
  // — Pricing & transactions —
  transactionTypes: TransactionType[]
  /** Daily rental rate (KWD). Present when 'rent' is supported. */
  dayRateKwd?: number
  /** Full-ownership purchase price (KWD). Present when 'buy' is supported. */
  purchaseKwd?: number
  /** Condition badge — relevant for buyable props/wardrobe/equipment. */
  condition?: AssetCondition
  // — Logistics —
  /** Equipment / props / wardrobe can be shipped; venues cannot. */
  isShippable?: boolean
  /** Flat delivery fee (KWD) when shipped/bought. */
  deliveryFeeKwd?: number
  // — Type-specific metadata —
  /** Seating capacity (theaters, arenas, screening halls). */
  capacity?: number
  /** Parking availability (venues). */
  hasParking?: boolean
  /** Driver included (vehicles / basecamps). */
  hasDriver?: boolean
  /** Number of meals offered (catering services). */
  mealCount?: number
  /** Trust rating (0–5). */
  rating: number
  reviewCount: number
  /**
   * Free-form extra fields rendered automatically as labelled rows — so new
   * backend columns need no front-end changes.
   */
  metadata: Record<string, string | number>
}

export interface AssetAvailability {
  assetId: string
  /** "yyyy-mm" being described. */
  month: string
  /** ISO dates already booked / unavailable. */
  bookedDates: string[]
}

/** Rental booking request for an asset. */
export interface AssetBookingRequest {
  assetId: string
  /** ISO date being requested. */
  date: string
  /** Number of rental days. */
  days: number
  /** True when the renter wants it shipped (equipment/props). */
  shipping: boolean
  amountKwd: number
}

export interface AssetBookingResult {
  success: boolean
  bookingId: string
  status: 'confirmed'
  message: string
}

// — E-commerce: buy / sell with delivery logistics —
export interface DeliveryAddress {
  fullName: string
  phone: string
  country: string
  city: string
  line: string
}

export interface OrderRequest {
  assetId: string
  transactionType: 'buy'
  quantity: number
  address: DeliveryAddress
  itemKwd: number
  deliveryFeeKwd: number
  totalKwd: number
}

export type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'

export interface OrderTracking {
  orderId: string
  status: OrderStatus
  /** Ordered timeline of status checkpoints. */
  steps: { status: OrderStatus; label: string; date: string; done: boolean }[]
  carrier: string
  trackingNumber: string
  etaLabel: string
}

export interface OrderResult {
  success: boolean
  orderId: string
  status: OrderStatus
  totalKwd: number
  message: string
}

// ===========================================================================
// PRODUCTION MANAGER SUITE (ERP) — budget, call sheets, script vault, services
// ===========================================================================

export interface ProductionBudget {
  projectName: string
  allocatedKwd: number
  spentKwd: number
  remainingKwd: number
  /** Spend broken down by category for the bar/segments. */
  breakdown: { label: string; amountKwd: number }[]
}

export interface CallSheetRow {
  name: string
  role: string
  callTime: string
  location: string
  scenes: string
}

export interface CallSheetRequest {
  date: string
  location: string
  generalCallTime: string
  crewIds: number[]
}

export interface CallSheet {
  id: string
  date: string
  location: string
  generalCallTime: string
  rows: CallSheetRow[]
}

export interface ScriptDocument {
  id: string
  title: string
  uploadedAt: string
  /** Recipient the copy is watermarked for. */
  watermarkedFor: string
  sizeLabel: string
  drmEnabled: boolean
}

export interface ScriptUploadResult {
  success: boolean
  document: ScriptDocument
  message: string
}

export interface CateringBookingRequest {
  date: string
  meals: number
  dietaryOptions: string[]
  location: string
}

export interface PermitApplicationRequest {
  permitType: string
  locationType: string
  startDate: string
  endDate: string
  withInsurance: boolean
}

export interface ServiceBookingResult {
  success: boolean
  referenceId: string
  estimatedKwd: number
  message: string
}

// ===========================================================================
// LEADERBOARD — Top 10 rankings (freelancers, assets, projects)
// ===========================================================================
export type LeaderboardCategory = 'freelancers' | 'assets' | 'projects'

export interface LeaderboardEntry {
  rank: number
  /** Movement vs. last period: positive = up, negative = down, 0 = steady. */
  trend: number
  name: string
  /** Secondary line, e.g. role / asset type / production house. */
  subtitle: string
  /** Headline metric value already formatted for display. */
  metricLabel: string
  /** Raw score used for the relative bar (0–100). */
  score: number
  avatar?: string
  /** Verified badge for trusted top performers. */
  verified?: boolean
}

// ===========================================================================
// VOD — Netflix-style catalog, producer pricing, viewer access & watch party
// ===========================================================================
export type VodAccessTier = 'free' | 'rent' | 'buy' | 'subscription'

export interface VodTitle {
  id: string
  title: string
  genre: string
  year: number
  /** Total minutes of runtime. */
  durationMin: number
  poster: string
  /** Editorial synopsis. */
  synopsis: string
  /** Producer / studio that owns the title. */
  producer: string
  rating: number
  /** Position in the platform Top 10 (1–10) when applicable. */
  top10Rank?: number
  /** How many access tiers the producer enabled. */
  accessTiers: VodAccessTier[]
  /** Per-tier producer prices (KWD); subscription is platform-wide. */
  rentKwd?: number
  buyKwd?: number
  /** True when offline download (with DRM) is permitted. */
  offlineEnabled: boolean
  /** Maturity rating label. */
  maturity: string
  views: number
}

export interface VodCheckoutRequest {
  titleId: string
  tier: Exclude<VodAccessTier, 'free'>
  amountKwd: number
  offline: boolean
}

export interface VodCheckoutResult {
  success: boolean
  entitlementId: string
  tier: VodAccessTier
  expiresAt: string | null
  message: string
}

export interface WatchPartyRequest {
  titleId: string
  scheduledAt: string
  invitees: string[]
  /** Allow guests to chat during playback. */
  chatEnabled: boolean
}

export interface WatchPartyResult {
  success: boolean
  partyId: string
  joinUrl: string
  hostToken: string
  message: string
}
