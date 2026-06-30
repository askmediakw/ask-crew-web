'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CONFIG } from '@/lib/config'
import { getAuthToken } from '@/lib/auth'
import { recordApiCall } from '@/lib/dev-bus'
import { getMockMode } from '@/lib/mock-mode'

// ============================================================================
// GLOBAL FEEDBACK CONTEXT (loading overlay + error toast)
// ----------------------------------------------------------------------------
// Mounted once in <AppShell>. Any component can show the global processing
// overlay or an error toast without rendering its own UI.
// ============================================================================

type FeedbackContextValue = {
  isLoading: boolean
  errorMessage: string | null
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within <FeedbackProvider>')
  return ctx
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <FeedbackContext.Provider
      value={{
        isLoading,
        errorMessage,
        setLoading: setIsLoading,
        setError: setErrorMessage,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}

// ============================================================================
// HTTP METHODS
// ============================================================================
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// ============================================================================
// CORE REQUEST (BACKEND DEV: this is the single fetch wrapper)
// ----------------------------------------------------------------------------
// - Automatically attaches the JWT Bearer token from lib/auth.
// - While CONFIG.ENABLE_MOCK_DATA is true it returns a simulated success after
//   CONFIG.MOCK_DELAY ms. Flip the flag to false to hit the real API.
// ============================================================================
export async function apiRequest<T = unknown>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body: unknown = null,
): Promise<T> {
  const fullUrl = `${CONFIG.API_BASE_URL}${endpoint}`
  console.log('Making API request to:', fullUrl, { method, body, API_BASE_URL: CONFIG.API_BASE_URL })
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const started = performance.now()

  // ---- MOCK MODE (toggled at runtime via the header "Mock vs Live" switch) --
  if (getMockMode()) {
    await new Promise((res) => setTimeout(res, CONFIG.MOCK_DELAY))
    const mock = { success: true, mock: true, endpoint, method } as unknown as T
    recordApiCall({
      endpoint,
      method,
      status: 200,
      ms: Math.round(performance.now() - started),
      ok: true,
      response: mock,
    })
    return mock
  }

  // ---- PRODUCTION MODE ------------------------------------------------------
  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    })
    let data: unknown = null
    try {
      data = await response.json()
    } catch {
      // If JSON parsing fails, leave data as null
    }
    recordApiCall({
      endpoint,
      method,
      status: response.status,
      ms: Math.round(performance.now() - started),
      ok: response.ok,
      response: data,
    })
    if (!response.ok) {
      // Try to get error message from response
      const errorData = data as { error?: string; message?: string }
      const errorMessage = errorData?.error || errorData?.message || `فشل في الاتصال بالخادم (${response.status})`
      throw new Error(errorMessage)
    }
    return data as T
  } catch (err) {
    recordApiCall({
      endpoint,
      method,
      status: 0,
      ms: Math.round(performance.now() - started),
      ok: false,
      response: String(err),
    })
    throw err
  }
}

// ============================================================================
// useApi HOOK (BACKEND DEV: USE THIS FOR ALL REQUESTS)
// ----------------------------------------------------------------------------
// const { request } = useApi()
// await request('/staff/123/role', 'PUT', { role: 'Admin' })
//
// `request` drives the GLOBAL loading overlay + error toast automatically, so
// individual call sites stay a single line. Pass { silent: true } to opt out
// of the overlay for background calls.
// ============================================================================
export function useApi() {
  const { setLoading, setError } = useFeedback()

  const request = useCallback(
    async <T = unknown,>(
      endpoint: string,
      method: HttpMethod = 'GET',
      body: unknown = null,
      options: { silent?: boolean; errorMessage?: string } = {},
    ): Promise<T> => {
      if (!options.silent) setLoading(true)
      setError(null)
      try {
        return await apiRequest<T>(endpoint, method, body)
      } catch (err) {
        const message =
          options.errorMessage ??
          (err instanceof Error ? err.message : 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.')
        setError(message)
        throw err
      } finally {
        if (!options.silent) setLoading(false)
      }
    },
    [setLoading, setError],
  )

  return { request }
}

// ============================================================================
// API SERVICES (BACKEND DEV: REPLACE MOCK ENDPOINTS WITH REAL ROUTES)
// ----------------------------------------------------------------------------
// A central, typed map of every endpoint the dashboard calls. Each entry is a
// thin wrapper around apiRequest so the call sites read like business actions.
// The TODO comment above each one is the exact route + verb to implement.
// ============================================================================
export const apiServices = {
  // POST /auth/login  → returns { tokens: { access: string }, user: any }
  login: (email: string, password: string) =>
    apiRequest<{ tokens: { access: string }, user: any }>('/auth/login', 'POST', { email, password }),

  // GET /auth/plans → returns all plans
  fetchPlans: () => apiRequest('/auth/plans', 'GET'),

  // GET /auth/plans/:id → returns single plan
  fetchPlan: (id: string) => apiRequest(`/auth/plans/${id}`, 'GET'),

  // POST /auth/plans/ → create plan
  createPlan: (data: unknown) => apiRequest('/auth/plans', 'POST', data),

  // PUT /auth/plans/:id → update plan
  updatePlan: (id: string | number, data: unknown) => apiRequest(`/auth/plans/${id}`, 'PUT', data),

  // DELETE /auth/plans/:id → delete plan
  deletePlan: (id: string | number) => apiRequest(`/auth/plans/${id}`, 'DELETE'),

  // TODO: BACKEND - GET /analytics/summary → { mrr, churnRate, activeUsers }
  fetchAnalytics: () =>
    apiRequest<{ mrr: string; churnRate: string; activeUsers: string }>('/analytics/summary', 'GET'),

  // TODO: BACKEND - GET /companies
  fetchCompanies: () => apiRequest('/companies', 'GET'),

  // TODO: BACKEND - POST /companies
  createCompany: (data: unknown) => apiRequest('/companies', 'POST', data),

  // TODO: BACKEND - DELETE /companies/:id
  deleteCompany: (id: number) => apiRequest(`/companies/${id}`, 'DELETE'),

  // TODO: BACKEND - GET /users
  fetchUsers: () => apiRequest('/users', 'GET'),

  // TODO: BACKEND - POST /plans/clone
  clonePlan: (planData: unknown) => apiRequest('/plans/clone', 'POST', planData),

  // TODO: BACKEND - PUT /plans/:id
  savePlan: (id: string, data: unknown) => apiRequest(`/plans/${id}`, 'PUT', data),

  // TODO: BACKEND - PUT /staff/:id/role
  updateUserRole: (userId: number, role: string) =>
    apiRequest(`/staff/${userId}/role`, 'PUT', { role }),

  // TODO: BACKEND - POST /staff
  createStaff: (data: unknown) => apiRequest('/staff', 'POST', data),

  // TODO: BACKEND - DELETE /staff/:id
  deleteStaff: (userId: number) => apiRequest(`/staff/${userId}/`, 'DELETE'),

  // TODO: BACKEND - POST /auth/force-logout
  forceLogoutUser: (userId: number) => apiRequest('/auth/force-logout', 'POST', { userId }),
}
