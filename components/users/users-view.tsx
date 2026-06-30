'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  Wand2,
  History,
  Check,
  Plus,
  Trash2,
  GripVertical,
  QrCode,
  Crown,
  Rocket,
  Building2,
  IdCard,
  UserSearch,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { ExportButtons } from '@/components/shared/export-buttons'
import { UserQRModal, type Tier } from '@/components/users/user-qr-modal'
import { ActivityHistory } from '@/components/users/activity-history'
import { TalentProfileContent, talentProfileOf } from '@/components/users/talent-profile'
import { UserDetailsPanel } from '@/components/users/user-details-panel'
import { DualFlag, PurchasingPowerBanner } from '@/components/shared/geo-widgets'
import { useModal } from '@/lib/modal'
import { UserForm } from '@/components/users/UserForm'
import api from '@/lib/api'

export type CrmUser = {
  id: number
  name: string
  email: string
  initials: string
  status: 'active' | 'idle' | 'banned'
  twoFA: boolean
  lastSeen: string
  events: number
  tier: Tier
}

type ApiUser = {
  id: number
  fullname: string
  email: string
  is_active: boolean
  is_verified: boolean
  date_joined: string
  type: 'viewer' | 'enterprise' | 'student'
  profile?: any
  rating_count?: number
}

type ApiResponse = ApiUser[] | { results: ApiUser[] }

