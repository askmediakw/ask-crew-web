// ============================================================================
// AUTH & TOKEN MANAGER
// ============================================================================
// After a successful login response from your API, call setAuthToken(token).
// useApi() (see lib/api.tsx) automatically attaches it as a Bearer header on
// every request, so you never write auth boilerplate per-call.
// ============================================================================

const TOKEN_KEY = 'executive_os_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  // Check if we have a valid auth token (JWT)
  const token = getAuthToken()
  if (!token) return false
  return token.length > 0
}