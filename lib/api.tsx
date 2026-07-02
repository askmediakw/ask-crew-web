'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CONFIG } from '@/lib/config'
import { getAuthToken, clearAuthToken } from '@/lib/auth'
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

  // ---- DISABLED MOCK MODE - ALWAYS USE LIVE API ----
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
      // Handle token expired case
      if (response.status === 401) {
        console.warn('Token expired or invalid - clearing auth token')
        clearAuthToken()
      }
      // Try to get error message from response
      const errorData = data as { error?: string; message?: string; detail?: string }
      const errorMessage = errorData?.detail || errorData?.error || errorData?.message || `فشل في الاتصال بالخادم (${response.status})`
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
// Booking Item Type
export interface BookingItem {
  id: number;
  name: string;
  quantity: number;
  description?: string;
  price_per_day: string;
  location: string;
  type: string;
  image?: string;
  is_active: boolean;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: number;
  approved_by_email?: string;
  approved_by_fullname?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_email?: string;
  created_by_fullname?: string;
  created_by_rating_count?: number;
  created_by_rating_mean?: number;
}

// Booking Type
export interface Booking {
  id: number;
  item: number;
  item_name: string;
  user: number;
  user_email: string;
  user_fullname: string;
  user_photo?: string;
  user_rating_count?: number;
  user_rating_mean?: number;
  status: string;
  start_date: string;
  end_date: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  is_paid?: boolean;
  payment_amount?: number;
}

// Payment Types
export interface Payment {
  id: number;
  user: number;
  user_email: string;
  user_fullname: string;
  charge_id: string;
  amount: string;
  currency: string;
  description: string;
  used_points: number;
  created_at: string;
  updated_at: string;
}

