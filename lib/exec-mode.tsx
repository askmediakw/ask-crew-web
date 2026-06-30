'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type ExecModeContextValue = {
  execMode: boolean
  toggleExecMode: () => void
}

const ExecModeContext = createContext<ExecModeContextValue | null>(null)

export function ExecModeProvider({ children }: { children: ReactNode }) {
  const [execMode, setExecMode] = useState(false)
  return (
    <ExecModeContext.Provider value={{ execMode, toggleExecMode: () => setExecMode((v) => !v) }}>
      {children}
    </ExecModeContext.Provider>
  )
}

export function useExecMode() {
  const ctx = useContext(ExecModeContext)
  if (!ctx) throw new Error('useExecMode must be used within ExecModeProvider')
  return ctx
}
