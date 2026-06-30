// ============================================================================
// JWT DECODER (#15) — client-side decode only (no signature verification).
// Used by the Auth Token Decoder debug card to prove the frontend holds a
// token with the expected roles/expiry.
// ============================================================================

export type DecodedJwt = {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  expiresAt: Date | null
  isExpired: boolean
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(padded)))
  return Buffer.from(padded, 'base64').toString('utf-8')
}

export function decodeJwt(token: string): DecodedJwt | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    const exp = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null
    return {
      header,
      payload,
      expiresAt: exp,
      isExpired: exp ? exp.getTime() < Date.now() : false,
    }
  } catch {
    return null
  }
}
