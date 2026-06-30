'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  Tv,
  MonitorSmartphone,
  Gamepad2,
  Smartphone,
  Loader2,
  Link2,
  CheckCircle2,
  ShieldOff,
  RadioTower,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { pairViewerDevice, fetchPairedDevices, unlinkDevice } from '@/services/api'
import type { PairedDevice, DeviceKind } from '@/types'

const KIND_ICON: Record<DeviceKind, LucideIcon> = {
  tv: Tv,
  mobile: Smartphone,
  desktop: MonitorSmartphone,
  console: Gamepad2,
}

// Formats raw input into uppercase alphanumerics with a dash after 4 chars,
// e.g. "abcd1234" -> "ABCD-1234". Max 8 significant characters.
function formatCode(raw: string) {
  const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
  if (clean.length <= 4) return clean
  return `${clean.slice(0, 4)}-${clean.slice(4)}`
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `قبل ${mins} دقيقة`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `قبل ${hours} ساعة`
  const days = Math.round(hours / 24)
  return `قبل ${days} يوم`
}

export function DevicePairingView() {
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)

  const [devices, setDevices] = useState<PairedDevice[]>([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchPairedDevices()
      .then((d) => active && setDevices(d))
      .catch(() => active && toast.error('تعذر تحميل الأجهزة المرتبطة.'))
      .finally(() => active && setLoadingDevices(false))
    return () => {
      active = false
    }
  }, [toast])

  const significant = code.replace(/[^A-Z0-9]/gi, '')
  const canSubmit = significant.length >= 6 && significant.length <= 8 && !linking

  async function handlePair(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLinking(true)
    setLinked(false)
    try {
      const result = await pairViewerDevice(code)
      toast.success(result.message)
      setLinked(true)
      setCode('')
      const refreshed = await fetchPairedDevices()
      setDevices(refreshed)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل ربط الجهاز.')
    } finally {
      setLinking(false)
    }
  }

  async function handleUnlink(device: PairedDevice) {
    setRevoking(device.id)
    try {
      const updated = await unlinkDevice(device.id)
      setDevices(updated)
      toast.success(`تم إلغاء ربط ${device.name}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل إلغاء الربط.')
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <RadioTower className="h-6 w-6 text-primary" />
          ربط أجهزة المشاهدة (Device Pairing)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اربط شاشتك الذكية أو جهاز العرض الخارجي عبر رمز المشاهدة لبدء البث فوراً.
        </p>
      </div>

      {/* Cinematic pairing card */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/10 to-transparent p-8 md:p-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary glow-gold">
            <Tv className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-xl font-black text-foreground">أدخل رمز المشاهدة</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            الرمز المكوّن من 6 إلى 8 خانات يظهر على شاشة جهازك الذكي.
          </p>

          {linked ? (
            <div className="mt-8 w-full animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="text-lg font-bold text-foreground">تم ربط الجهاز بنجاح</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Device successfully linked. Your content will start playing on your TV shortly.
                </p>
                <button
                  onClick={() => setLinked(false)}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-foreground transition hover:bg-white/10"
                >
                  <Link2 className="h-4 w-4" />
                  ربط جهاز آخر
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePair} className="mt-8 w-full">
              <input
                value={code}
                onChange={(e) => setCode(formatCode(e.target.value))}
                placeholder="ABCD-1234"
                dir="ltr"
                inputMode="text"
                autoCapitalize="characters"
                aria-label="رمز المشاهدة"
                className="input-base w-full text-center font-mono text-3xl font-black tracking-[0.4em] uppercase"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  'mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black transition',
                  canSubmit
                    ? 'bg-primary text-primary-foreground glow-gold hover:opacity-90'
                    : 'cursor-not-allowed bg-white/10 text-muted-foreground',
                )}
              >
                {linking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جارٍ الربط...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5" />
                    Link Device &amp; Start Watching
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Active paired devices */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <MonitorSmartphone className="h-5 w-5 text-primary" />
            الأجهزة المرتبطة النشطة (Active Paired Devices)
          </h2>
          {!loadingDevices && (
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-muted-foreground">
              {devices.length} أجهزة
            </span>
          )}
        </div>

        {loadingDevices ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/5 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            جارٍ تحميل الأجهزة...
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/5 py-12 text-center text-sm text-muted-foreground">
            لا توجد أجهزة مرتبطة حالياً. أدخل رمز المشاهدة أعلاه للبدء.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {devices.map((device) => {
              const Icon = KIND_ICON[device.kind]
              const busy = revoking === device.id
              return (
                <div
                  key={device.id}
                  className="glass flex items-center justify-between gap-4 rounded-2xl border border-border p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-bold text-foreground">{device.name}</h3>
                        {device.streaming && (
                          <span className="flex shrink-0 items-center gap-1 rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                            </span>
                            يبث الآن
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{device.location}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        آخر نشاط: {relativeTime(device.lastActive)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlink(device)}
                    disabled={busy}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
                    aria-label={`إلغاء ربط ${device.name}`}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldOff className="h-3.5 w-3.5" />
                    )}
                    إلغاء الربط
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
