// ============================================================================
// SERVER-SIDE MOCK / FALLBACK HELPERS (BACKEND DEV)
// ----------------------------------------------------------------------------
// Every API route under app/api/* is currently a SCAFFOLD. Each one wraps its
// real-integration logic in `safe()` so that when an external service key is
// missing (Google Translate, ipinfo, AWS, Stripe/Tap, etc.) the route still
// returns a deterministic mock payload instead of throwing.
//
// To go live: set the relevant env var, then replace the `// TODO: BACKEND`
// block in each route with the real call. The fallback stays as a safety net.
// ============================================================================

import { NextResponse } from 'next/server'

/** Standard envelope so the frontend can always read `.mock` + `.data`. */
export function ok<T>(data: T, mock = false) {
  return NextResponse.json({ success: true, mock, data })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * Returns true when the given env var(s) are all present. Routes use this to
 * decide between the real integration and the mock fallback.
 */
export function hasKeys(...keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k]))
}

/**
 * Run `live` when keys exist; otherwise resolve `fallback`. Any thrown error
 * from `live` also degrades to `fallback` so the UI never hard-fails.
 */
export async function safe<T>(
  keys: string[],
  live: () => Promise<T>,
  fallback: () => T,
): Promise<{ value: T; mock: boolean }> {
  if (keys.length === 0 || hasKeys(...keys)) {
    try {
      return { value: await live(), mock: false }
    } catch {
      return { value: fallback(), mock: true }
    }
  }
  return { value: fallback(), mock: true }
}

/** Deterministic pseudo-random pick so mock data is stable per seed. */
export function seeded<T>(seed: string, items: T[]): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return items[h % items.length]
}