export interface ContentPayment {
  id: number;
  user: number;
  user_email: string;
  user_fullname: string;
  content_type: string;
  object_id: number;
  amount: string;
  currency: string;
  description: string;
  charge_id?: string;
  used_points: number;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: number;
  booking: number;
  booking_item_name: string;
  user: number;
  user_email: string;
  user_fullname: string;
  amount: string;
  original_amount: string;
  discount_amount: string;
  reward_code?: number;
  currency: string;
  is_paid: boolean;
  charge_id?: string;
  used_points: number;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectRequest {
  id: number;
  user: number;
  user_email: string;
  user_fullname: string;
  amount: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const apiServices = {
  // POST /auth/login  → returns { tokens: { access: string }, user: any }
  login: (email: string, password: string) =>
    apiRequest<{ tokens: { access: string }, user: any }>('/auth/login', 'POST', { email, password }),

  // Booking Items
  fetchBookingItems: () => apiRequest<BookingItem[]>('/booking/items/'),
  fetchBookingItem: (id: number) => apiRequest<BookingItem>(`/booking/items/${id}/`),
  createBookingItem: (data: Partial<BookingItem>) => apiRequest<BookingItem>('/booking/items/', 'POST', data),
  updateBookingItem: (id: number, data: Partial<BookingItem>) => apiRequest<BookingItem>(`/booking/items/${id}/`, 'PUT', data),
  deleteBookingItem: (id: number) => apiRequest<void>(`/booking/items/${id}/`, 'DELETE'),

  // Bookings
  fetchBookings: () => apiRequest<Booking[]>('/booking/bookings/'),
  fetchBooking: (id: number) => apiRequest<Booking>(`/booking/bookings/${id}/`),
  createBooking: (data: Partial<Booking>) => apiRequest<Booking>('/booking/bookings/', 'POST', data),
  updateBooking: (id: number, data: Partial<Booking>) => apiRequest<Booking>(`/booking/bookings/${id}/`, 'PUT', data),
  deleteBooking: (id: number) => apiRequest<void>(`/booking/bookings/${id}/`, 'DELETE'),

  // Payments
  fetchPayments: () => apiRequest<Payment[]>('/payment/payments/'),
  fetchPayment: (id: number) => apiRequest<Payment>(`/payment/payments/${id}/`),
  createPayment: (data: Partial<Payment>) => apiRequest<Payment>('/payment/payments/', 'POST', data),
  updatePayment: (id: number, data: Partial<Payment>) => apiRequest<Payment>(`/payment/payments/${id}/`, 'PUT', data),
  deletePayment: (id: number) => apiRequest<void>(`/payment/payments/${id}/`, 'DELETE'),

  // Content Payments
  fetchContentPayments: () => apiRequest<ContentPayment[]>('/payment/content-payments/'),
  fetchContentPayment: (id: number) => apiRequest<ContentPayment>(`/payment/content-payments/${id}/`),
  createContentPayment: (data: Partial<ContentPayment>) => apiRequest<ContentPayment>('/payment/content-payments/', 'POST', data),
  updateContentPayment: (id: number, data: Partial<ContentPayment>) => apiRequest<ContentPayment>(`/payment/content-payments/${id}/`, 'PUT', data),
  deleteContentPayment: (id: number) => apiRequest<void>(`/payment/content-payments/${id}/`, 'DELETE'),

  // Booking Payments
  fetchBookingPayments: () => apiRequest<BookingPayment[]>('/payment/booking-payments/'),
  fetchBookingPayment: (id: number) => apiRequest<BookingPayment>(`/payment/booking-payments/${id}/`),
  createBookingPayment: (data: Partial<BookingPayment>) => apiRequest<BookingPayment>('/payment/booking-payments/', 'POST', data),
  updateBookingPayment: (id: number, data: Partial<BookingPayment>) => apiRequest<BookingPayment>(`/payment/booking-payments/${id}/`, 'PUT', data),
  deleteBookingPayment: (id: number) => apiRequest<void>(`/payment/booking-payments/${id}/`, 'DELETE'),

  // Collect Requests
  fetchCollectRequests: () => apiRequest<CollectRequest[]>('/payment/collect-requests/'),
  fetchCollectRequest: (id: number) => apiRequest<CollectRequest>(`/payment/collect-requests/${id}/`),
  createCollectRequest: (data: Partial<CollectRequest>) => apiRequest<CollectRequest>('/payment/collect-requests/', 'POST', data),
  updateCollectRequest: (id: number, data: Partial<CollectRequest>) => apiRequest<CollectRequest>(`/payment/collect-requests/${id}/`, 'PUT', data),
  deleteCollectRequest: (id: number) => apiRequest<void>(`/payment/collect-requests/${id}/`, 'DELETE'),

  // GET /plans → returns all plans
  fetchPlans: () => apiRequest('/plans', 'GET'),

  // GET /plans/:id → returns single plan
  fetchPlan: (id: string) => apiRequest(`/plans/${id}`, 'GET'),

  // POST /plans/ → create plan
  createPlan: (data: unknown) => apiRequest('/plans', 'POST', data),

  // PUT /plans/:id → update plan
  updatePlan: (id: string | number, data: unknown) => apiRequest(`/plans/${id}`, 'PUT', data),

  // DELETE /plans/:id → delete plan
  deletePlan: (id: string | number) => apiRequest(`/plans/${id}`, 'DELETE'),

  // TODO: BACKEND - GET /analytics/summary → { mrr, churnRate, activeUsers }
  fetchAnalytics: () =>
    apiRequest<{ mrr: string; churnRate: string; activeUsers: string }>('/analytics/summary', 'GET'),

  // TODO: BACKEND - GET /companies
  fetchCompanies: () => apiRequest('/companies', 'GET'),

  // TODO: BACKEND - POST /companies
  createCompany: (data: unknown) => apiRequest('/companies', 'POST', data),

  // TODO: BACKEND - DELETE /companies/:id
  deleteCompany: (id: number) => apiRequest(`/companies/${id}`, 'DELETE'),

  // BACKEND - GET /profiles
  fetchUsers: () => apiRequest('/profiles', 'GET'),

  // BACKEND - GET /profiles/:id
  fetchUser: (id: number) => apiRequest(`/profiles/${id}`, 'GET'),

  // BACKEND - POST /profiles
  createUser: (data: unknown) => apiRequest('/profiles', 'POST', data),

  // BACKEND - PUT /profiles/:id
  updateUser: (id: number, data: unknown) => apiRequest(`/profiles/${id}`, 'PUT', data),

  // BACKEND - DELETE /profiles/:id
  deleteUser: (id: number) => apiRequest(`/profiles/${id}`, 'DELETE'),

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
  
  // Content Catalog (Posters)
  fetchContentCatalog: (page: number = 1, pageSize: number = 10) => 
    apiRequest(`/content-catalog?page=${page}&page_size=${pageSize}`, 'GET'),
  
  fetchContentCatalogItem: (id: number) => apiRequest(`/content-catalog/${id}/`, 'GET'),
  
  createContentCatalogItem: (data: unknown) => apiRequest('/content-catalog/', 'POST', data),
  
  updateContentCatalogItem: (id: number, data: unknown) => apiRequest(`/content-catalog/${id}/`, 'PUT', data),
  
  deleteContentCatalogItem: (id: number) => apiRequest(`/content-catalog/${id}/`, 'DELETE'),

  // Movies
  fetchMovies: () => apiRequest('/content/movies/', 'GET'),
  fetchMovie: (id: number) => apiRequest(`/content/movies/${id}/`, 'GET'),
  createMovie: (data: unknown) => apiRequest('/content/movies/', 'POST', data),
  updateMovie: (id: number, data: unknown) => apiRequest(`/content/movies/${id}/`, 'PUT', data),
  deleteMovie: (id: number) => apiRequest(`/content/movies/${id}/`, 'DELETE'),

  // Series
  fetchSeries: () => apiRequest('/content/series/', 'GET'),
  fetchSeriesItem: (id: number) => apiRequest(`/content/series/${id}/`, 'GET'),
  createSeries: (data: unknown) => apiRequest('/content/series/', 'POST', data),
  updateSeries: (id: number, data: unknown) => apiRequest(`/content/series/${id}/`, 'PUT', data),
  deleteSeries: (id: number) => apiRequest(`/content/series/${id}/`, 'DELETE'),

  // Banners
  fetchBanners: () => apiRequest('/content/banners/', 'GET'),
  fetchBanner: (id: number) => apiRequest(`/content/banners/${id}/`, 'GET'),
  createBanner: (data: unknown) => apiRequest('/content/banners/', 'POST', data),
  updateBanner: (id: number, data: unknown) => apiRequest(`/content/banners/${id}/`, 'PUT', data),
  deleteBanner: (id: number) => apiRequest(`/content/banners/${id}/`, 'DELETE'),

  // Advertise
  fetchAdvertises: () => apiRequest('/content/advertise/', 'GET'),
  fetchAdvertise: (id: number) => apiRequest(`/content/advertise/${id}/`, 'GET'),
  createAdvertise: (data: unknown) => apiRequest('/content/advertise/', 'POST', data),
  updateAdvertise: (id: number, data: unknown) => apiRequest(`/content/advertise/${id}/`, 'PUT', data),
  deleteAdvertise: (id: number) => apiRequest(`/content/advertise/${id}/`, 'DELETE'),

  // Content Ratings
  fetchContentRatings: () => apiRequest('/content/ratings/', 'GET'),
  fetchContentRating: (id: number) => apiRequest(`/content/ratings/${id}/`, 'GET'),
  createContentRating: (data: unknown) => apiRequest('/content/ratings/', 'POST', data),
  updateContentRating: (id: number, data: unknown) => apiRequest(`/content/ratings/${id}/`, 'PUT', data),
  deleteContentRating: (id: number) => apiRequest(`/content/ratings/${id}/`, 'DELETE'),

  // Chat - Admin Endpoints
  fetchChatRooms: () => apiRequest('/chat/admin/rooms/', 'GET'),
  fetchChatRoom: (id: number) => apiRequest(`/chat/admin/rooms/${id}/`, 'GET'),
  createChatRoom: (data: unknown) => apiRequest('/chat/admin/rooms/', 'POST', data),
  updateChatRoom: (id: number, data: unknown) => apiRequest(`/chat/admin/rooms/${id}/`, 'PUT', data),
  deleteChatRoom: (id: number) => apiRequest(`/chat/admin/rooms/${id}/`, 'DELETE'),

  fetchMessages: () => apiRequest('/chat/admin/messages/', 'GET'),
  fetchMessage: (id: number) => apiRequest(`/chat/admin/messages/${id}/`, 'GET'),
  createMessage: (data: unknown) => apiRequest('/chat/admin/messages/', 'POST', data),
  updateMessage: (id: number, data: unknown) => apiRequest(`/chat/admin/messages/${id}/`, 'PUT', data),
  deleteMessage: (id: number) => apiRequest(`/chat/admin/messages/${id}/`, 'DELETE'),

  fetchMessageFiles: () => apiRequest('/chat/admin/message-files/', 'GET'),
  fetchMessageFile: (id: number) => apiRequest(`/chat/admin/message-files/${id}/`, 'GET'),
  createMessageFile: (data: unknown) => apiRequest('/chat/admin/message-files/', 'POST', data),
  updateMessageFile: (id: number, data: unknown) => apiRequest(`/chat/admin/message-files/${id}/`, 'PUT', data),
  deleteMessageFile: (id: number) => apiRequest(`/chat/admin/message-files/${id}/`, 'DELETE'),

  // Community - Questions
  fetchQuestions: () => apiRequest('/community/questions/', 'GET'),
  fetchQuestion: (id: number) => apiRequest(`/community/questions/${id}/`, 'GET'),
  createQuestion: (data: unknown) => apiRequest('/community/questions/', 'POST', data),
  updateQuestion: (id: number, data: unknown) => apiRequest(`/community/questions/${id}/`, 'PUT', data),
  deleteQuestion: (id: number) => apiRequest(`/community/questions/${id}/`, 'DELETE'),

  // Community - Answers
  fetchAnswers: () => apiRequest('/community/answers/', 'GET'),
  fetchAnswer: (id: number) => apiRequest(`/community/answers/${id}/`, 'GET'),
  createAnswer: (data: unknown) => apiRequest('/community/answers/', 'POST', data),
  updateAnswer: (id: number, data: unknown) => apiRequest(`/community/answers/${id}/`, 'PUT', data),
  deleteAnswer: (id: number) => apiRequest(`/community/answers/${id}/`, 'DELETE'),

  // Community - Jobs
  fetchJobs: () => apiRequest('/community/jobs/', 'GET'),
  fetchJob: (id: number) => apiRequest(`/community/jobs/${id}/`, 'GET'),
  createJob: (data: unknown) => apiRequest('/community/jobs/', 'POST', data),
  updateJob: (id: number, data: unknown) => apiRequest(`/community/jobs/${id}/`, 'PUT', data),
  deleteJob: (id: number) => apiRequest(`/community/jobs/${id}/`, 'DELETE'),

  // Workshops
  fetchWorkshops: () => apiRequest('/workshop/', 'GET'),
  fetchWorkshop: (id: number) => apiRequest(`/workshop/${id}/`, 'GET'),
  createWorkshop: (data: unknown) => apiRequest('/workshop/', 'POST', data),
  updateWorkshop: (id: number, data: unknown) => apiRequest(`/workshop/${id}/`, 'PUT', data),
  deleteWorkshop: (id: number) => apiRequest(`/workshop/${id}/`, 'DELETE'),

  // Workshop Registrations
  fetchWorkshopRegistrations: (workshopId?: number) => apiRequest(workshopId ? `/workshop/registrations/?workshop=${workshopId}` : '/workshop/registrations/', 'GET'),
  fetchWorkshopRegistration: (id: number) => apiRequest(`/workshop/registrations/${id}/`, 'GET'),
  createWorkshopRegistration: (data: unknown) => apiRequest('/workshop/registrations/', 'POST', data),
  updateWorkshopRegistration: (id: number, data: unknown) => apiRequest(`/workshop/registrations/${id}/`, 'PUT', data),
  deleteWorkshopRegistration: (id: number) => apiRequest(`/workshop/registrations/${id}/`, 'DELETE'),

  // Community - Job Applications
  fetchJobApplications: () => apiRequest('/community/applications/', 'GET'),
  fetchJobApplication: (id: number) => apiRequest(`/community/applications/${id}/`, 'GET'),
  createJobApplication: (data: unknown) => apiRequest('/community/applications/', 'POST', data),
  updateJobApplication: (id: number, data: unknown) => apiRequest(`/community/applications/${id}/`, 'PUT', data),
  deleteJobApplication: (id: number) => apiRequest(`/community/applications/${id}/`, 'DELETE'),

  // Favorites
  fetchFavorites: () => apiRequest('/content/favorites/', 'GET'),
  addFavorite: (data: unknown) => apiRequest('/content/favorites/add/', 'POST', data),
  removeFavorite: (data: unknown) => apiRequest('/content/favorites/remove/', 'POST', data),

  // Rewards
  fetchRewards: () => apiRequest<RewardType[]>('/reward/rewards/'),
  fetchReward: (id: number) => apiRequest<RewardType>(`/reward/rewards/${id}/`),
  createReward: (data: Partial<RewardType>) => apiRequest<RewardType>('/reward/rewards/', 'POST', data),
  updateReward: (id: number, data: Partial<RewardType>) => apiRequest<RewardType>(`/reward/rewards/${id}/`, 'PUT', data),
  deleteReward: (id: number) => apiRequest<void>(`/reward/rewards/${id}/`, 'DELETE'),

  // Reward Codes
  fetchRewardCodes: () => apiRequest<RewardCodeType[]>('/reward/codes/'),
  fetchRewardCode: (id: number) => apiRequest<RewardCodeType>(`/reward/codes/${id}/`),
  createRewardCode: (data: { reward: number; code: string; is_active: boolean }) => 
    apiRequest<RewardCodeType>('/reward/codes/', 'POST', { reward_id: data.reward, code: data.code, is_active: data.is_active }),
  updateRewardCode: (id: number, data: Partial<RewardCodeType>) => apiRequest<RewardCodeType>(`/reward/codes/${id}/`, 'PUT', data),
  deleteRewardCode: (id: number) => apiRequest<void>(`/reward/codes/${id}/`, 'DELETE'),

  // Points History
  fetchPointsHistory: () => apiRequest<PointsHistoryType[]>('/reward/points-history/'),
  fetchPointsHistoryItem: (id: number) => apiRequest<PointsHistoryType>(`/reward/points-history/${id}/`),
  createPointsHistory: (data: Partial<PointsHistoryType>) => apiRequest<PointsHistoryType>('/reward/points-history/', 'POST', data),
  updatePointsHistory: (id: number, data: Partial<PointsHistoryType>) => apiRequest<PointsHistoryType>(`/reward/points-history/${id}/`, 'PUT', data),
  deletePointsHistory: (id: number) => apiRequest<void>(`/reward/points-history/${id}/`, 'DELETE'),
}

// Reward Types
export interface RewardType {
  id: number;
  name: string;
  description: string;
  points: number;
  image: string;
  is_active: boolean;
  rate: number;
  content: 'movie' | 'advertise' | 'season' | 'all_content' | 'booking';
  created_at: string;
  updated_at: string;
}

export interface RewardCodeType {
  id: number;
  code: string;
  user?: number | null;
  reward: RewardType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointsHistoryType {
  id: number;
  title: string;
  user: number;
  points: number;
  created_at: string;
  updated_at: string;
}

// Default export for easier import
export default apiServices
