'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Download,
  Loader2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Landmark,
  ShieldCheck,
  Wallet,
  Hourglass,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Film,
  Eye,
  Star,
  Lock,
  Wand2,
  MonitorSmartphone,
  AtSign,
  Video,
  Globe,
  Hash,
  Link2,
  ShieldOff,
  Award,
  CreditCard,
  CalendarClock,
  Sparkles,
  KeyRound,
  Building2,
  GraduationCap,
  UserCog,
  Clapperboard,
  ListChecks,
  MessageSquare,
  Heart,
  Flag,
  CalendarPlus,
  PlayCircle,
  ImageIcon,
  Quote,
  CalendarCheck,
  CalendarClock as CalendarClockUpcoming,
  Send,
  Loader2 as Spinner,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import * as api from '@/services/api'
import type {
  UserProfileDetail,
  UserRoleType,
  UserSocialLink,
  UserAvailability,
  UserBooking,
} from '@/types'
import { ProfileExportModal } from '@/components/users/profile-export-modal'
import { AvailabilityCalendar } from '@/components/users/availability-calendar'
import { BookingRequestModal } from '@/components/users/booking-request-modal'

const socialIcon: Record<UserSocialLink['platform'], typeof Globe> = {
  instagram: AtSign,
  linkedin: Link2,
  youtube: Video,
  x: Hash,
  tiktok: Video,
  website: Globe,
}

const statusMeta: Record<UserProfileDetail['status'], { label: string; dot: string; text: string }> = {
  active: { label: 'نشط', dot: 'bg-success', text: 'text-success' },
  idle: { label: 'خامل', dot: 'bg-warning', text: 'text-warning' },
  banned: { label: 'محظور', dot: 'bg-destructive', text: 'text-destructive' },
}

// Prominent role badge styling + Arabic label per account archetype.
const roleMeta: Record<UserRoleType, { label: string; icon: typeof Globe; cls: string }> = {
  company: { label: 'شركة', icon: Building2, cls: 'bg-primary/15 text-primary border-primary/40' },
  student: { label: 'طالب', icon: GraduationCap, cls: 'bg-accent/15 text-accent border-accent/40' },
  viewer: { label: 'مشاهد', icon: Eye, cls: 'bg-muted text-muted-foreground border-border' },
  freelancer: { label: 'مستقل', icon: Briefcase, cls: 'bg-success/15 text-success border-success/40' },
  crew: { label: 'طاقم', icon: Clapperboard, cls: 'bg-gold/15 text-gold border-gold/40' },
  vip: { label: 'عضو مميز', icon: Star, cls: 'bg-gold/15 text-gold border-gold/40' },
  admin: { label: 'مشرف', icon: UserCog, cls: 'bg-destructive/15 text-destructive border-destructive/40' },
}

// Arabic labels for known metadata keys; unknown keys fall back to the raw key
// so ANY extra backend field still renders as a neat labelled row.
const metadataLabels: Record<string, string> = {
  commercialRegister: 'السجل التجاري',
  taxId: 'الرقم الضريبي',
  companyProfile: 'نبذة عن الشركة',
  employees: 'عدد الموظفين',
  hqAddress: 'العنوان الرئيسي',
  university: 'الجامعة',
  major: 'التخصص',
  graduationYear: 'سنة التخرج',
  studentId: 'الرقم الجامعي',
  watchTime: 'وقت المشاهدة',
  subscriptionHistory: 'سجل الاشتراك',
  favoriteGenres: 'الأنواع المفضّلة',
  lastWatched: 'آخر مشاهدة',
  equipment: 'المعدّات',
  unionId: 'رقم النقابة',
  availability: 'التوفّر',
  dayRate: 'السعر اليومي',
}

function metadataLabel(key: string) {
  return metadataLabels[key] ?? key
}

