'use client'

import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { ShieldCheck, Copy, Check, Smartphone, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'

// #41 — Two-factor authentication (2FA) setup. Shows a TOTP otpauth:// QR for
// authenticator apps, a copyable manual secret, and a 6-digit verification
// step. The secret here is mock/illustrative (TODO: BACKEND — issue the real
// TOTP secret server-side and verify the code via /api/auth/2fa/verify).
function randomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let out = ''
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function TwoFactorSetup() {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(false)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Generated only on the client (post-mount) so the random value never causes
  // a server/client hydration mismatch.
  const [secret, setSecret] = useState('')
  useEffect(() => {
    setSecret(randomSecret())
  }, [])
  const otpauth = secret
    ? `otpauth://totp/AskCrew:exec@askcrew.com?secret=${secret}&issuer=AskCrew&algorithm=SHA1&digits=6&period=30`
    : ''

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  const verify = () => {
    if (code.length !== 6) {
      toast.error('أدخل رمزاً مكوّناً من 6 أرقام')
      return
    }
    // TODO(api): POST /api/auth/2fa/verify { code } — mock-accept any 6 digits.
    setEnabled(true)
    toast.success('تم تفعيل المصادقة الثنائية بنجاح')
  }

  const disable = () => {
    setEnabled(false)
    setCode('')
    toast.info('تم إيقاف المصادقة الثنائية')
  }

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', enabled ? 'bg-success/15' : 'bg-white/5')}>
            <ShieldCheck className={cn('h-5 w-5', enabled ? 'text-success' : 'text-muted-foreground')} />
          </span>
          <div className="leading-tight">
            <h3 className="font-bold text-foreground">المصادقة الثنائية (2FA)</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">طبقة حماية إضافية عبر تطبيق المصادقة (Google Authenticator، Authy)</p>
            <span className={cn('mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold', enabled ? 'bg-success/15 text-success' : 'bg-white/5 text-muted-foreground')}>
              {enabled ? 'مُفعّلة' : 'غير مُفعّلة'}
            </span>
          </div>
        </div>
        {enabled && (
          <button
            onClick={disable}
            className="shrink-0 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-white"
          >
            إيقاف
          </button>
        )}
      </div>

      {!enabled && (
        <div className="mt-5 grid gap-5 border-t border-border pt-5 md:grid-cols-[auto_1fr]">
          {/* QR for authenticator apps */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[172px] w-[172px] items-center justify-center rounded-xl border border-border bg-white p-3">
              {otpauth ? (
                <QRCode value={otpauth} size={148} level="M" />
              ) : (
                <span className="text-xs text-muted-foreground">...</span>
              )}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              امسح الرمز بتطبيق المصادقة
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">أو أدخل المفتاح يدوياً:</p>
              <div className="flex items-center gap-2">
                <code dir="ltr" className="flex-1 rounded-lg border border-border bg-white/5 px-3 py-2 text-left font-mono text-sm tracking-widest text-foreground">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  aria-label="نسخ المفتاح"
                  className={cn('flex h-9 w-9 items-center justify-center rounded-lg border border-border transition', copied ? 'bg-success text-white' : 'text-muted-foreground hover:bg-white/10 hover:text-foreground')}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <KeyRound className="h-3 w-3" />
                أدخل الرمز المكوّن من 6 أرقام للتأكيد:
              </p>
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  dir="ltr"
                  className="input-base flex-1 text-center font-mono text-lg tracking-[0.5em]"
                />
                <button
                  onClick={verify}
                  className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                >
                  تأكيد وتفعيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
