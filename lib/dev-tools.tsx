'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onApiCall, onAction, recordAction, type ApiCallRecord, type ActionRecord } from '@/lib/dev-bus'

// ============================================================================
// DEV TOOLS PROVIDER
// ----------------------------------------------------------------------------
// Central store for the monitoring suite:
//  - apiCalls / lastLatency       → Raw JSON Inspector (#11), Latency badge (#12)
//  - serverStatus                 → Server Status Ping (#16)
//  - simulatedRole                → Role Simulator (#17)
//  - actions                      → Frontend Action Audit Trail (#20)
// ============================================================================

export type ServerStatus = 'online' | 'degraded' | 'offline'
export const SIM_ROLES = ['Super Admin', 'Manager', 'VIP User', 'Standard User', 'Viewer'] as const
export type SimRole = (typeof SIM_ROLES)[number]

type DevToolsValue = {
  apiCalls: ApiCallRecord[]
  lastLatency: number | null
  actions: ActionRecord[]
  serverStatus: ServerStatus
  simulatedRole: SimRole
  setSimulatedRole: (r: SimRole) => void
  logAction: (label: string, detail?: string) => void
  clearActions: () => void
}

const DevToolsContext = createContext<DevToolsValue | null>(null)

export function useDevTools() {
  const ctx = useContext(DevToolsContext)
  if (!ctx) throw new Error('useDevTools must be used within <DevToolsProvider>')
  return ctx
}

export function DevToolsProvider({ children }: { children: ReactNode }) {
  const [apiCalls, setApiCalls] = useState<ApiCallRecord[]>([])
  const [actions, setActions] = useState<ActionRecord[]>([])
  const [lastLatency, setLastLatency] = useState<number | null>(null)
  const [serverStatus, setServerStatus] = useState<ServerStatus>('online')
  const [simulatedRole, setSimulatedRole] = useState<SimRole>('Super Admin')

  // Subscribe to the API bus (latency + raw payloads).
  useEffect(() => {
    const off = onApiCall((rec) => {
      setApiCalls((prev) => [rec, ...prev].slice(0, 50))
      setLastLatency(rec.ms)
      setServerStatus(!rec.ok ? 'offline' : rec.ms > 800 ? 'degraded' : 'online')
    })
    return off
  }, [])

  // Subscribe to the action bus (audit trail).
  useEffect(() => {
    const off = onAction((rec) => setActions((prev) => [rec, ...prev].slice(0, 100)))
    return off
  }, [])

  return (
    <DevToolsContext.Provider
      value={{
        apiCalls,
        lastLatency,
        actions,
        serverStatus,
        simulatedRole,
        setSimulatedRole,
        logAction: recordAction,
        clearActions: () => setActions([]),
      }}
    >
      {children}
    </DevToolsContext.Provider>
  )
}
