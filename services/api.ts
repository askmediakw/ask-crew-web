// ============================================================================
// CENTRALIZED API LAYER (MOCK) — the single integration surface.
// ----------------------------------------------------------------------------
// BACKEND DEV: This is the ONLY file you need to touch. Every screen in the
// dashboard calls these async functions — never hardcoded data. Each function
// currently simulates ~1s of network latency and returns typed mock data.
// To go live: replace each mock return with your real Axios/Fetch call. The
// function signatures and return types (from `@/types`) must stay the same so
// the UI keeps working untouched.
//
// Example swap:
//   export async function fetchWalletData(): Promise<WalletData> {
//     const { data } = await axios.get('/api/wallet')
//     return data
//   }
// ============================================================================

import type {
  WalletData,
  EscrowTransaction,
  BankDetails,
  Dispute,
  EvidenceMessage,
  DisputeOutcome,
  PairedDevice,
  PairingResult,
  UserProfileDetail,
  ProfileDownloadResult,
  UserReview,
  PortfolioItem,
  UserAvailability,
  UserBooking,
  BookingRequest,
  BookingResult,
  Asset,
  AssetAvailability,
  AssetBookingRequest,
  AssetBookingResult,
  OrderRequest,
  OrderResult,
  OrderTracking,
  ProductionBudget,
  CallSheetRequest,
  CallSheet,
  CallSheetRow,
  ScriptUploadResult,
  ScriptDocument,
  CateringBookingRequest,
  PermitApplicationRequest,
  ServiceBookingResult,
  LeaderboardCategory,
  LeaderboardEntry,
  VodTitle,
  VodCheckoutRequest,
  VodCheckoutResult,
  WatchPartyRequest,
  WatchPartyResult,
} from '@/types'

// ---------------------------------------------------------------------------
// Network simulation helpers
// ---------------------------------------------------------------------------
const NETWORK_DELAY = 1000

function delay(ms = NETWORK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Deep clone so callers can't mutate the in-module mock "database". */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

// ---------------------------------------------------------------------------
// In-memory mock "database" (BACKEND DEV: this is replaced by your DB).
// ---------------------------------------------------------------------------
const COMMISSION_RATE = 0.1

const mockLedger: EscrowTransaction[] = [
  { id: 'ESC-4012', project: 'إخراج فيلم وثائقي "البحر"', client: 'سينما آرت الكويت', freelancer: 'بدر العتيبي', grossKwd: 3200, commissionRate: COMMISSION_RATE, status: 'held', startDate: '2026-06-10', deliveryDate: '2026-07-02' },
  { id: 'ESC-4015', project: 'مونتاج حملة إعلانية', client: 'فوكس ميديا', freelancer: 'منى الصباح', grossKwd: 1850, commissionRate: COMMISSION_RATE, status: 'held', startDate: '2026-06-14', deliveryDate: '2026-06-28' },
  { id: 'ESC-4018', project: 'تصوير فوتوغرافي لمنتجات', client: 'متجر لمسة', freelancer: 'يوسف القلاف', grossKwd: 940, commissionRate: COMMISSION_RATE, status: 'held', startDate: '2026-06-18', deliveryDate: '2026-06-30' },
  { id: 'ESC-4020', project: 'تصميم صوتي لمسلسل', client: 'استوديو نون', freelancer: 'دانة المطيري', grossKwd: 2100, commissionRate: COMMISSION_RATE, status: 'disputed', startDate: '2026-06-05', deliveryDate: '2026-06-22' },
  { id: 'ESC-3990', project: 'كتابة سيناريو قصير', client: 'مخرج مستقل', freelancer: 'منى الصباح', grossKwd: 1200, commissionRate: COMMISSION_RATE, status: 'cleared', startDate: '2026-05-20', deliveryDate: '2026-06-08' },
  { id: 'ESC-3975', project: 'جلسة تصوير زفاف', client: 'عائلة الرشيد', freelancer: 'بدر العتيبي', grossKwd: 1500, commissionRate: COMMISSION_RATE, status: 'withdrawn', startDate: '2026-05-02', deliveryDate: '2026-05-12' },
]

let mockWallet: WalletData = {
  pendingEscrowKwd: 0, // derived below before each return
  availableKwd: 2310,
  totalWithdrawnKwd: 18650,
  commissionRate: COMMISSION_RATE,
  financiallyVerified: true,
  bank: { iban: '', bankName: '', accountHolder: '', verified: false },
  ledger: mockLedger,
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-209',
    txnId: 'ESC-4020',
    project: 'تصميم صوتي لمسلسل',
    client: 'استوديو نون',
    freelancer: 'دانة المطيري',
    amountKwd: 2100,
    reason: 'العميل يرى أن جودة المكساج لا تطابق المتفق عليه، والمستقلة تؤكد تسليم كامل المتطلبات.',
    status: 'open',
    openedAt: '2026-06-21',
    evidence: [
      { id: 'EV-1', author: 'client', name: 'استوديو نون', text: 'الملفات المسلّمة فيها تشويش في 3 مشاهد رئيسية.', time: '10:24' },
      { id: 'EV-2', author: 'freelancer', name: 'دانة المطيري', text: 'أرفقت النسخة النهائية المعتمدة + سجل المراجعات الموقّع.', time: '11:05', attachment: 'final_mix_v4.wav' },
    ],
  },
]

/** Recompute pending escrow from the live ledger. */
function recomputePending() {
  mockWallet.pendingEscrowKwd = mockWallet.ledger
    .filter((t) => t.status === 'held' || t.status === 'disputed')
    .reduce((sum, t) => sum + t.grossKwd, 0)
}

