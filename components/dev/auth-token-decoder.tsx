'use client'

import { useEffect, useState } from 'react'
import { KeyRound, ShieldCheck, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAuthToken } from '@/lib/auth'
import { decodeJwt, type DecodedJwt } from '@/lib/jwt'

// ============================================================================
// AUTH TOKEN DECODER (#15)
// ----------------------------------------------------------------------------
// Reads the current JWT, decodes it client-side, and shows roles + expiry —
// proof the frontend holds a valid token with the right access.
// ============================================================================

export function AuthTokenDecoder() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const t = getAuthToken() ?? ''
    setToken(t)
    if (t) setDecoded(decodeJwt(t))
  }, [])

  const handleChange = (value: string) => {
    setToken(value)
    setTouched(true)
    setDecoded(value ? decodeJwt(value) : null)
  }

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="mb-4 flex items-center gap-2 font-black text-foreground">
        <KeyRound className="h-5 w-5 text-primary" />
        فك تشفير رمز الدخول (JWT)
      </h3>

      <textarea
        value={token}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="الصق رمز JWT هنا أو سيُقرأ تلقائياً من الجلسة..."
        rows={3}
        className="input-base mb-4 py-2.5 font-mono text-xs"
      />

      {token && !decoded && touched && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
          الرمز غير صالح أو ليس بصيغة JWT.
        </p>
      )}

      {decoded && (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold',
              decoded.isExpired
                ? 'bg-destructive/10 text-destructive'
                : 'bg-success/10 text-success',
            )}
          >
            {decoded.isExpired ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {decoded.isExpired ? 'الرمز منتهي الصلاحية' : 'الرمز صالح'}
            {decoded.expiresAt && (
              <span className="font-mono text-xs font-normal opacity-80">
                · ينتهي {decoded.expiresAt.toLocaleString('ar-EG')}
              </span>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payload</p>
            <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-success scrollbar-thin">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
