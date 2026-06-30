// ============================================================================
// DEV BUS — a tiny framework-agnostic pub/sub used by the API layer to report
// activity (latency, raw payloads, errors) and by any UI to record user
// actions. Kept React-free so lib/api.tsx can import it without circular deps.
// ============================================================================

export type ApiCallRecord = {
  id: string
  endpoint: string
  method: string
  status: number
  ms: number
  ok: boolean
  response: unknown
  at: number
}

export type ActionRecord = {
  id: string
  label: string
  detail?: string
  at: number
}

type Listener<T> = (payload: T) => void

const apiListeners = new Set<Listener<ApiCallRecord>>()
const actionListeners = new Set<Listener<ActionRecord>>()

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

/** Called by the API layer after every request resolves or fails. */
export function recordApiCall(record: Omit<ApiCallRecord, 'id' | 'at'>) {
  const full: ApiCallRecord = { ...record, id: uid(), at: Date.now() }
  apiListeners.forEach((l) => l(full))
}

/** Called by any component to log a user-initiated action (audit trail). */
export function recordAction(label: string, detail?: string) {
  const full: ActionRecord = { id: uid(), label, detail, at: Date.now() }
  actionListeners.forEach((l) => l(full))
}

export function onApiCall(listener: Listener<ApiCallRecord>): () => void {
  apiListeners.add(listener)
  return () => {
    apiListeners.delete(listener)
  }
}

export function onAction(listener: Listener<ActionRecord>): () => void {
  actionListeners.add(listener)
  return () => {
    actionListeners.delete(listener)
  }
}
