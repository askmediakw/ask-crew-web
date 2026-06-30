'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CONFIG } from '@/lib/config'

/**
 * Runtime "Mock vs Live" switch.
 *
 * `CONFIG.ENABLE_MOCK_DATA` is the build-time default, but the dashboard lets
 * the developer flip between mock dummy data and the live backend API at
 * runtime via the header toggle. The choice is persisted to localStorage.
 *
 * The API layer (lib/api.tsx) reads `getMockMode()` — a plain non-React getter
 * so it never has to import React context.
 */

const STORAGE_KEY = 'askcrew_mock_mode'

let mockEnabled: boolean = CONFIG.ENABLE_MOCK_DATA
const listeners = new Set<(v: boolean) => void>()

// Hydrate from localStorage as early as possible (client only).
if (typeof window !== 'undefined') {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved !== null) mockEnabled = saved === 'true'
}

/** Non-React getter used by the API request wrapper. */
export function getMockMode(): boolean {
  return mockEnabled
}

/** Update the global mock-mode flag and notify subscribers. */
export function setMockMode(value: boolean) {
  mockEnabled = value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  }
  listeners.forEach((fn) => fn(value))
}

function subscribe(fn: (v: boolean) => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

type MockModeContextValue = {
  mockMode: boolean
  toggleMockMode: () => void
  setMockMode: (v: boolean) => void
}

const MockModeContext = createContext<MockModeContextValue | null>(null)

export function MockModeProvider({ children }: { children: ReactNode }) {
  const [mockMode, setLocal] = useState<boolean>(mockEnabled)

  useEffect(() => {
    // Sync state with the store after hydration + on external changes.
    setLocal(mockEnabled)
    return subscribe(setLocal)
  }, [])

  const value: MockModeContextValue = {
    mockMode,
    toggleMockMode: () => setMockMode(!mockEnabled),
    setMockMode: (v: boolean) => setMockMode(v),
  }

  return <MockModeContext.Provider value={value}>{children}</MockModeContext.Provider>
}

export function useMockMode() {
  const ctx = useContext(MockModeContext)
  if (!ctx) throw new Error('useMockMode must be used within MockModeProvider')
  return ctx
}
