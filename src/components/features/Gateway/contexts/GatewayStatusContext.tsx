import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react'
import { GatewayStatus, DEFAULT_GATEWAY_STATUS } from '../gatewayPageState'
import { mergeErrorHistory, formatGatewayTimestamp } from '../gatewayPageUtils'

interface GatewayStatusContextValue {
  // State
  status: GatewayStatus
  appliedRuntimeSnapshot: string | null
  lastStatusSyncAt: string
  errorHistory: any[]

  // Computed
  latestErrorEntry: any | null

  // Actions
  setStatus: (status: GatewayStatus) => void
  setAppliedRuntimeSnapshot: (snapshot: string | null) => void
  setLastStatusSyncAt: (timestamp: string) => void
  setErrorHistory: (history: any[]) => void
  pushError: (msg: any) => void
  handleClearErrors: () => void
}

export const GatewayStatusContext = createContext<GatewayStatusContextValue | null>(null)

export function useGatewayStatus() {
  const context = useContext(GatewayStatusContext)
  if (!context) {
    throw new Error('useGatewayStatus must be used within GatewayStatusProvider')
  }
  return context
}

export function GatewayStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GatewayStatus>(DEFAULT_GATEWAY_STATUS)
  const [appliedRuntimeSnapshot, setAppliedRuntimeSnapshot] = useState<string | null>(null)
  const [lastStatusSyncAt, setLastStatusSyncAt] = useState('-')
  const [errorHistory, setErrorHistory] = useState<any[]>([])

  const latestErrorEntry = useMemo(() => errorHistory[0] || null, [errorHistory])

  const pushError = useCallback((msg: any) => {
    const normalized = String(msg?.message || msg || '').trim()
    if (!normalized) return
    setErrorHistory(prev => mergeErrorHistory(prev, normalized, formatGatewayTimestamp(), 8))
  }, [])

  const handleClearErrors = useCallback(() => {
    setErrorHistory([])
  }, [])

  const value = useMemo(() => ({
    status,
    appliedRuntimeSnapshot,
    lastStatusSyncAt,
    errorHistory,
    latestErrorEntry,
    setStatus,
    setAppliedRuntimeSnapshot,
    setLastStatusSyncAt,
    setErrorHistory,
    pushError,
    handleClearErrors,
  }), [
    status,
    appliedRuntimeSnapshot,
    lastStatusSyncAt,
    errorHistory,
    latestErrorEntry,
    pushError,
    handleClearErrors,
  ])

  return (
    <GatewayStatusContext.Provider value={value}>
      {children}
    </GatewayStatusContext.Provider>
  )
}