// ===========================================================================
// WALLET & ESCROW
// ===========================================================================

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function fetchWalletData(): Promise<WalletData> {
  await delay()
  recomputePending()
  return clone(mockWallet)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function saveBankDetails(
  details: Omit<BankDetails, 'verified'>,
): Promise<BankDetails> {
  await delay()
  // Simulate the backend validating + verifying the bank account.
  mockWallet.bank = { ...details, verified: true }
  return clone(mockWallet.bank)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function requestWithdrawal(iban: string): Promise<WalletData> {
  await delay()
  if (!iban) throw new Error('رقم الآيبان (IBAN) مطلوب لإتمام السحب.')
  if (!mockWallet.financiallyVerified) throw new Error('المحفظة غير مُفعّلة مالياً.')
  if (!mockWallet.bank.verified) throw new Error('يجب توثيق الحساب البنكي أولاً.')
  if (mockWallet.availableKwd <= 0) throw new Error('لا يوجد رصيد متاح للسحب.')

  const amount = mockWallet.availableKwd
  mockWallet.availableKwd = 0
  mockWallet.totalWithdrawnKwd += amount
  recomputePending()
  return clone(mockWallet)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
// Marks a project complete: deducts commission and moves NET into Available.
export async function releaseProjectFunds(txnId: string): Promise<WalletData> {
  await delay()
  const txn = mockWallet.ledger.find((t) => t.id === txnId)
  if (!txn) throw new Error('لم يتم العثور على معاملة الضمان.')
  if (txn.status !== 'held' && txn.status !== 'disputed') {
    throw new Error('لا يمكن الإفراج عن هذه المعاملة في حالتها الحالية.')
  }
  const net = txn.grossKwd * (1 - txn.commissionRate)
  txn.status = 'cleared'
  mockWallet.availableKwd += net
  recomputePending()
  return clone(mockWallet)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function updateCommissionRate(rate: number): Promise<WalletData> {
  await delay()
  if (rate < 0 || rate > 1) throw new Error('نسبة العمولة يجب أن تكون بين 0% و 100%.')
  mockWallet.commissionRate = rate
  return clone(mockWallet)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function setFinancialVerification(value: boolean): Promise<WalletData> {
  await delay(500)
  mockWallet.financiallyVerified = value
  return clone(mockWallet)
}

// ===========================================================================
// DISPUTES & ARBITRATION
// ===========================================================================

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function fetchDisputes(): Promise<Dispute[]> {
  await delay()
  return clone(mockDisputes)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function openDispute(txnId: string, reason: string): Promise<Dispute> {
  await delay()
  const txn = mockWallet.ledger.find((t) => t.id === txnId)
  if (!txn) throw new Error('لم يتم العثور على معاملة الضمان.')
  txn.status = 'disputed'
  const dispute: Dispute = {
    id: `DSP-${Math.floor(100 + Math.random() * 900)}`,
    txnId,
    project: txn.project,
    client: txn.client,
    freelancer: txn.freelancer,
    amountKwd: txn.grossKwd,
    reason,
    status: 'open',
    openedAt: new Date().toISOString().slice(0, 10),
    evidence: [],
  }
  mockDisputes.unshift(dispute)
  return clone(dispute)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function addDisputeEvidence(
  disputeId: string,
  message: Omit<EvidenceMessage, 'id' | 'time'>,
): Promise<EvidenceMessage> {
  await delay(500)
  const dispute = mockDisputes.find((d) => d.id === disputeId)
  if (!dispute) throw new Error('لم يتم العثور على النزاع.')
  const entry: EvidenceMessage = {
    ...message,
    id: `EV-${Date.now()}`,
    time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
  }
  dispute.evidence.push(entry)
  return clone(entry)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
// Binding admin arbitration: 'release' pays the freelancer (net of commission),
// 'refund' returns the full amount to the client.
export async function resolveDispute(
  disputeId: string,
  outcome: DisputeOutcome,
): Promise<{ dispute: Dispute; wallet: WalletData }> {
  await delay()
  const dispute = mockDisputes.find((d) => d.id === disputeId)
  if (!dispute) throw new Error('لم يتم العثور على النزاع.')
  if (dispute.status !== 'open') throw new Error('تم إغلاق هذا النزاع مسبقاً.')

  if (outcome === 'release') {
    const txn = mockWallet.ledger.find((t) => t.id === dispute.txnId)
    if (txn && (txn.status === 'held' || txn.status === 'disputed')) {
      txn.status = 'cleared'
      mockWallet.availableKwd += txn.grossKwd * (1 - txn.commissionRate)
    }
    dispute.status = 'released'
  } else {
    const txn = mockWallet.ledger.find((t) => t.id === dispute.txnId)
    if (txn) txn.status = 'refunded'
    dispute.status = 'refunded'
  }
  recomputePending()
  return { dispute: clone(dispute), wallet: clone(mockWallet) }
}

// ===========================================================================
// DEVICE PAIRING — "Watch via Code" (TV / external viewer linking)
// ===========================================================================

const mockPairedDevices: PairedDevice[] = [
  { id: 'DEV-TV-01', name: 'Samsung Smart TV', kind: 'tv', location: 'الصالة — الكويت', lastActive: '2026-06-23T19:40:00Z', streaming: true },
  { id: 'DEV-TV-02', name: 'Apple TV 4K', kind: 'tv', location: 'غرفة المكتب — الكويت', lastActive: '2026-06-22T21:12:00Z', streaming: false },
  { id: 'DEV-CN-01', name: 'PlayStation 5', kind: 'console', location: 'غرفة الألعاب — الكويت', lastActive: '2026-06-20T15:05:00Z', streaming: false },
]

// BACKEND DEV: REPLACE WITH YOUR WEBSOCKET/POLLING AUTH ENDPOINT TO LINK TV SESSION
export async function pairViewerDevice(pairingCode: string): Promise<PairingResult> {
  await delay(1500)
  const normalized = pairingCode.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  if (normalized.length < 6 || normalized.length > 8) {
    throw new Error('رمز الربط يجب أن يتكون من 6 إلى 8 أحرف وأرقام.')
  }
  const device: PairedDevice = {
    id: `DEV-${normalized.slice(0, 4)}`,
    name: 'جهاز مشاهدة جديد',
    kind: 'tv',
    location: 'تم الربط للتو',
    lastActive: new Date().toISOString(),
    streaming: true,
  }
  mockPairedDevices.unshift(device)
  return {
    success: true,
    deviceId: device.id,
    message: 'Device successfully linked. Your content will start playing on your TV shortly.',
  }
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function fetchPairedDevices(): Promise<PairedDevice[]> {
  await delay(700)
  return clone(mockPairedDevices)
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function unlinkDevice(deviceId: string): Promise<PairedDevice[]> {
  await delay(900)
  const idx = mockPairedDevices.findIndex((d) => d.id === deviceId)
  if (idx === -1) throw new Error('لم يتم العثور على الجهاز.')
  mockPairedDevices.splice(idx, 1)
  return clone(mockPairedDevices)
}

// ===========================================================================
// USER PROFILE — rich CRM details panel + profile export (PDF)
// ===========================================================================

// Trust, portfolio & availability are attached deterministically in
// `fetchUserDetails`, so the base records below stay lean.
type BaseUserProfile = Omit<UserProfileDetail, 'rating' | 'reviewCount' | 'reviews' | 'portfolio'>

const mockUserDetails: Record<number, BaseUserProfile> = {
  1: {
    id: 1,
    name: 'منى الصباح',
    email: 'mona@royal.tv',
    phone: '+965 9001 2233',
    initials: 'م',
    role: 'منتجة تنفيذية',
    roleType: 'crew',
    tier: 'VIP',
    status: 'active',
    countryFlag: '🇪🇬',
    country: 'مصر',
    city: 'مقيمة في الكويت',
    joinedAt: '12 يناير 2024',
    bio: 'منتجة تنفيذية بخبرة 12 عاماً في الدراما الخليجية والإعلانات التجارية، قادت أكثر من 40 إنتاجاً ضخماً.',
    specifications: ['منتجة', 'مخرجة', 'مهندسة صوت', 'كاتبة سيناريو'],
    permissions: ['مدير عام', 'فريق العمل', 'موافقة العقود'],
    socials: [
      { platform: 'instagram', handle: '@mona.production', url: 'https://instagram.com/mona.production' },
      { platform: 'linkedin', handle: 'mona-alsabah', url: 'https://linkedin.com/in/mona-alsabah' },
      { platform: 'website', handle: 'royal.tv', url: 'https://royal.tv' },
    ],
    financial: {
      iban: 'KW81 CBKU 0000 0000 0000 1234 5601 01',
      bankName: 'بنك الكويت الوطني',
      accountHolder: 'منى عبدالله الصباح',
      verified: true,
      availableKwd: 4820,
      pendingEscrowKwd: 1850,
      totalEarnedKwd: 47600,
      points: 8450,
      plan: 'VIP',
      planExpiry: '31 ديسمبر 2026',
    },
    stats: {
      activeContracts: 3,
      completedProjects: 41,
      escrowHeldKwd: 1850,
      vodTitles: 8,
      vodViews: 128400,
      vodRevenueKwd: 9240,
      avgRating: 4.9,
    },
    security: {
      twoFAEnabled: true,
      twoFAMethod: 'تطبيق المصادقة (TOTP)',
      lastMagicLinkAt: '23 يونيو 2026، 09:14 ص',
      magicLinkHistory: [
        { time: '23 يونيو 2026، 09:14 ص', ip: '37.36.x.x', device: 'iPhone 15 Pro — Safari' },
        { time: '19 يونيو 2026، 08:02 م', ip: '37.36.x.x', device: 'MacBook Pro — Chrome' },
      ],
      pairedDevices: [
        { name: 'Samsung Smart TV', kind: 'tv', lastActive: 'متصل الآن' },
        { name: 'iPad Pro', kind: 'mobile', lastActive: 'قبل ساعتين' },
      ],
    },
    metadata: {
      equipment: 'كاميرا RED Komodo 6K، عدسات سينمائية Sigma، طائرة DJI Inspire 3',
      unionId: 'PROD-EG-2014-0098',
      availability: 'متاحة — تبدأ المشاريع خلال 7 أيام',
      dayRate: '450 د.ك / يوم',
    },
  },
  3: {
    id: 3,
    name: 'لمياء فهد',
    email: 'lamya@foxmedia.com',
    phone: '+971 50 778 1199',
    initials: 'ل',
    role: 'مخرجة فنية',
    roleType: 'freelancer',
    tier: 'Pro',
    status: 'active',
    countryFlag: '🇱🇧',
    country: 'لبنان',
    city: 'مقيمة في الإمارات',
    joinedAt: '3 مارس 2024',
    bio: 'مخرجة فنية متخصصة في الهوية البصرية السينمائ��ة والفيديوهات الموسيقية، بأسلوب بصري جريء.',
    specifications: ['مخرجة فنية', 'مديرة تصوير', 'مونتيرة'],
    permissions: ['مستقلة معتمدة'],
    socials: [
      { platform: 'instagram', handle: '@lamya.art', url: 'https://instagram.com/lamya.art' },
      { platform: 'youtube', handle: 'LamyaFahad', url: 'https://youtube.com/@LamyaFahad' },
      { platform: 'x', handle: '@lamya_fahad', url: 'https://x.com/lamya_fahad' },
    ],
    financial: {
      iban: 'AE07 0331 2345 6789 0123 456',
      bankName: 'بنك الإمارات دبي الوطني',
      accountHolder: 'لمياء فهد',
      verified: true,
      availableKwd: 2110,
      pendingEscrowKwd: 0,
      totalEarnedKwd: 23800,
      points: 3120,
      plan: 'Pro',
      planExpiry: '14 أغسطس 2026',
    },
    stats: {
      activeContracts: 2,
      completedProjects: 27,
      escrowHeldKwd: 0,
      vodTitles: 5,
      vodViews: 64200,
      vodRevenueKwd: 4180,
      avgRating: 4.7,
    },
    security: {
      twoFAEnabled: true,
      twoFAMethod: 'تطبيق المصادقة (TOTP)',
      lastMagicLinkAt: '22 يونيو 2026، 06:41 م',
      magicLinkHistory: [
        { time: '22 يونيو 2026، 06:41 م', ip: '94.207.x.x', device: 'Galaxy S24 — Chrome' },
      ],
      pairedDevices: [{ name: 'Apple TV 4K', kind: 'tv', lastActive: 'أمس' }],
    },
    metadata: {
      equipment: 'حقيبة عدسات Zeiss، إضاءة Aputure، كاميرا Sony FX6',
      unionId: 'DIR-LB-2019-0451',
      availability: 'متاحة بدوام جزئي — عطلات نهاية الأسبوع',
    },
  },
  2: {
    id: 2,
    name: 'يوسف الحمد',
    email: 'yousef@cinemaart.kw',
    phone: '+965 6677 8899',
    initials: 'ي',
    role: 'طالب إعلام',
    roleType: 'student',
    tier: 'Beginner',
    status: 'idle',
    countryFlag: '🇰🇼',
    country: 'الكويت',
    city: 'مقيم في الكويت',
    joinedAt: '20 سبتمبر 2025',
    bio: 'طالب في كلية الإعلام، شغوف بصناعة الأفلام القصيرة والمونتاج.',
    specifications: ['مونتاج', 'تصوير فوتوغرافي'],
    permissions: ['عضو طالب'],
    socials: [{ platform: 'instagram', handle: '@yousef.films', url: 'https://instagram.com/yousef.films' }],
    financial: {
      iban: 'غير مُسجّل بعد',
      bankName: '—',
      accountHolder: '—',
      verified: false,
      availableKwd: 0,
      pendingEscrowKwd: 0,
      totalEarnedKwd: 0,
      points: 320,
      plan: 'Free',
      planExpiry: '—',
    },
    stats: {
      activeContracts: 0,
      completedProjects: 1,
      escrowHeldKwd: 0,
      vodTitles: 0,
      vodViews: 0,
      vodRevenueKwd: 0,
      avgRating: 4.2,
    },
    security: {
      twoFAEnabled: false,
      twoFAMethod: 'غير مُفعّلة',
      lastMagicLinkAt: '21 يونيو 2026، 02:11 م',
      magicLinkHistory: [{ time: '21 يونيو 2026، 02:11 م', ip: '37.36.x.x', device: 'Redmi Note 13 — Chrome' }],
      pairedDevices: [],
    },
    metadata: {
      university: 'جامعة الكويت — كلية الإعلام',
      major: 'إنتاج تلفزيوني وسينمائي',
      graduationYear: 2027,
      studentId: 'KU-2023-114502',
    },
  },
  4: {
    id: 4,
    name: 'بدر العتيبي',
    email: 'bader@nukhba.studio',
    phone: '+965 5544 3322',
    initials: 'ب',
    role: 'مشاهد',
    roleType: 'viewer',
    tier: 'Beginner',
    status: 'banned',
    countryFlag: '🇰🇼',
    country: 'الكويت',
    city: 'مقيم في الكويت',
    joinedAt: '8 فبراير 2025',
    bio: 'حساب مشاهدة محظور بسبب مخالفة شروط مشاركة المحتوى.',
    specifications: [],
    permissions: ['محظور'],
    socials: [],
    financial: {
      iban: 'غير مُسجّل بعد',
      bankName: '—',
      accountHolder: '—',
      verified: false,
      availableKwd: 0,
      pendingEscrowKwd: 0,
      totalEarnedKwd: 0,
      points: 90,
      plan: 'Free',
      planExpiry: '—',
    },
    stats: {
      activeContracts: 0,
      completedProjects: 0,
      escrowHeldKwd: 0,
      vodTitles: 0,
      vodViews: 0,
      vodRevenueKwd: 0,
      avgRating: 0,
    },
    security: {
      twoFAEnabled: false,
      twoFAMethod: 'غير مُفعّلة',
      lastMagicLinkAt: null,
      magicLinkHistory: [],
      pairedDevices: [],
    },
    metadata: {
      watchTime: '142 ساعة',
      subscriptionHistory: 'اشتراك شهري (مُلغى)',
      favoriteGenres: 'دراما، أكشن، وثائقي',
      lastWatched: 'مسلسل الخليج — الحلقة 12',
    },
  },
  5: {
    id: 5,
    name: 'دانة الرشيد',
    email: 'dana@gulf-media.tv',
    phone: '+965 9988 1122',
    initials: 'د',
    role: 'شركة إنتاج',
    roleType: 'company',
    tier: 'VIP',
    status: 'active',
    countryFlag: '🇰🇼',
    country: 'الكويت',
    city: 'مقرها في الكويت',
    joinedAt: '5 يونيو 2023',
    bio: 'شركة إنتاج إعلامي رائدة متخصصة في الإنتاج الدرامي والإعلانات التجارية الكبرى.',
    specifications: ['إنتاج درامي', 'إعلانات تجارية', 'بث مباشر'],
    permissions: ['حساب شركة', 'إدارة الفريق', 'فوترة'],
    socials: [
      { platform: 'website', handle: 'gulf-media.tv', url: 'https://gulf-media.tv' },
      { platform: 'linkedin', handle: 'gulf-media', url: 'https://linkedin.com/company/gulf-media' },
    ],
    financial: {
      iban: 'KW02 NBOK 0000 0000 0000 9988 1122 05',
      bankName: 'بنك بوبيان',
      accountHolder: 'شركة الخليج للإنتاج الإعلامي',
      verified: true,
      availableKwd: 28400,
      pendingEscrowKwd: 12600,
      totalEarnedKwd: 318000,
      points: 41200,
      plan: 'VIP',
      planExpiry: '5 يونيو 2027',
    },
    stats: {
      activeContracts: 11,
      completedProjects: 96,
      escrowHeldKwd: 12600,
      vodTitles: 34,
      vodViews: 1284000,
      vodRevenueKwd: 86400,
      avgRating: 4.8,
    },
    security: {
      twoFAEnabled: true,
      twoFAMethod: 'تطبيق المصادقة (TOTP)',
      lastMagicLinkAt: '23 يونيو 2026، 11:02 ص',
      magicLinkHistory: [{ time: '23 يونيو 2026، 11:02 ص', ip: '37.36.x.x', device: 'iMac — Safari' }],
      pairedDevices: [{ name: 'LG OLED Signage', kind: 'tv', lastActive: 'متصل الآن' }],
    },
    metadata: {
      commercialRegister: '123456/2021',
      taxId: 'KW-TAX-998877',
      companyProfile: 'أكثر من 15 عاماً في الإنتاج الإعلامي الخليجي',
      employees: 64,
      hqAddress: 'برج التجارية، الدور 18، مدينة الكويت',
    },
  },
  6: {
    id: 6,
    name: 'طلال المنصور',
    email: 'talal@royal.tv',
    phone: '+966 50 112 3344',
    initials: 'ط',
    role: 'شركة موزّعة',
    roleType: 'company',
    tier: 'Corporate',
    status: 'idle',
    countryFlag: '🇸🇦',
    country: 'السعودية',
    city: 'مقرها في الرياض',
    joinedAt: '17 أبريل 2024',
    bio: 'شركة توزيع محتوى رقمي تغطي منطقة الخليج وشمال إفريقيا.',
    specifications: ['توزيع رقمي', 'ترخيص محتوى'],
    permissions: ['حساب شركة', 'فوترة'],
    socials: [{ platform: 'website', handle: 'royal.tv', url: 'https://royal.tv' }],
    financial: {
      iban: 'SA03 8000 0000 6080 1016 7519',
      bankName: 'البنك الأهلي السعودي',
      accountHolder: 'شركة رويال للتوزيع',
      verified: true,
      availableKwd: 9200,
      pendingEscrowKwd: 4100,
      totalEarnedKwd: 142500,
      points: 15800,
      plan: 'Corporate',
      planExpiry: '17 أبريل 2027',
    },
    stats: {
      activeContracts: 6,
      completedProjects: 38,
      escrowHeldKwd: 4100,
      vodTitles: 52,
      vodViews: 642000,
      vodRevenueKwd: 38900,
      avgRating: 4.6,
    },
    security: {
      twoFAEnabled: true,
      twoFAMethod: 'رسالة نصية (SMS)',
      lastMagicLinkAt: '20 يونيو 2026، 09:30 ص',
      magicLinkHistory: [{ time: '20 يونيو 2026، 09:30 ص', ip: '188.55.x.x', device: 'Galaxy Tab S9 — Chrome' }],
      pairedDevices: [{ name: 'Samsung The Frame', kind: 'tv', lastActive: 'أمس' }],
    },
    metadata: {
      commercialRegister: '4030298877',
      taxId: 'SA-VAT-300112233',
      companyProfile: 'موزّع محتوى معتمد في 6 دول',
      employees: 28,
    },
  },
}

/** Build a sensible fallback profile for users without a hand-authored record. */
function buildDefaultUserDetail(userId: number): BaseUserProfile {
  return {
    id: userId,
    name: 'عضو ��ي المنصة',
    email: `user${userId}@askcrew.com`,
    phone: '+965 9000 0000',
    initials: 'ع',
    role: 'عضو في المنصة',
    roleType: 'viewer',
    tier: 'Beginner',
    status: 'idle',
    countryFlag: '🇰🇼',
    country: 'الكويت',
    city: 'مقيم في الكويت',
    joinedAt: 'حديثاً',
    bio: 'لا يوجد وصف تعريفي بعد.',
    specifications: [],
    permissions: ['عضو'],
    socials: [],
    financial: {
      iban: 'غير مُسجّل بعد',
      bankName: '—',
      accountHolder: '—',
      verified: false,
      availableKwd: 0,
      pendingEscrowKwd: 0,
      totalEarnedKwd: 0,
      points: 0,
      plan: 'Free',
      planExpiry: '—',
    },
    stats: {
      activeContracts: 0,
      completedProjects: 0,
      escrowHeldKwd: 0,
      vodTitles: 0,
      vodViews: 0,
      vodRevenueKwd: 0,
      avgRating: 0,
    },
    security: {
      twoFAEnabled: false,
      twoFAMethod: 'غير مُفعّلة',
      lastMagicLinkAt: null,
      magicLinkHistory: [],
      pairedDevices: [],
    },
    metadata: {},
  }
}

// ---------------------------------------------------------------------------
// Trust, reviews & portfolio — attached deterministically per user.
// ---------------------------------------------------------------------------
const PORTFOLIO_POOL: PortfolioItem[] = [
  { id: 'pf-set', type: 'video', title: 'كواليس إنتاج درامي', thumbnail: '/portfolio/showreel-set.png', duration: '2:14', views: 48200 },
  { id: 'pf-music', type: 'video', title: 'فيديو كليب — إضاءة نيون', thumbnail: '/portfolio/music-video.png', duration: '3:41', views: 132400 },
  { id: 'pf-commercial', type: 'video', title: 'إعلان تجاري فاخر', thumbnail: '/portfolio/commercial.png', duration: '0:48', views: 21800 },
  { id: 'pf-headshot', type: 'image', title: 'جلسة تصوير احترافية', thumbnail: '/portfolio/headshot.png' },
  { id: 'pf-poster', type: 'image', title: 'بوستر فيلم رسمي', thumbnail: '/portfolio/commercial.png' },
]

const REVIEW_POOL: Omit<UserReview, 'id'>[] = [
  { author: 'استوديو الخليج', authorInitials: 'خ', rating: 5, comment: 'احترافية عالية والتزام كامل بالمواعيد. تجربة ممتازة من البداية للنهاية.', date: '14 يونيو 2026', project: 'مسلسل "ليالي"' },
  { author: 'شركة نخبة الإعلام', authorInitials: 'ن', rating: 5, comment: 'إبداع بصري لافت وجودة إنتاج تفوق ال��وقعات. سنتعاون مجدداً بالتأكيد.', date: '2 مايو 2026', project: 'حملة إعلانية' },
  { author: 'مهرجان الكويت السينمائي', authorInitials: 'م', rating: 4, comment: 'عمل متقن وروح تعاونية رائعة مع الفريق.', date: '18 مارس 2026', project: 'فيلم قصير' },
]

/** Attach trust + portfolio to a base record (deterministic per user). */
function enrichProfile(base: BaseUserProfile): UserProfileDetail {
  const rating = base.stats.avgRating || 0
  // Derive a believable review count from completed projects.
  const reviewCount = Math.max(base.stats.completedProjects, rating > 0 ? 3 : 0)
  const showsPortfolio = base.roleType === 'crew' || base.roleType === 'freelancer' || base.roleType === 'company'
  return {
    ...base,
    rating,
    reviewCount,
    reviews: rating > 0 ? REVIEW_POOL.map((r, i) => ({ ...r, id: `rv-${base.id}-${i}` })) : [],
    portfolio: showsPortfolio ? PORTFOLIO_POOL : [],
  }
}

// BACKEND DEV: REPLACE THIS MOCK RETURN WITH YOUR REAL API ENDPOINT
export async function fetchUserDetails(userId: number): Promise<UserProfileDetail> {
  await delay(700)
  return clone(enrichProfile(mockUserDetails[userId] ?? buildDefaultUserDetail(userId)))
}

// BACKEND DEV: GET /api/users/:id/portfolio
export async function fetchUserPortfolio(userId: number): Promise<PortfolioItem[]> {
  await delay(600)
  return clone(enrichProfile(mockUserDetails[userId] ?? buildDefaultUserDetail(userId)).portfolio)
}

// ---------------------------------------------------------------------------
// Availability calendar & bookings
// ---------------------------------------------------------------------------
const mockBookings: UserBooking[] = [
  { id: 'bk-101', userId: 1, title: 'مسلسل "ليالي الخليج" — الموسم 2', date: '12 مايو 2026', status: 'completed', role: 'منتجة تنفيذية', amountKwd: 3200 },
  { id: 'bk-102', userId: 1, title: 'إعلان تجاري — بنك الخليج', date: '28 مارس 2026', status: 'completed', role: 'مخرجة', amountKwd: 1450 },
  { id: 'bk-103', userId: 1, title: 'فيلم وثائقي — تراث الكويت', date: '20 يوليو 2026', status: 'upcoming', role: 'منتجة تنفيذية', amountKwd: 2800 },
  { id: 'bk-301', userId: 3, title: 'فيديو كليب — نجم صاعد', date: '5 أبريل 2026', status: 'completed', role: 'مخرجة فنية', amountKwd: 1900 },
  { id: 'bk-302', userId: 3, title: 'حملة هوية بصرية', date: '15 أغسطس 2026', status: 'upcoming', role: 'مديرة تصوير', amountKwd: 1200 },
]

let bookingSeq = 900

/**
 * BACKEND DEV: GET /api/users/:id/availability
 * Returns the booked/unavailable dates for the current month so the calendar
 * can disable them. Dates are deterministic per user for stable mock UI.
 */
export async function fetchUserAvailability(userId: number): Promise<UserAvailability> {
  await delay(600)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-based
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Deterministic "busy" pattern seeded by userId.
  const booked: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    if ((d * (userId + 3)) % 7 === 0 || (d + userId) % 11 === 0) {
      booked.push(`${monthStr}-${String(d).padStart(2, '0')}`)
    }
  }
  const base = mockUserDetails[userId]
  const dayRateRaw = base && typeof base.metadata.dayRate === 'string' ? base.metadata.dayRate : ''
  const dayRateKwd = Number(dayRateRaw.replace(/[^\d.]/g, '')) || 350
  return { userId, month: monthStr, bookedDates: booked, dayRateKwd }
}

// BACKEND DEV: GET /api/users/:id/bookings (history + upcoming)
export async function fetchUserBookings(userId: number): Promise<UserBooking[]> {
  await delay(600)
  return clone(mockBookings.filter((b) => b.userId === userId))
}

/**
 * BACKEND DEV: POST /api/bookings/create
 * Creates a booking for the target user. When `payment.method === 'bnpl'` the
 * checkout is routed to the chosen provider (Tabby/Tamara); otherwise the
 * amount is settled from the requester's wallet.
 */
export async function createBooking(req: BookingRequest): Promise<BookingResult> {
  await delay(1400)
  if (req.payment.method === 'wallet' && mockWallet.availableKwd < req.amountKwd) {
    throw new Error('الرصيد المتاح في محفظتك لا يكفي لتأكيد الحجز.')
  }
  if (req.payment.method === 'wallet') {
    mockWallet.availableKwd = Number((mockWallet.availableKwd - req.amountKwd).toFixed(2))
  }
  const id = `bk-${++bookingSeq}`
  return {
    success: true,
    bookingId: id,
    status: 'upcoming',
    message:
      req.payment.method === 'bnpl'
        ? `تم إنشاء الحجز وتقسيم المبلغ على 4 دفعات عبر ${req.payment.provider === 'tabby' ? 'تابي' : 'تمارا'}.`
        : 'تم تأكيد الحجز وخصم المبلغ من محفظتك.',
  }
}

// ---------------------------------------------------------------------------
// Trust & interaction actions
// ---------------------------------------------------------------------------
// BACKEND DEV: POST /api/messages/send
export async function sendMessage(userId: number, text: string): Promise<{ success: boolean; threadId: string }> {
  await delay(900)
  if (!text.trim()) throw new Error('لا يمكن إرسال رسالة فارغة.')
  return { success: true, threadId: `thread-${userId}` }
}

// BACKEND DEV: POST /api/users/:id/favorite (toggle shortlist)
export async function toggleFavorite(userId: number, favorite: boolean): Promise<{ success: boolean; favorite: boolean }> {
  await delay(600)
  return { success: true, favorite }
}

// BACKEND DEV: POST /api/users/:id/report
export async function reportProfile(userId: number, reason: string): Promise<{ success: boolean }> {
  await delay(800)
  if (!reason.trim()) throw new Error('يرجى إدخال سبب الإبلاغ.')
  return { success: true }
}

// ---------------------------------------------------------------------------
// BNPL (Buy Now, Pay Later) — Tabby / Tamara
// ---------------------------------------------------------------------------
export interface BnplCheckoutResult {
  success: boolean
  provider: 'tabby' | 'tamara'
  checkoutUrl: string
  installments: number
  installmentKwd: number
  message: string
}

/**
 * BACKEND DEV: POST /api/payments/bnpl/checkout
 * Creates a BNPL checkout session with the selected provider and returns the
 * redirect URL. The webhook (POST /api/payments/bnpl/webhook) later confirms
 * settlement on the backend.
 */
export async function createBnplCheckout(
  provider: 'tabby' | 'tamara',
  amountKwd: number,
  installments = 4,
): Promise<BnplCheckoutResult> {
  await delay(1200)
  const installmentKwd = Number((amountKwd / installments).toFixed(2))
  return {
    success: true,
    provider,
    checkoutUrl: `https://checkout.${provider}.com/session/${Date.now()}`,
    installments,
    installmentKwd,
    message: `تم إنشاء جلسة دفع عبر ${provider === 'tabby' ? 'تابي' : 'تمارا'} — ${installments} دفعات بقيمة ${installmentKwd} د.ك لكل دفعة.`,
  }
}

// BACKEND DEV: REPLACE WITH YOUR REAL PDF GENERATION ENDPOINT.
// Generates a profile PDF. `watermark: true` stamps the ASK CREW logo across
// the document (free tier); `watermark: false` returns a clean white-label PDF.
export async function downloadProfile(
  userId: number,
  options: { watermark?: boolean } = {},
): Promise<ProfileDownloadResult> {
  await delay(1500)
  const watermark = options.watermark ?? true
  const profile = mockUserDetails[userId] ?? buildDefaultUserDetail(userId)
  const safeName = profile.name.replace(/\s+/g, '_')
  return {
    success: true,
    fileName: `ASKCREW_Profile_${safeName}${watermark ? '_Watermarked' : '_Premium'}.pdf`,
    url: `https://docs.askcrew.com/profiles/${userId}.pdf?wm=${watermark ? 1 : 0}`,
    watermarked: watermark,
    chargedKwd: 0,
    message: watermark
      ? 'تم إنشاء الملف الشخصي بنجاح مع شعار ASK CREW.'
      : 'تم إنشاء الملف الشخصي النظيف بنجاح.',
  }
}

// BACKEND DEV: LINK THIS TO THE WALLET SYSTEM.
// Premium white-label export. Deducts `amountKwd` from the user's wallet
// balance BEFORE generating a clean, unbranded PDF. Reuse the same wallet
// ledger that powers /wallet so the micro-transaction is reflected everywhere.
export async function payAndDownloadProfile(
  userId: number,
  amountKwd: number,
): Promise<ProfileDownloadResult> {
  await delay(1500)
  if (mockWallet.availableKwd < amountKwd) {
    throw new Error('الرصيد المتاح في محفظتك لا يكفي لإتمام عملية الشراء.')
  }
  // Deduct from the shared wallet "database".
  mockWallet.availableKwd = Number((mockWallet.availableKwd - amountKwd).toFixed(2))
  const clean = await downloadProfile(userId, { watermark: false })
  return {
    ...clean,
    chargedKwd: amountKwd,
    walletBalanceKwd: mockWallet.availableKwd,
    message: `تم خصم ${amountKwd.toFixed(2)} د.ك من محفظتك وتنزيل الملف بدون شعار.`,
  }
}

// ===========================================================================
// ASSETS MARKETPLACE — rental, buy/sell & logistics
// ===========================================================================
const mockAssets: Asset[] = [
  {
    id: 'AST-STD-01',
    name: 'استديو نون الكبير (Stage A)',
    type: 'studio',
    description: 'استديو تصوير احترافي بمساحة 600م² مع خلفية خضراء ثابتة وشبكة إضاءة سينمائية كاملة.',
    provider: 'استوديوهات نون',
    images: ['/assets/studio.png'],
    country: 'الكويت',
    city: 'مدينة الكويت',
    availableIn: ['الكويت'],
    transactionTypes: ['rent'],
    dayRateKwd: 850,
    isShippable: false,
    hasParking: true,
    rating: 4.9,
    reviewCount: 37,
    metadata: { المساحة: '600 م²', 'ارتفاع السقف': '8 أمتار', 'غرف الملابس': 4, 'خلفية خضراء': 'ثابتة' },
  },
  {
    id: 'AST-LOC-02',
    name: 'فيلا صحراوية — كبد',
    type: 'location',
    description: 'موقع تصوير خارجي بإطلالة صحراوية ساحرة عند الغروب، مناسب للأعمال الدرامية والإعلانات.',
    provider: 'مواقع الخليج',
    images: ['/assets/location.png'],
    country: 'الكويت',
    city: 'كبد',
    availableIn: ['الكويت', 'السعودية'],
    transactionTypes: ['rent'],
    dayRateKwd: 600,
    isShippable: false,
    hasParking: true,
    rating: 4.7,
    reviewCount: 22,
    metadata: { 'نوع الموقع': 'صحراء + فيلا', 'تصاريح التصوير': 'متوفرة', الكهرباء: 'مولد خاص' },
  },
  {
    id: 'AST-EQP-03',
    name: 'كاميرا ARRI Alexa Mini LF',
    type: 'equipment',
    description: 'كاميرا سينمائية احترافية بدقة 4.5K مع طقم عدسات Master Prime كامل وحقيبة شحن مقاومة للصدمات.',
    provider: 'بدر للمعدات',
    images: ['/assets/equipment.png'],
    country: 'الكويت',
    city: 'حولي',
    availableIn: ['الكويت', 'السعودية', 'الإمارات'],
    transactionTypes: ['rent', 'buy'],
    dayRateKwd: 220,
    purchaseKwd: 18500,
    condition: 'used',
    isShippable: true,
    deliveryFeeKwd: 25,
    rating: 5.0,
    reviewCount: 48,
    metadata: { الدقة: '4.5K', 'عدد العدسات': 6, 'بطاقات التخزين': 'مشمولة', الكارنيه: 'ATA متوفر' },
  },
  {
    id: 'AST-THR-04',
    name: 'مسرح الدسمة الوطني',
    type: 'theater',
    description: 'مسرح كلاسيكي فاخر بمقاعد مخملية ومنصة واسعة، مثالي للعروض الحية والتصوير المسرحي.',
    provider: 'المجلس الوطني للثقافة',
    images: ['/assets/theater.png'],
    country: 'الكويت',
    city: 'الدسمة',
    availableIn: ['الكويت'],
    transactionTypes: ['rent'],
    dayRateKwd: 1200,
    isShippable: false,
    capacity: 750,
    hasParking: true,
    rating: 4.8,
    reviewCount: 19,
    metadata: { 'نظام الصوت': 'Dolby محيطي', 'غرف تبديل': 6, الإضاءة: 'مسرحية كاملة' },
  },
  {
    id: 'AST-ARN-05',
    name: 'صالة عرض الأرينا 360',
    type: 'arena',
    description: 'صالة عرض ضخمة بشاشة سينمائية عملاقة ومدرجات تتسع لآلاف الزوار، للعروض الأولى والمهرجانات.',
    provider: 'مجمع الأفنيوز',
    images: ['/assets/arena.png'],
    country: 'الكويت',
    city: 'الراي',
    availableIn: ['الكويت'],
    transactionTypes: ['rent'],
    dayRateKwd: 2400,
    isShippable: false,
    capacity: 3200,
    hasParking: true,
    rating: 4.6,
    reviewCount: 12,
    metadata: { 'حجم الشاشة': '32 متر', 'نظام العرض': '4K Laser', مواقف: '1200 سيارة' },
  },
  {
    id: 'AST-VHC-06',
    name: 'كرفان إنتاج متنقل (Basecamp)',
    type: 'vehicle',
    description: 'كرفان إنتاج مجهز بالكامل مع غرف ملابس ومكيفات ومولد كهربائي، جاهز للمواقع النائية.',
    provider: 'لوجستيات السينما',
    images: ['/assets/vehicle.png'],
    country: 'الكويت',
    city: 'الشويخ',
    availableIn: ['الكويت', 'السعودية'],
    transactionTypes: ['rent'],
    dayRateKwd: 450,
    isShippable: false,
    hasDriver: true,
    rating: 4.5,
    reviewCount: 9,
    metadata: { 'عدد الغرف': 3, التكييف: 'مركزي', المولد: '15 كيلو واط' },
  },
  {
    id: 'AST-PRP-07',
    name: 'طقم إكسسوارات تراثية',
    type: 'prop',
    description: 'مجموعة إكسسوارات وأثاث تراثي خليجي أصيل، مناسبة للأعمال التاريخية والدرامية.',
    provider: 'كنوز الديكور',
    images: ['/assets/prop.png'],
    country: 'الكويت',
    city: 'الجهراء',
    availableIn: ['الكويت', 'السعودية', 'قطر'],
    transactionTypes: ['rent', 'buy'],
    dayRateKwd: 80,
    purchaseKwd: 1450,
    condition: 'used',
    isShippable: true,
    deliveryFeeKwd: 15,
    rating: 4.4,
    reviewCount: 16,
    metadata: { 'عدد القطع': 24, الحقبة: 'الستينيات', الحالة: 'مرممة' },
  },
  {
    id: 'AST-WRD-08',
    name: 'أزياء سينمائية فاخرة (تشكيلة)',
    type: 'wardrobe',
    description: 'تشكيلة أزياء كلاسيكية وعصرية بمقاسات متعددة، جاهزة للتصوير الفوري أو الشراء.',
    provider: 'أتيليه المشهد',
    images: ['/assets/wardrobe.png'],
    country: 'الكويت',
    city: 'السالمية',
    availableIn: ['الكويت', 'الإمارات'],
    transactionTypes: ['rent', 'buy'],
    dayRateKwd: 60,
    purchaseKwd: 900,
    condition: 'new',
    isShippable: true,
    deliveryFeeKwd: 10,
    rating: 4.7,
    reviewCount: 21,
    metadata: { 'عدد القطع': 40, المقاسات: 'S–XXL', 'تنظيف جاف': 'مشمول' },
  },
  {
    id: 'AST-POST-09',
    name: 'غرفة مونتاج وتلوين DaVinci',
    type: 'postproduction',
    description: 'غرفة مونتاج وتلوين احترافية مع محطة DaVinci Resolve وشاشة معايرة ومهندس متفرغ.',
    provider: 'استوديوهات نون',
    images: ['/assets/postproduction.png'],
    country: 'الكويت',
    city: 'مدينة الكويت',
    availableIn: ['الكويت'],
    transactionTypes: ['rent'],
    dayRateKwd: 180,
    isShippable: false,
    rating: 4.9,
    reviewCount: 28,
    metadata: { البرنامج: 'DaVinci Resolve', 'شاشة المعايرة': 'HDR', 'مهندس متفرغ': 'نعم' },
  },
  {
    id: 'AST-CAT-10',
    name: 'خدمة إعاشة مواقع التصوير',
    type: 'catering',
    description: 'خدمة بوفيهات وإعاشة كاملة لمواقع التصوير مع خيارات غذائية متنوعة وفريق تقديم.',
    provider: 'مطبخ الكواليس',
    images: ['/assets/catering.png'],
    country: 'الكويت',
    city: 'الفروانية',
    availableIn: ['الكويت'],
    transactionTypes: ['rent'],
    dayRateKwd: 320,
    isShippable: false,
    mealCount: 50,
    rating: 4.6,
    reviewCount: 33,
    metadata: { 'الحد الأدنى': '20 وجبة', 'خيارات نباتية': 'متوفرة', 'فريق التقديم': 'مشمول' },
  },
  {
    id: 'AST-PRM-11',
    name: 'تصاريح تصوير وتأمين إنتاج',
    type: 'permit',
    description: 'استخراج تصاريح التصوير في الشوارع والطائرات المسيّرة، مع وثائق تأمين الإنتاج الشاملة.',
    provider: 'مكتب التيسير القانوني',
    images: ['/assets/permit.png'],
    country: 'الكويت',
    city: 'مدينة الكويت',
    availableIn: ['الكويت', 'السعودية'],
    transactionTypes: ['rent'],
    dayRateKwd: 250,
    isShippable: false,
    rating: 4.8,
    reviewCount: 14,
    metadata: { 'مدة الاستخراج': '3 أيام عمل', 'تصاريح الدرون': 'متوفرة', 'تأمين شامل': 'حتى 100 ألف د.ك' },
  },
]

// BACKEND DEV: GET /api/assets  (optional ?type= filter)
export async function fetchAssets(): Promise<Asset[]> {
  await delay(700)
  return clone(mockAssets)
}

// BACKEND DEV: GET /api/assets/:id
export async function fetchAssetById(id: string): Promise<Asset> {
  await delay(600)
  const asset = mockAssets.find((a) => a.id === id)
  if (!asset) throw new Error('الأصل غير موجود.')
  return clone(asset)
}

// BACKEND DEV: GET /api/assets/:id/availability
export async function fetchAssetAvailability(id: string): Promise<AssetAvailability> {
  await delay(550)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Deterministic "busy" pattern seeded by the asset id.
  const seed = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const booked: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    if ((d * seed) % 6 === 0 || (d + seed) % 9 === 0) {
      booked.push(`${monthStr}-${String(d).padStart(2, '0')}`)
    }
  }
  return { assetId: id, month: monthStr, bookedDates: booked }
}

// BACKEND DEV: POST /api/assets/book  (rental)
export async function bookAsset(req: AssetBookingRequest): Promise<AssetBookingResult> {
  await delay(1300)
  if (mockWallet.availableKwd < req.amountKwd) {
    throw new Error('الرصيد المتاح في محفظتك لا يكفي لتأكيد الحجز.')
  }
  mockWallet.availableKwd = Number((mockWallet.availableKwd - req.amountKwd).toFixed(2))
  return {
    success: true,
    bookingId: `ABK-${Date.now().toString().slice(-6)}`,
    status: 'confirmed',
    message: req.shipping
      ? 'تم تأكيد حجز الأصل وجدولة شحنه إلى موق��ك.'
      : 'تم تأكيد حجز الأصل (استلام شخصي).',
  }
}

// ---------------------------------------------------------------------------
// E-commerce: buy / sell with delivery logistics
// ---------------------------------------------------------------------------
let orderSeq = 5000

// BACKEND DEV: POST /api/ecommerce/orders/create
export async function createOrder(req: OrderRequest): Promise<OrderResult> {
  await delay(1500)
  if (!req.address.line.trim() || !req.address.phone.trim()) {
    throw new Error('يرجى إكمال بيانات عنوان التوصيل.')
  }
  const id = `ORD-${++orderSeq}`
  return {
    success: true,
    orderId: id,
    status: 'processing',
    totalKwd: req.totalKwd,
    message: `تم إنشاء طلب الشراء ${id} بقيمة ${req.totalKwd.toFixed(2)} د.ك. سيتم التوصيل إلى ${req.address.city}.`,
  }
}

// BACKEND DEV: GET /api/ecommerce/orders/track?orderId=...
export async function trackOrder(orderId: string): Promise<OrderTracking> {
  await delay(700)
  return {
    orderId,
    status: 'out_for_delivery',
    carrier: 'أرامكس الكويت',
    trackingNumber: `AWB-${orderId.replace(/\D/g, '')}`,
    etaLabel: 'خلال 24 ساعة',
    steps: [
      { status: 'processing', label: 'تم استلام الطلب', date: '20 يونيو 2026', done: true },
      { status: 'shipped', label: 'تم الشحن من المستودع', date: '21 يونيو 2026', done: true },
      { status: 'out_for_delivery', label: 'خرج للتوصيل', date: '22 يونيو 2026', done: true },
      { status: 'delivered', label: 'تم التسليم', date: '—', done: false },
    ],
  }
}

// ===========================================================================
// PRODUCTION MANAGER SUITE (ERP)
// ===========================================================================
const mockProductionBudget: ProductionBudget = {
  projectName: 'مسلسل "ليالي الخليج" — الموسم 2',
  allocatedKwd: 250000,
  spentKwd: 148500,
  remainingKwd: 101500,
  breakdown: [
    { label: 'حجوزات الطاقم (ضمان)', amountKwd: 82000 },
    { label: 'تأجير المعدات والمواقع', amountKwd: 41500 },
    { label: 'الإعاشة واللوجستيات', amountKwd: 15000 },
    { label: 'تصاريح وتأمين', amountKwd: 10000 },
  ],
}

// BACKEND DEV: GET /api/production/budget
export async function fetchProductionBudget(): Promise<ProductionBudget> {
  await delay(700)
  return clone(mockProductionBudget)
}

// BACKEND DEV: POST /api/production/callsheet/generate
export async function generateCallSheet(req: CallSheetRequest): Promise<CallSheet> {
  await delay(1400)
  // Pull booked crew/actors (mock) and stagger their call times.
  const pool: Omit<CallSheetRow, 'callTime' | 'location'>[] = [
    { name: 'منى الصباح', role: 'مخرجة', scenes: '12, 14, 18' },
    { name: 'بدر العتيبي', role: 'مدير تصوير', scenes: '12, 14' },
    { name: 'دانة المطيري', role: 'مهندسة صوت', scenes: '14, 18' },
    { name: 'يوسف القلاف', role: 'ممثل رئيسي', scenes: '18' },
  ]
  const [h, m] = req.generalCallTime.split(':').map(Number)
  const rows: CallSheetRow[] = req.crewIds.slice(0, pool.length).map((_, i) => {
    const slot = pool[i] ?? pool[0]
    const mins = (h * 60 + m) + i * 30
    const callTime = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
    return { ...slot, callTime, location: req.location }
  })
  return { id: `CS-${Date.now().toString().slice(-5)}`, date: req.date, location: req.location, generalCallTime: req.generalCallTime, rows }
}

let scriptSeq = 700

// BACKEND DEV: POST /api/production/scripts/upload (DRM + dynamic watermark)
export async function uploadScript(title: string, recipient: string, drmEnabled: boolean): Promise<ScriptUploadResult> {
  await delay(1500)
  if (!title.trim()) throw new Error('يرجى إدخال عنوان النص.')
  const document: ScriptDocument = {
    id: `SCR-${++scriptSeq}`,
    title,
    uploadedAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
    watermarkedFor: recipient || 'غير محدد',
    sizeLabel: '2.4 ميجابايت',
    drmEnabled,
  }
  return {
    success: true,
    document,
    message: drmEnabled
      ? `تم رفع النص وتشفيره وإضافة علامة مائية باسم: ${document.watermarkedFor}.`
      : 'تم رفع النص بنجاح.',
  }
}

// BACKEND DEV: POST /api/services/catering/book
export async function bookCatering(req: CateringBookingRequest): Promise<ServiceBookingResult> {
  await delay(1200)
  if (req.meals < 1) throw new Error('يرجى تحديد عدد الوجبات.')
  const estimatedKwd = Number((req.meals * 4.5).toFixed(2))
  return {
    success: true,
    referenceId: `CAT-${Date.now().toString().slice(-5)}`,
    estimatedKwd,
    message: `تم تأكيد طلب الإعاشة (${req.meals} وجبة) بتكلفة تقديرية ${estimatedKwd} د.ك.`,
  }
}

// BACKEND DEV: POST /api/services/permits/apply
export async function applyPermit(req: PermitApplicationRequest): Promise<ServiceBookingResult> {
  await delay(1200)
  const base = 250
  const estimatedKwd = req.withInsurance ? base + 400 : base
  return {
    success: true,
    referenceId: `PRM-${Date.now().toString().slice(-5)}`,
    estimatedKwd,
    message: `تم تقديم طلب تصريح "${req.permitType}". التكلفة التقديرية ${estimatedKwd} د.ك.`,
  }
}

// ===========================================================================
// LEADERBOARD — Top 10 rankings
// ===========================================================================
const mockLeaderboards: Record<LeaderboardCategory, LeaderboardEntry[]> = {
  freelancers: [
    { rank: 1, trend: 0, name: 'منى الصباح', subtitle: 'منتجة تنفيذية', metricLabel: '4.9 ★ • 312 مشروع', score: 100, verified: true },
    { rank: 2, trend: 2, name: 'بدر العتيبي', subtitle: 'مدير تصوير', metricLabel: '4.8 ★ • 268 مشروع', score: 94, verified: true },
    { rank: 3, trend: -1, name: 'دانة المطيري', subtitle: 'مهندسة صوت', metricLabel: '4.8 ★ • 241 مشروع', score: 90, verified: true },
    { rank: 4, trend: 1, name: 'يوسف القلاف', subtitle: 'ممثل', metricLabel: '4.7 ★ • 198 مشروع', score: 85 },
    { rank: 5, trend: -1, name: 'أحمد خالد', subtitle: 'مخرج', metricLabel: '4.7 ★ • 187 مشروع', score: 82 },
    { rank: 6, trend: 3, name: 'سارة محمد', subtitle: 'كاتبة سيناريو', metricLabel: '4.6 ★ • 165 مشروع', score: 78 },
    { rank: 7, trend: 0, name: 'فهد الرشيد', subtitle: 'مونتير', metricLabel: '4.6 ★ • 152 مشروع', score: 74 },
    { rank: 8, trend: -2, name: 'نورة سالم', subtitle: 'مصممة إنتاج', metricLabel: '4.5 ★ • 138 مشروع', score: 70 },
    { rank: 9, trend: 1, name: 'خالد الفهد', subtitle: 'مدير إضاءة', metricLabel: '4.5 ★ • 121 مشروع', score: 66 },
    { rank: 10, trend: 2, name: 'ليلى عبدالله', subtitle: 'مصممة أزياء', metricLabel: '4.4 ★ • 109 مشروع', score: 62 },
  ],
  assets: [
    { rank: 1, trend: 1, name: 'استديو نون الكبير (Stage A)', subtitle: 'استديو', metricLabel: '482 حجز', score: 100, verified: true },
    { rank: 2, trend: -1, name: 'كاميرا ARRI Alexa Mini LF', subtitle: 'معدات', metricLabel: '413 حجز', score: 92, verified: true },
    { rank: 3, trend: 0, name: 'فيلا صحراوية — كبد', subtitle: 'موقع تصوير', metricLabel: '356 حجز', score: 86 },
    { rank: 4, trend: 2, name: 'مسرح الدسمة الوطني', subtitle: 'مسرح', metricLabel: '298 حجز', score: 80 },
    { rank: 5, trend: 0, name: 'غرفة مونتاج DaVinci', subtitle: 'مونتاج', metricLabel: '274 حجز', score: 76 },
    { rank: 6, trend: -2, name: 'كرفان إنتاج متنقل', subtitle: 'مركبة', metricLabel: '241 حجز', score: 71 },
    { rank: 7, trend: 1, name: 'صالة عرض الأرينا 360', subtitle: 'صالة عرض', metricLabel: '203 حجز', score: 66 },
    { rank: 8, trend: 0, name: 'طقم إكسسوارات تراثية', subtitle: 'إكسسوارات', metricLabel: '187 حجز', score: 61 },
    { rank: 9, trend: 3, name: 'أزياء سينمائية فاخرة', subtitle: 'أزياء', metricLabel: '164 حجز', score: 57 },
    { rank: 10, trend: -1, name: 'خدمة إعاشة المواقع', subtitle: 'إعاشة', metricLabel: '142 حجز', score: 52 },
  ],
  projects: [
    { rank: 1, trend: 0, name: 'مسلسل "ليالي الخليج"', subtitle: 'استوديوهات نون', metricLabel: '2.4M مشاهدة', score: 100, verified: true },
    { rank: 2, trend: 1, name: 'فيلم "الإمبراطورية الكبرى"', subtitle: 'الإنتاج الذهبي', metricLabel: '1.9M مشاهدة', score: 88 },
    { rank: 3, trend: -1, name: 'وثائقي "أعماق الخليج"', subtitle: 'مرئيات الجزيرة', metricLabel: '1.5M مشاهدة', score: 79 },
    { rank: 4, trend: 2, name: 'مسلسل "ظلال المدينة"', subtitle: 'استوديو نجمة', metricLabel: '1.2M مشاهدة', score: 72 },
    { rank: 5, trend: 0, name: 'فيلم "رمال"', subtitle: 'أفلام الصحراء', metricLabel: '980K مشاهدة', score: 65 },
    { rank: 6, trend: -1, name: 'كوميديا "حظ سعيد"', subtitle: 'ضحكة برودكشن', metricLabel: '870K مشاهدة', score: 60 },
    { rank: 7, trend: 1, name: 'مسلسل "الغوّاص"', subtitle: 'استوديوهات نون', metricLabel: '760K مشاهدة', score: 55 },
    { rank: 8, trend: 0, name: 'برنامج "نجوم الغد"', subtitle: 'منصة الإبداع', metricLabel: '690K مشاهدة', score: 50 },
    { rank: 9, trend: 2, name: 'فيلم "منتصف الليل"', subtitle: 'الإنتاج الذهبي', metricLabel: '610K مشاهدة', score: 46 },
    { rank: 10, trend: -2, name: 'وثائقي "حكايات اللؤلؤ"', subtitle: 'مرئيات الجزيرة', metricLabel: '540K مشاهدة', score: 41 },
  ],
}

// BACKEND DEV: GET /api/leaderboard?category=freelancers|assets|projects
export async function fetchLeaderboard(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
  await delay(600)
  return clone(mockLeaderboards[category])
}

// ===========================================================================
// VOD — Netflix-style catalog, producer pricing, viewer access & watch party
// ===========================================================================
const mockVodCatalog: VodTitle[] = [
  {
    id: 'VOD-001',
    title: 'الإمبراطورية الكبرى',
    genre: 'دراما تاريخية',
    year: 2026,
    durationMin: 138,
    poster: '/vod/empire.png',
    synopsis: 'ملحمة تاريخية عن صعود وسقوط إمبراطورية في قلب الجزيرة العربية.',
    producer: 'الإنتاج الذهبي',
    rating: 4.9,
    top10Rank: 1,
    accessTiers: ['rent', 'buy', 'subscription'],
    rentKwd: 2.5,
    buyKwd: 9.9,
    offlineEnabled: true,
    maturity: '+12',
    views: 2400000,
  },
  {
    id: 'VOD-002',
    title: 'منتصف الليل',
    genre: 'إثارة وغموض',
    year: 2025,
    durationMin: 112,
    poster: '/vod/midnight.png',
    synopsis: 'محقق يطارد سراً مظلماً في شوارع المدينة المضاءة بالنيون.',
    producer: 'الإنتاج الذهبي',
    rating: 4.7,
    top10Rank: 2,
    accessTiers: ['rent', 'subscription'],
    rentKwd: 2.0,
    offlineEnabled: true,
    maturity: '+15',
    views: 1900000,
  },
  {
    id: 'VOD-003',
    title: 'حكايات اللؤلؤ',
    genre: 'دراما عائلية',
    year: 2026,
    durationMin: 124,
    poster: '/vod/pearl.png',
    synopsis: 'قصة مؤثرة عن عائلة غوّاصي لؤلؤ تتمسك بإرثها في وجه التغيير.',
    producer: 'مرئيات الجزيرة',
    rating: 4.8,
    top10Rank: 3,
    accessTiers: ['free', 'subscription'],
    offlineEnabled: false,
    maturity: 'للجميع',
    views: 1500000,
  },
  {
    id: 'VOD-004',
    title: 'حظ سعيد',
    genre: 'كوميديا',
    year: 2025,
    durationMin: 98,
    poster: '/vod/comedy.png',
    synopsis: 'كوميديا خفيفة عن شاب يطارد الحظ في مواقف لا تُنسى.',
    producer: 'ضحكة برودكشن',
    rating: 4.4,
    top10Rank: 4,
    accessTiers: ['rent', 'buy', 'subscription'],
    rentKwd: 1.5,
    buyKwd: 6.9,
    offlineEnabled: true,
    maturity: '+7',
    views: 870000,
  },
  {
    id: 'VOD-005',
    title: 'رمال',
    genre: 'مغامرة',
    year: 2024,
    durationMin: 131,
    poster: '/vod/sands.png',
    synopsis: 'رحلة بقاء ملحمية لرجل وحيد يعبر الصحراء بحثاً عن النجاة.',
    producer: 'أفلام الصحراء',
    rating: 4.6,
    top10Rank: 5,
    accessTiers: ['buy', 'subscription'],
    buyKwd: 7.9,
    offlineEnabled: true,
    maturity: '+12',
    views: 980000,
  },
  {
    id: 'VOD-006',
    title: 'أعماق الخليج',
    genre: 'وثائقي',
    year: 2026,
    durationMin: 76,
    poster: '/vod/documentary.png',
    synopsis: 'رحلة بصرية ساحرة في أعماق الخليج العربي وحياته البحرية النابضة.',
    producer: 'مرئيات الجزيرة',
    rating: 4.8,
    top10Rank: 6,
    accessTiers: ['free', 'subscription'],
    offlineEnabled: false,
    maturity: 'للجميع',
    views: 1500000,
  },
]

// BACKEND DEV: GET /api/vod/catalog
export async function fetchVodCatalog(): Promise<VodTitle[]> {
  await delay(700)
  return clone(mockVodCatalog)
}

// BACKEND DEV: GET /api/vod/top10
export async function fetchVodTop10(): Promise<VodTitle[]> {
  await delay(600)
  return clone(mockVodCatalog)
    .filter((t) => t.top10Rank)
    .sort((a, b) => (a.top10Rank ?? 99) - (b.top10Rank ?? 99))
}

// BACKEND DEV: POST /api/vod/checkout  (rent / buy a title)
export async function checkoutVod(req: VodCheckoutRequest): Promise<VodCheckoutResult> {
  await delay(1300)
  if (mockWallet.availableKwd < req.amountKwd) {
    throw new Error('الرصيد المتاح في محفظتك لا يكفي لإتمام العملية.')
  }
  mockWallet.availableKwd = Number((mockWallet.availableKwd - req.amountKwd).toFixed(2))
  // Rentals expire after 48h; purchases never expire.
  const expiresAt =
    req.tier === 'rent' ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : null
  return {
    success: true,
    entitlementId: `ENT-${Date.now().toString().slice(-6)}`,
    tier: req.tier,
    expiresAt,
    message:
      req.tier === 'rent'
        ? 'تم تأكيد التأجير — لديك 48 ساعة للمشاهدة.'
        : req.tier === 'buy'
          ? 'تم الشراء بنجاح — العنوان متاح في مكتبتك للأبد.'
          : 'تم تفعيل الوصول عبر اشتراكك.',
  }
}

// BACKEND DEV: POST /api/vod/watch-party/create
export async function createWatchParty(req: WatchPartyRequest): Promise<WatchPartyResult> {
  await delay(1200)
  if (req.invitees.length === 0) throw new Error('يرجى إضافة مدعو واحد على الأقل.')
  const partyId = `WP-${Date.now().toString().slice(-6)}`
  return {
    success: true,
    partyId,
    joinUrl: `https://watch.askcrew.tv/party/${partyId}`,
    hostToken: `host-${partyId}`,
    message: `تم إنشاء حفلة مشاهدة ودعوة ${req.invitees.length} مشاهد.`,
  }
}