const mapApiUserToCrmUser = (apiUser: ApiUser): CrmUser => {
  const getInitials = (name: string) => {
    if (!name) return 'م'
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getTierFromType = (type: string): Tier => {
    switch (type) {
      case 'enterprise':
        return 'Corporate'
      case 'student':
        return 'Pro'
      default:
        return 'Beginner'
    }
  }

  const getStatus = (isActive: boolean): 'active' | 'idle' | 'banned' => {
    if (!isActive) return 'banned'
    return 'active'
  }

  const getLastSeen = (dateJoined: string) => {
    return dateJoined ? new Date(dateJoined).toLocaleDateString('ar-SA') : 'غير معروف'
  }

  const userName = apiUser.fullname || apiUser.name || apiUser.email || 'مستخدم'

  return {
    id: apiUser.id,
    name: userName,
    email: apiUser.email,
    initials: getInitials(userName),
    status: getStatus(apiUser.is_active),
    twoFA: apiUser.is_verified,
    lastSeen: getLastSeen(apiUser.date_joined),
    events: apiUser.rating_count || 0,
    tier: getTierFromType(apiUser.type),
  }
}

// Premium tiers get a small inline marker next to the name (Beginner/Default show none).
const tierMarker: Partial<Record<Tier, { icon: typeof Crown; className: string; label: string }>> = {
  VIP: { icon: Crown, className: 'text-gold', label: 'عضوية VIP' },
  Pro: { icon: Rocket, className: 'text-primary', label: 'باقة برو' },
  Corporate: { icon: Building2, className: 'text-accent', label: 'حساب شركة' },
}

const statusMeta: Record<CrmUser['status'], { label: string; dot: string; text: string }> = {
  active: { label: 'نشط', dot: 'bg-success', text: 'text-success' },
  idle: { label: 'خامل', dot: 'bg-warning', text: 'text-warning' },
  banned: { label: 'محظور', dot: 'bg-destructive', text: 'text-destructive' },
}

export function UsersView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [users, setUsers] = useState<CrmUser[]>([])
  const [query, setQuery] = useState('')
  const [sentLink, setSentLink] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [qrUser, setQrUser] = useState<CrmUser | null>(null)
  const [detailUserId, setDetailUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const accent = execMode ? 'text-destructive' : 'text-primary'
  const filtered = users.filter((u) => u.name.includes(query) || u.email.includes(query))

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.fetchUsers() as ApiResponse
        console.log('Users API response:', response)
        const apiUsers = Array.isArray(response) ? response : response.results
        const crmUsers = apiUsers?.map(mapApiUserToCrmUser) || []
        setUsers(crmUsers)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const sendMagicLink = (id: number) => {
    setSentLink(id)
    setTimeout(() => setSentLink((curr) => (curr === id ? null : curr)), 2000)
  }

  const refreshUsers = async () => {
    try {
      const response = await api.fetchUsers() as ApiResponse
      const apiUsers = Array.isArray(response) ? response : response.results
      const crmUsers = apiUsers?.map(mapApiUserToCrmUser) || []
      setUsers(crmUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const addUser = () => {
    openModal({
      title: 'إضافة مستخدم جديد',
      content: <UserForm onSuccess={refreshUsers} />,
      size: 'md',
    })
  }

  const editUser = (user: CrmUser) => {
    openModal({
      title: 'تعديل المستخدم',
      content: <UserForm user={user} onSuccess={refreshUsers} />,
      size: 'md',
    })
  }

  const deleteUser = async (id: number) => {
    try {
      await api.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return setDragId(null)
    setUsers((prev) => {
      const list = [...prev]
      const from = list.findIndex((u) => u.id === dragId)
      const to = list.findIndex((u) => u.id === targetId)
      const [moved] = list.splice(from, 1)
      list.splice(to, 0, moved)
      return list
    })
    setDragId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Users className={cn('h-6 w-6', accent)} />
            إدارة المستخدمين
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            نظام CRM متكامل — المصادقة الثنائية وروابط الدخول السحرية وسجل النشاط
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButtons
            label="المستخدمين"
            rows={filtered}
            columns={[
              { key: 'name', header: 'الاسم' },
              { key: 'email', header: 'البريد الإلكتروني' },
              { key: 'tier', header: 'الباقة' },
              { key: 'status', header: 'الحالة' },
              { key: 'twoFA', header: 'المصادقة الثنائية' },
              { key: 'lastSeen', header: 'آخر ظهور' },
              { key: 'events', header: 'الأحداث' },
            ]}
          />
          <button
            onClick={addUser}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة مستخدم
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="input-base pr-10"
        />
      </div>

      {/* #14 Purchasing-power hint shown to producers searching for talent */}
      <PurchasingPowerBanner message="توفير الميزانية: تعيين مونتير من (مصر) قد يوفر حتى 40% من ميزانيتك بسبب فرق العملة الحالي." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((u) => {
          const meta = statusMeta[u.status]
          return (
            <div
              key={u.id}
              draggable
              onDragStart={() => setDragId(u.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(u.id)}
              className={cn(
                'group glass flex flex-col gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-white/20',
                dragId === u.id && 'opacity-40',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 transition group-hover:text-foreground active:cursor-grabbing" />
                  <button
                    type="button"
                    onClick={() => setDetailUserId(u.id)}
                    aria-label={`عرض الملف الكامل لـ ${u.name}`}
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white transition hover:opacity-90',
                      execMode
                        ? 'bg-gradient-to-br from-destructive to-gold'
                        : 'bg-gradient-to-br from-primary to-accent',
                    )}
                  >
                    {u.initials}
                  </button>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailUserId(u.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setDetailUserId(u.id)
                      }
                    }}
                    className="min-w-0 cursor-pointer leading-tight flex-1"
                  >
                    <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                      {u.name}
                      {(() => {
                        const marker = tierMarker[u.tier]
                        if (!marker) return null
                        const MarkerIcon = marker.icon
                        return <MarkerIcon className={cn('h-3.5 w-3.5 shrink-0', marker.className)} aria-label={marker.label} />
                      })()}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    {(() => {
                      const p = talentProfileOf(u.id)
                      return (
                        <div className="mt-1">
                          <DualFlag
                            nationality={p.nationality}
                            residence={p.residence}
                            residenceLabel={p.residenceLabel}
                          />
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold',
                    meta.text,
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                  {meta.label}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm">
                  {u.twoFA ? (
                    <ShieldCheck className="h-4 w-4 text-success" />
                  ) : (
                    <ShieldOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={u.twoFA ? 'text-success' : 'text-muted-foreground'}>
                    {u.twoFA ? 'المصادقة الثنائية مفعّلة' : 'بدون مصادقة ثنائية'}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  {u.events}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{u.lastSeen}</span>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <button
                    onClick={() => setDetailUserId(u.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20 shrink-0"
                  >
                    <UserSearch className="h-3.5 w-3.5" />
                    الملف الكامل
                  </button>
                  <button
                    onClick={() => editUser(u)}
                    className="flex items-center justify-center rounded-lg border border-border bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                    aria-label="تعديل"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      openModal({
                        title: 'سجل نشاط المستخدم',
                        content: <ActivityHistory userName={u.name} />,
                        size: 'sm',
                      })
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                  >
                    <History className="h-3.5 w-3.5" />
                    السجل
                  </button>
                  <button
                    onClick={() =>
                      openModal({
                        title: `الملف المهني — ${u.name}`,
                        content: <TalentProfileContent userId={u.id} userName={u.name} />,
                      })
                    }
                    aria-label={`الملف المهني لـ ${u.name}`}
                    className="flex items-center justify-center rounded-lg border border-border bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                  >
                    <IdCard className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setQrUser(u)}
                    aria-label={`بطاقة QR لـ ${u.name}`}
                    className="flex items-center justify-center rounded-lg border border-border bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => sendMagicLink(u.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 shrink-0',
                      sentLink === u.id
                        ? 'bg-success'
                        : execMode
                          ? 'bg-destructive'
                          : 'bg-primary',
                    )}
                  >
                    {sentLink === u.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        أُرسل
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        رابط سحري
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    aria-label={`حذف ${u.name}`}
                    className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive opacity-0 transition hover:bg-destructive hover:text-white group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {qrUser && (
        <UserQRModal
          userId={qrUser.id}
          userName={qrUser.name}
          tier={qrUser.tier}
          onClose={() => setQrUser(null)}
        />
      )}

      {detailUserId !== null && (
        <UserDetailsPanel userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}
    </div>
  )
}
