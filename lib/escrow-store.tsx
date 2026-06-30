'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '@/services/api'
import type {
  WalletData,
  EscrowTransaction,
  BankDetails,
  Dispute,
  EvidenceMessage,
  DisputeOutcome,
} from '@/types'

// ============================================================================
// Escrow & Financial System — client state store (CORE module).
//
// STRICT SEPARATION OF CONCERNS: this store holds NO hardcoded data and NO
// business mock logic. It is a thin client cache that (1) bootstraps from the
// centralized service layer (`@/services/api`) and (2) routes every mutation
// through that same layer, then syncs the returned server state into React.
//
// BACKEND DEV: you never touch this file. Swap the mock bodies in
// `services/api.ts` for real endpoints and this store keeps working as-is.
// ============================================================================

// Re-export domain types so existing imports from this module keep resolving.
export type {
  EscrowTransaction,
  BankDetails,
  Dispute,
  EvidenceMessage,
  DisputeOutcome,
  WalletData,
} from '@/types'
export type { EscrowStatus, DisputeStatus, EvidenceAuthor } from '@/types'

type EscrowContextValue = {
  /** True during the initial wallet + disputes fetch. */
  loading: boolean
  // Balances (KWD)
  pendingEscrow: number
  available: number
  totalWithdrawn: number
  commissionRate: number
  // Sub-systems
  ledger: EscrowTransaction[]
  disputes: Dispute[]
  bank: BankDetails
  financiallyVerified: boolean
  // Derived gate
  canWithdraw: boolean
  // Actions (all async — they call the service layer then sync state)
  refresh: () => Promise<void>
  saveBankDetails: (details: Omit<BankDetails, 'verified'>) => Promise<void>
  withdraw: () => Promise<number>
  releaseProject: (txnId: string) => Promise<void>
  openDispute: (txnId: string, reason: string) => Promise<void>
  addEvidence: (disputeId: string, msg: Omit<EvidenceMessage, 'id' | 'time'>) => Promise<void>
  resolveDispute: (disputeId: string, outcome: DisputeOutcome) => Promise<void>
  setFinanciallyVerified: (value: boolean) => Promise<void>
}

const EscrowContext = createContext<EscrowContextValue | null>(null)

export function EscrowProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  // Bootstrap the client cache from the service layer once on mount.
  const refresh = useCallback(async () => {
    const [walletData, disputeData] = await Promise.all([api.fetchWalletData(), api.fetchDisputes()])
    setWallet(walletData)
    setDisputes(disputeData)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([api.fetchWalletData(), api.fetchDisputes()])
      .then(([walletData, disputeData]) => {
        if (!active) return
        setWallet(walletData)
        setDisputes(disputeData)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // -- Derived values (safe defaults while the initial fetch is in flight) ----
  const pendingEscrow = wallet?.pendingEscrowKwd ?? 0
  const available = wallet?.availableKwd ?? 0
  const totalWithdrawn = wallet?.totalWithdrawnKwd ?? 0
  const commissionRate = wallet?.commissionRate ?? 0
  const ledger = useMemo(() => wallet?.ledger ?? [], [wallet])
  const bank = wallet?.bank ?? { iban: '', bankName: '', accountHolder: '', verified: false }
  const financiallyVerified = wallet?.financiallyVerified ?? false
  const canWithdraw = financiallyVerified && bank.verified && available > 0

  // -- Actions: delegate to the service layer, then sync returned state -------
  const saveBankDetails: EscrowContextValue['saveBankDetails'] = useCallback(async (details) => {
    const saved = await api.saveBankDetails(details)
    setWallet((prev) => (prev ? { ...prev, bank: saved } : prev))
  }, [])

  const withdraw: EscrowContextValue['withdraw'] = useCallback(async () => {
    const before = wallet?.availableKwd ?? 0
    const updated = await api.requestWithdrawal(wallet?.bank.iban ?? '')
    setWallet(updated)
    return before
  }, [wallet])

  const releaseProject: EscrowContextValue['releaseProject'] = useCallback(async (txnId) => {
    const updated = await api.releaseProjectFunds(txnId)
    setWallet(updated)
  }, [])

  const openDispute: EscrowContextValue['openDispute'] = useCallback(async (txnId, reason) => {
    const dispute = await api.openDispute(txnId, reason)
    setDisputes((prev) => [dispute, ...prev])
    // Re-pull wallet so the ledger row flips to "disputed".
    const updated = await api.fetchWalletData()
    setWallet(updated)
  }, [])

  const addEvidence: EscrowContextValue['addEvidence'] = useCallback(async (disputeId, msg) => {
    const entry = await api.addDisputeEvidence(disputeId, msg)
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, evidence: [...d.evidence, entry] } : d)),
    )
  }, [])

  const resolveDispute: EscrowContextValue['resolveDispute'] = useCallback(async (disputeId, outcome) => {
    const { dispute, wallet: updatedWallet } = await api.resolveDispute(disputeId, outcome)
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? dispute : d)))
    setWallet(updatedWallet)
  }, [])

  const setFinanciallyVerified: EscrowContextValue['setFinanciallyVerified'] = useCallback(async (value) => {
    const updated = await api.setFinancialVerification(value)
    setWallet(updated)
  }, [])

  const value: EscrowContextValue = {
    loading,
    pendingEscrow,
    available,
    totalWithdrawn,
    commissionRate,
    ledger,
    disputes,
    bank,
    financiallyVerified,
    canWithdraw,
    refresh,
    saveBankDetails,
    withdraw,
    releaseProject,
    openDispute,
    addEvidence,
    resolveDispute,
    setFinanciallyVerified,
  }

  return <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
}

export function useEscrow() {
  const ctx = useContext(EscrowContext)
  if (!ctx) throw new Error('useEscrow must be used within an EscrowProvider')
  return ctx
}
