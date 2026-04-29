import { createContext, useContext, useState, useMemo, useCallback, useDeferredValue, ReactNode } from 'react'
import {
  fetchGatewayRequestLogs,
  clearGatewayRequestLogs
} from '../gatewayPageState'
import {
  buildGatewayRequestLogSummary,
  filterGatewayRequestLogs,
  buildGatewayMetricsSummary,
  formatGatewayTimestamp
} from '../gatewayPageUtils'

interface GatewayObservabilityContextValue {
  // State
  requestLogs: any[]
  requestLogsLoading: boolean
  requestLogOutcome: string
  requestLogQuery: string
  lastRequestLogsSyncAt: string

  // Computed
  requestLogSummary: any
  filteredRequestLogs: any[]
  filteredRequestLogSummary: any
  requestMetrics: any

  // Actions
  setRequestLogs: (logs: any[]) => void
  setRequestLogsLoading: (loading: boolean) => void
  setRequestLogOutcome: (outcome: string) => void
  setRequestLogQuery: (query: string) => void
  setLastRequestLogsSyncAt: (timestamp: string) => void
  loadRequestLogs: (limit?: number) => Promise<void>
  handleClearRequestLogs: () => Promise<void>
}

export const GatewayObservabilityContext = createContext<GatewayObservabilityContextValue | null>(null)

export function useGatewayObservability() {
  const context = useContext(GatewayObservabilityContext)
  if (!context) {
    throw new Error('useGatewayObservability must be used within GatewayObservabilityProvider')
  }
  return context
}

export function GatewayObservabilityProvider({ children }: { children: ReactNode }) {
  const [requestLogs, setRequestLogs] = useState<any[]>([])
  const [requestLogsLoading, setRequestLogsLoading] = useState(false)
  const [requestLogOutcome, setRequestLogOutcome] = useState('all')
  const [requestLogQuery, setRequestLogQuery] = useState('')
  const [lastRequestLogsSyncAt, setLastRequestLogsSyncAt] = useState('-')

  const deferredRequestLogQuery = useDeferredValue(requestLogQuery)

  const requestLogSummary = useMemo(
    () => buildGatewayRequestLogSummary(requestLogs),
    [requestLogs]
  )

  const filteredRequestLogs = useMemo(
    () => filterGatewayRequestLogs(requestLogs, {
      outcome: requestLogOutcome,
      query: deferredRequestLogQuery
    }),
    [requestLogs, requestLogOutcome, deferredRequestLogQuery]
  )

  const filteredRequestLogSummary = useMemo(
    () => buildGatewayRequestLogSummary(filteredRequestLogs),
    [filteredRequestLogs]
  )

  const requestMetrics = useMemo(
    () => buildGatewayMetricsSummary(filteredRequestLogs),
    [filteredRequestLogs]
  )

  const loadRequestLogs = useCallback(async (limit = 120) => {
    setRequestLogsLoading(true)
    try {
      const logs = await fetchGatewayRequestLogs(limit)
      setRequestLogs(logs)
      setLastRequestLogsSyncAt(formatGatewayTimestamp())
    } catch (e) {
      console.error('[Gateway] Failed to load request logs:', e)
      throw e
    } finally {
      setRequestLogsLoading(false)
    }
  }, [])

  const handleClearRequestLogs = useCallback(async () => {
    setRequestLogsLoading(true)
    try {
      await clearGatewayRequestLogs()
      setRequestLogs([])
      setLastRequestLogsSyncAt(formatGatewayTimestamp())
    } catch (e) {
      console.error('[Gateway] Failed to clear request logs:', e)
      throw e
    } finally {
      setRequestLogsLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    requestLogs,
    requestLogsLoading,
    requestLogOutcome,
    requestLogQuery,
    lastRequestLogsSyncAt,
    requestLogSummary,
    filteredRequestLogs,
    filteredRequestLogSummary,
    requestMetrics,
    setRequestLogs,
    setRequestLogsLoading,
    setRequestLogOutcome,
    setRequestLogQuery,
    setLastRequestLogsSyncAt,
    loadRequestLogs,
    handleClearRequestLogs,
  }), [
    requestLogs,
    requestLogsLoading,
    requestLogOutcome,
    requestLogQuery,
    lastRequestLogsSyncAt,
    requestLogSummary,
    filteredRequestLogs,
    filteredRequestLogSummary,
    requestMetrics,
    loadRequestLogs,
    handleClearRequestLogs,
  ])

  return (
    <GatewayObservabilityContext.Provider value={value}>
      {children}
    </GatewayObservabilityContext.Provider>
  )
}