function kwd(n: number) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 })} د.ك`
}

// ----------------------------------------------------------------------------
// Small presentational helpers
// ----------------------------------------------------------------------------
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 border-t border-border pt-5">
      <h4 className="flex items-center gap-2 text-sm font-black text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h4>
      {children}
    </section>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Globe
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn('mt-1 text-lg font-black text-foreground', accent)}>{value}</p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold text-foreground', mono && 'font-mono text-xs')} dir={mono ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  )
}

function Chips({ items, tone }: { items: string[]; tone: 'spec' | 'perm' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs font-bold',
            tone === 'spec'
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-gold/30 bg-gold/10 text-gold',
          )}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function StarRating({ value, size = 'h-3.5 w-3.5' }: { value: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(size, i <= Math.round(value) ? 'fill-gold text-gold' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  )
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  active,
  tone = 'default',
}: {
  icon: typeof Globe
  label: string
  onClick: () => void
  active?: boolean
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition',
        active
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : tone === 'danger'
            ? 'border-border bg-white/5 text-muted-foreground hover:border-destructive/40 hover:text-destructive'
            : 'border-border bg-white/5 text-foreground hover:bg-white/10',
      )}
    >
      <Icon className={cn('h-4 w-4', active && 'fill-destructive')} />
      {label}
    </button>
  )
}

// Lightweight self-contained modal for Message / Report (textarea + submit).
function TextActionModal({
  title,
  placeholder,
  submitLabel,
  accent,
  onSubmit,
  onClose,
}: {
  title: string
  placeholder: string
  submitLabel: string
  accent: 'primary' | 'destructive'
  onSubmit: (text: string) => Promise<void>
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    try {
      await onSubmit(text)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="glass w-full max-w-md rounded-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-black text-foreground">{title}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="mb-4 w-full resize-none rounded-xl border border-border bg-white/5 p-3 text-sm text-foreground outline-none transition focus:border-primary"
        />
        <button
          onClick={submit}
          disabled={busy}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition hover:opacity-90 disabled:opacity-60',
            accent === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-white',
          )}
        >
          {busy ? <Spinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// USER DETAILS SLIDE-OUT PANEL
// ============================================================================
export function UserDetailsPanel({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfileDetail | null>(null)
  const [availability, setAvailability] = useState<UserAvailability | null>(null)
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [shown, setShown] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [textAction, setTextAction] = useState<'message' | 'report' | null>(null)

  // Trigger the slide-in transition on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Fetch the rich profile + availability + bookings from the service layer.
  useEffect(() => {
    let active = true
    setProfile(null)
    setAvailability(null)
    setBookings([])
    api.fetchUserDetails(userId).then((p) => {
      if (active) setProfile(p)
    })
    api.fetchUserAvailability(userId).then((a) => {
      if (active) setAvailability(a)
    })
    api.fetchUserBookings(userId).then((b) => {
      if (active) setBookings(b)
    })
    return () => {
      active = false
    }
  }, [userId])

  async function handleToggleFavorite() {
    const next = !favorite
    setFavorite(next)
    try {
      await api.toggleFavorite(userId, next)
      toast.success(next ? 'تمت الإضافة إلى المفضلة.' : 'تمت الإزالة من المفضلة.')
    } catch {
      setFavorite(!next)
      toast.error('تعذّر تحديث المفضلة.')
    }
  }

  function handleClose() {
    setShown(false)
    setTimeout(onClose, 250)
  }

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          shown ? 'opacity-100' : 'opacity-0',
        )}
        onClick={handleClose}
      />

      {/* Drawer — anchored to the inline-END edge, i.e. the side OPPOSITE the
          nav sidebar (which sits at inline-start). Mirrors cleanly in RTL/LTR
          and never overlaps the sidebar. */}
      <aside
        className={cn(
          'absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-border bg-background shadow-2xl transition-transform duration-300 ease-out',
          shown ? 'translate-x-0' : 'rtl:-translate-x-full ltr:translate-x-full',
        )}
        role="dialog"
        aria-label="تفاصيل المستخدم"
      >
        {!profile ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">جارٍ تحميل بيانات المستخدم...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="relative border-b border-border p-5">
              <button
                onClick={handleClose}
                aria-label="إغلاق"
                className="absolute end-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4 pe-1">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-black text-white">
                  {profile.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-xl font-black text-foreground">{profile.name}</h3>
                    <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-black text-gold">
                      {profile.tier}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    {profile.role}
                  </p>
                  {profile.reviewCount > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRating value={profile.rating} />
                      <span className="text-xs font-black text-gold">{profile.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({profile.reviewCount} تقييم)</span>
                    </div>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {(() => {
                      const r = roleMeta[profile.roleType]
                      const RoleIcon = r.icon
                      return (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black',
                            r.cls,
                          )}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {r.label}
                        </span>
                      )
                    })()}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-bold',
                        statusMeta[profile.status].text,
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta[profile.status].dot)} />
                      {statusMeta[profile.status].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="mt-4 flex items-stretch gap-2">
                <QuickAction icon={MessageSquare} label="مراسلة" onClick={() => setTextAction('message')} />
                <QuickAction
                  icon={Heart}
                  label="المفضلة"
                  onClick={handleToggleFavorite}
                  active={favorite}
                />
                <QuickAction icon={Flag} label="إبلاغ" tone="danger" onClick={() => setTextAction('report')} />
              </div>

              {/* Premium action: export / download profile */}
              <button
                onClick={() => setExporting(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                تحميل الملف الشخصي (PDF)
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Bio + contact */}
              <section className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground">{profile.bio}</p>
                <div className="space-y-2 rounded-xl border border-border bg-white/5 p-3">
                  <Row label="البريد الإلكتروني" value={profile.email} />
                  <Row label="الهاتف" value={profile.phone} mono />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">الدولة</span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="text-base leading-none">{profile.countryFlag}</span>
                      {profile.country}
                    </span>
                  </div>
                  <Row label="مكان الإقامة" value={profile.city} />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      تاريخ الانضمام
                    </span>
                    <span className="font-semibold text-foreground">{profile.joinedAt}</span>
                  </div>
                </div>
              </section>

              {/* Availability calendar & booking */}
              <Section icon={CalendarDays} title="التوفر والحجوزات">
                {availability ? (
                  <AvailabilityCalendar
                    month={availability.month}
                    bookedDates={availability.bookedDates}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border border-border bg-white/5 py-8">
                    <Spinner className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}

                {/* Request booking CTA */}
                <button
                  onClick={() => setBookingOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-black text-black shadow-lg shadow-gold/20 transition hover:opacity-90 glow-gold"
                >
                  <CalendarPlus className="h-4 w-4" />
                  {selectedDate ? 'طلب حجز للتاريخ المحدد' : 'طلب حجز'}
                </button>

                {/* Booking history timeline */}
                {bookings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">سجل الأعمال والمواعيد</p>
                    <ol className="relative space-y-3 border-s border-border ps-4">
                      {bookings.map((b) => {
                        const upcoming = b.status === 'upcoming'
                        const Icon = upcoming ? CalendarClockUpcoming : CalendarCheck
                        return (
                          <li key={b.id} className="relative">
                            <span
                              className={cn(
                                'absolute -start-[1.42rem] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-background',
                                upcoming ? 'bg-warning' : 'bg-success',
                              )}
                            />
                            <div className="rounded-xl border border-border bg-white/5 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-bold text-foreground">{b.title}</span>
                                <span
                                  className={cn(
                                    'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                                    upcoming ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
                                  )}
                                >
                                  <Icon className="h-3 w-3" />
                                  {upcoming ? 'قادم' : 'مكتمل'}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{b.role} • {b.date}</span>
                                <span className="font-bold text-foreground">{kwd(b.amountKwd)}</span>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                )}
              </Section>

              {/* Showreel & media gallery */}
              {profile.portfolio.length > 0 && (
                <Section icon={PlayCircle} title="معرض الأعمال والفيديو">
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {profile.portfolio.map((item) => (
                      <div key={item.id} className="group relative w-40 shrink-0">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
                          <img
                            src={item.thumbnail || '/placeholder.svg'}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <span className="absolute end-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            {item.type === 'video' ? (
                              <>
                                <PlayCircle className="h-3 w-3" />
                                {item.duration}
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-3 w-3" />
                                صورة
                              </>
                            )}
                          </span>
                          {item.type === 'video' && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <PlayCircle className="h-9 w-9 text-white/90 drop-shadow-lg transition group-hover:scale-110" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 truncate text-xs font-bold text-foreground">{item.title}</p>
                        {item.type === 'video' && item.views !== undefined && (
                          <p className="text-[10px] text-muted-foreground">
                            {item.views.toLocaleString('en-US')} مشاهدة
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Social links */}
              {profile.socials.length > 0 && (
                <Section icon={Globe} title="الروابط الاجتماعية">
                  <div className="flex flex-wrap gap-2">
                    {profile.socials.map((s) => {
                      const Icon = socialIcon[s.platform]
                      return (
                        <a
                          key={s.platform}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/10"
                          dir="ltr"
                        >
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {s.handle}
                        </a>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* Specifications & permissions */}
              {(profile.specifications.length > 0 || profile.permissions.length > 0) && (
                <Section icon={Sparkles} title="المواصفات والصلاحيات">
                  {profile.specifications.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        المواصفات والتخصصات
                      </p>
                      <Chips items={profile.specifications} tone="spec" />
                    </div>
                  )}
                  {profile.permissions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <KeyRound className="h-3.5 w-3.5" />
                        الصلاحيات
                      </p>
                      <Chips items={profile.permissions} tone="perm" />
                    </div>
                  )}
                </Section>
              )}

              {/* Financial */}
              <Section icon={Landmark} title="التفاصيل المالية">
                <div className="space-y-2 rounded-xl border border-border bg-white/5 p-3">
                  <Row label="رقم الآيبان (IBAN)" value={profile.financial.iban} mono />
                  <Row label="البنك" value={profile.financial.bankName} />
                  <Row label="صاحب الحساب" value={profile.financial.accountHolder} />
                  <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                    <span className="text-muted-foreground">حالة التحقق المالي</span>
                    <span
                      className={cn(
                        'flex items-center gap-1 font-bold',
                        profile.financial.verified ? 'text-success' : 'text-muted-foreground',
                      )}
                    >
                      {profile.financial.verified ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" /> موثّق
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-3.5 w-3.5" /> غير موثّق
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Stat icon={Wallet} label="المتاح" value={kwd(profile.financial.availableKwd)} accent="text-success" />
                  <Stat icon={Hourglass} label="بالضمان" value={kwd(profile.financial.pendingEscrowKwd)} accent="text-warning" />
                  <Stat icon={TrendingUp} label="إجمالي الأرباح" value={kwd(profile.financial.totalEarnedKwd)} />
                </div>
                {/* Rewards & subscription */}
                <div className="grid grid-cols-3 gap-2">
                  <Stat
                    icon={Award}
                    label="النقاط"
                    value={profile.financial.points.toLocaleString('en-US')}
                    accent="text-gold"
                  />
                  <Stat icon={CreditCard} label="الباقة" value={profile.financial.plan} accent="text-primary" />
                  <Stat icon={CalendarClock} label="تاريخ الانتهاء" value={profile.financial.planExpiry} />
                </div>
              </Section>

              {/* Platform stats */}
              <Section icon={TrendingUp} title="نشاط المنصة والإحصائيات">
                <div className="grid grid-cols-2 gap-2">
                  <Stat icon={Briefcase} label="عقود نشطة" value={String(profile.stats.activeContracts)} />
                  <Stat icon={CheckCircle2} label="مشاريع مكتملة" value={String(profile.stats.completedProjects)} />
                  <Stat icon={Hourglass} label="محجوز بالضمان" value={kwd(profile.stats.escrowHeldKwd)} accent="text-warning" />
                  <Stat icon={Star} label="متوسط التقييم" value={profile.stats.avgRating ? `${profile.stats.avgRating} / 5` : '—'} accent="text-gold" />
                  <Stat icon={Film} label="أعمال الفيديو (VOD)" value={String(profile.stats.vodTitles)} />
                  <Stat icon={Eye} label="مشاهدات VOD" value={profile.stats.vodViews.toLocaleString('en-US')} />
                </div>
                <Stat icon={TrendingUp} label="إيرادات الفيديو (VOD)" value={kwd(profile.stats.vodRevenueKwd)} accent="text-success" />
              </Section>

              {/* Reviews / trust */}
              {profile.reviews.length > 0 && (
                <Section icon={Star} title={`التقييمات (${profile.reviewCount})`}>
                  <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3">
                    <span className="text-3xl font-black text-gold">{profile.rating.toFixed(1)}</span>
                    <div>
                      <StarRating value={profile.rating} />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        بناءً على {profile.reviewCount} تقييم موثّق
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {profile.reviews.map((r) => (
                      <div key={r.id} className="rounded-xl border border-border bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-xs font-black text-foreground">
                              {r.authorInitials}
                            </span>
                            <span className="text-sm font-bold text-foreground">{r.author}</span>
                          </span>
                          <StarRating value={r.rating} size="h-3 w-3" />
                        </div>
                        <p className="mt-2 flex gap-1.5 text-sm leading-relaxed text-foreground/90">
                          <Quote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {r.comment}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          {r.project} • {r.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Security */}
              <Section icon={Lock} title="حالة الأمان">
                <div className="space-y-2 rounded-xl border border-border bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">المصادقة الثنائية (2FA)</span>
                    <span
                      className={cn(
                        'flex items-center gap-1 font-bold',
                        profile.security.twoFAEnabled ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {profile.security.twoFAEnabled ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldOff className="h-3.5 w-3.5" />
                      )}
                      {profile.security.twoFAEnabled ? profile.security.twoFAMethod : 'غير مُفعّلة'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Wand2 className="h-3.5 w-3.5" />
                      آخر رابط دخول سحري
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.security.lastMagicLinkAt ?? 'لا يوجد'}
                    </span>
                  </div>
                </div>

                {/* Magic link history */}
                {profile.security.magicLinkHistory.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground">سجل روابط الدخول السحرية</p>
                    {profile.security.magicLinkHistory.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-xs"
                      >
                        <span className="text-foreground">{m.device}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-mono" dir="ltr">{m.ip}</span>
                          <span>{m.time}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Paired devices */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground">أجهزة المشاهدة المرتبطة</p>
                  {profile.security.pairedDevices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">لا توجد أجهزة مرتبطة.</p>
                  ) : (
                    profile.security.pairedDevices.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-xs"
                      >
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
                          {d.name}
                        </span>
                        <span className="text-muted-foreground">{d.lastActive}</span>
                      </div>
                    ))
                  )}
                </div>
              </Section>

              {/* Dynamic, role-specific metadata — renders ANY key/value the
                  backend sends, so new DB columns need no front-end changes. */}
              {Object.keys(profile.metadata).length > 0 && (
                <Section icon={ListChecks} title="البيانات الخاصة بنوع المستخدم">
                  <div className="space-y-2 rounded-xl border border-border bg-white/5 p-3">
                    {Object.entries(profile.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3 text-sm">
                        <span className="shrink-0 text-muted-foreground">{metadataLabel(key)}</span>
                        <span className="text-end font-semibold text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </>
        )}
      </aside>

      {exporting && profile && (
        <ProfileExportModal userId={profile.id} userName={profile.name} onClose={() => setExporting(false)} />
      )}

      {bookingOpen && profile && (
        <BookingRequestModal
          userId={profile.id}
          userName={profile.name}
          selectedDate={selectedDate}
          dayRateKwd={availability?.dayRateKwd ?? 350}
          onClose={() => setBookingOpen(false)}
          onBooked={() => {
            // Reflect the new booking + mark its date busy.
            api.fetchUserBookings(profile.id).then(setBookings)
            api.fetchUserAvailability(profile.id).then(setAvailability)
            setSelectedDate(null)
          }}
        />
      )}

      {textAction === 'message' && profile && (
        <TextActionModal
          title={`مراسلة ${profile.name}`}
          placeholder="اكتب رسالتك..."
          submitLabel="إرسال الرسالة"
          accent="primary"
          onClose={() => setTextAction(null)}
          onSubmit={async (text) => {
            try {
              await api.sendMessage(profile.id, text)
              toast.success('تم إرسال الرسالة بنجاح.')
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'تعذّر إرسال الرسالة.')
              throw err
            }
          }}
        />
      )}

      {textAction === 'report' && profile && (
        <TextActionModal
          title={`الإبلاغ عن ${profile.name}`}
          placeholder="اذكر سبب الإبلاغ..."
          submitLabel="إرسال البلاغ"
          accent="destructive"
          onClose={() => setTextAction(null)}
          onSubmit={async (text) => {
            try {
              await api.reportProfile(profile.id, text)
              toast.success('تم استلام البلاغ وسيراجعه فريق الإشراف.')
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'تعذّر إرسال البلاغ.')
              throw err
            }
          }}
        />
      )}
    </div>
  )
}
