import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Radio,
  RefreshCw,
  XCircle,
  Zap
} from 'lucide-react'
import { GatewaySurfaceCard, GatewaySubCard } from './GatewayShared'

interface ProcessedRequestLog {
  id: string
  timestamp: string
  method: string
  path: string
  status: number
  duration: number
  model?: string
  error?: string
  streaming?: boolean
  inputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
  cacheCreationTokens?: number
  upstream?: string
  retryCount?: number
  errorType?: string
}

interface RequestLogSummary {
  total: number
  errors: number
  streaming: number
  success: number
  maxDurationLabel: string
  latestOccurredAt: string | null
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheReadTokens: number
  totalCacheCreationTokens: number
  requestsWithCache: number
  cacheHitRate: string
  costSavings: number
}

interface GatewayRequestStats {
  total: number
  success: number
  error: number
  streaming: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheReadTokens: number
  totalCacheCreationTokens: number
  requestsWithCache: number
  maxDurationMs: number
  avgDurationMs: number
}

interface GatewayObservabilityProps {
  status: any
  handleRefresh: () => void
}

export function GatewayObservability({
  status,
  handleRefresh
}: GatewayObservabilityProps) {
  const [requestLogs, setRequestLogs] = useState<ProcessedRequestLog[]>([])
  const [requestMetrics, setRequestMetrics] = useState<RequestLogSummary | null>(null)
  const [requestStats, setRequestStats] = useState<GatewayRequestStats | null>(null)
  const [isRequestDetailExpanded, setIsRequestDetailExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'error'>('all')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [displayLimit, setDisplayLimit] = useState(50)
  const [searchText, setSearchText] = useState('')

  const isRunning = status?.running === true

  // 根据activeTab和搜索过滤日志
  const filteredLogs = requestLogs.filter(log => {
    if (activeTab === 'success') return log.status < 400
    if (activeTab === 'error') return log.status >= 400
    return true
  }).filter(log => {
    if (!searchText) return true
    const lower = searchText.toLowerCase()
    return (log.model?.toLowerCase().includes(lower))
      || log.path.toLowerCase().includes(lower)
      || log.upstream?.toLowerCase().includes(lower)
      || log.error?.toLowerCase().includes(lower)
      || String(log.status).includes(lower)
  })

  const fetchRequestLogs = async (limit?: number) => {
    if (!isRunning) return
    setIsRefreshing(true)
    try {
      const fetchLimit = limit || displayLimit
      // 并行获取日志和统计数据
      const [logs, stats] = await Promise.all([
        invoke<any[]>('get_gateway_request_logs', { limit: fetchLimit }),
        invoke<GatewayRequestStats>('get_gateway_request_stats')
      ])

      // 映射后端字段到前端字段
      const processedLogs: ProcessedRequestLog[] = logs.map(log => {
        const processed = {
          id: `${log.requestIndex}-${log.occurredAt}`,
          timestamp: log.occurredAt,
          method: log.endpoint.includes('/messages') ? 'POST' : 'GET',
          path: log.endpoint,
          status: log.statusCode,
          duration: log.durationMs,
          model: log.model,
          error: log.error && log.error.length > 500
            ? log.error.substring(0, 500) + '...'
            : log.error,
          streaming: log.stream,
          inputTokens: log.inputTokens,
          outputTokens: log.outputTokens,
          cacheReadTokens: log.cacheReadInputTokens,
          cacheCreationTokens: log.cacheCreationInputTokens,
          upstream: log.upstreamSource,
          retryCount: undefined,
          errorType: log.errorType
        }

        return processed
      })

      setRequestLogs(processedLogs)
      setRequestStats(stats)
    } catch (error) {
      console.error('Failed to fetch request logs:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isRunning) {
      fetchRequestLogs()
      const interval = setInterval(fetchRequestLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [isRunning])

  useEffect(() => {
    if (requestLogs.length === 0 || !requestStats) {
      setRequestMetrics(null)
      return
    }

    // 使用后端统计数据作为真实数据源
    const total = requestStats.total
    const errors = requestStats.error
    const streaming = requestStats.streaming
    const success = requestStats.success

    // 从最近的日志中获取最大延迟和最新时间
    const maxDuration = requestLogs.length > 0
      ? Math.max(...requestLogs.map(log => log.duration))
      : requestStats.maxDurationMs
    const maxDurationLabel = maxDuration >= 1000 ? `${(maxDuration / 1000).toFixed(2)}s` : `${maxDuration}ms`

    const latestOccurredAt = requestLogs.length > 0 ? requestLogs[0].timestamp : null

    // 使用后端统计的 token 数据
    const totalInputTokens = requestStats.totalInputTokens
    const totalOutputTokens = requestStats.totalOutputTokens
    const totalCacheReadTokens = requestStats.totalCacheReadTokens
    const totalCacheCreationTokens = requestStats.totalCacheCreationTokens

    const requestsWithCache = requestStats.requestsWithCache
    const cacheHitRate = total > 0 && requestsWithCache > 0
      ? ((requestsWithCache / total) * 100).toFixed(1) + '%'
      : '0%'

    const inputCost = totalInputTokens * 0.003 / 1000
    const outputCost = totalOutputTokens * 0.015 / 1000
    const cacheReadCost = totalCacheReadTokens * 0.0003 / 1000
    const cacheCreationCost = totalCacheCreationTokens * 0.00375 / 1000
    const totalCost = inputCost + outputCost + cacheReadCost + cacheCreationCost
    const costWithoutCache = (totalInputTokens + totalCacheReadTokens) * 0.003 / 1000 + totalOutputTokens * 0.015 / 1000
    const costSavings = costWithoutCache - totalCost

    setRequestMetrics({
      total,
      errors,
      streaming,
      success,
      maxDurationLabel,
      latestOccurredAt,
      totalInputTokens,
      totalOutputTokens,
      totalCacheReadTokens,
      totalCacheCreationTokens,
      requestsWithCache,
      cacheHitRate,
      costSavings
    })
  }, [requestLogs, requestStats])

  

  if (!isRunning) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertTitle>网关未运行</AlertTitle>
          <AlertDescription>
            启动网关后，此处将显示实时请求日志和性能指标。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 + 统计指标一行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <h3 className="font-semibold text-sm">请求观测</h3>
          </div>
          {requestMetrics && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">总 <strong className="text-foreground">{requestMetrics.total}</strong></span>
              <span className="text-green-600">成功 <strong>{requestMetrics.success}</strong></span>
              <span className="text-red-600">错误 <strong>{requestMetrics.errors}</strong></span>
              <span className="text-muted-foreground">流式 <strong>{requestMetrics.streaming}</strong></span>
              {requestMetrics.totalInputTokens > 0 && (
                <>
                  <span className="text-muted-foreground">输入 <strong>{(requestMetrics.totalInputTokens / 1000).toFixed(1)}K</strong></span>
                  <span className="text-muted-foreground">输出 <strong>{(requestMetrics.totalOutputTokens / 1000).toFixed(1)}K</strong></span>
                </>
              )}
              {requestMetrics.totalCacheReadTokens > 0 && (
                <span className="text-green-600">缓存 <strong>{requestMetrics.cacheHitRate}</strong></span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await invoke('clear_gateway_request_logs')
                setRequestLogs([])
                setRequestStats(null)
              } catch (error) {
                console.error('Failed to clear logs:', error)
              }
            }}
            disabled={requestLogs.length === 0}
          >
            清空
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRequestLogs()
              handleRefresh()
            }}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* 请求日志表格 */}
      <GatewaySurfaceCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio size={16} />
            <h3 className="font-semibold text-sm">请求日志</h3>
            <Badge variant="outline" className="text-xs">{filteredLogs.length}</Badge>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="搜索模型/路径/错误..."
              className="text-xs border rounded px-2 py-1 w-40"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="text-xs border rounded px-2 py-1"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as 'all' | 'success' | 'error')}
            >
              <option value="all">全部</option>
              <option value="success">成功</option>
              <option value="error">错误</option>
            </select>
            <select
              className="text-xs border rounded px-2 py-1"
              value={displayLimit}
              onChange={(e) => {
                const newLimit = Number(e.target.value)
                setDisplayLimit(newLimit)
                fetchRequestLogs(newLimit)
              }}
            >
              <option value={50}>50条</option>
              <option value={100}>100条</option>
              <option value={200}>200条</option>
              <option value={500}>500条</option>
            </select>
          </div>
        </div>

        <div className="h-[500px] overflow-auto border rounded-md mt-3">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur">
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">状态</th>
                <th className="px-3 py-2 text-left font-medium">时间</th>
                <th className="px-3 py-2 text-left font-medium">路径</th>
                <th className="px-3 py-2 text-left font-medium">模型</th>
                <th className="px-3 py-2 text-right font-medium">耗时</th>
                <th className="px-3 py-2 text-right font-medium">输入</th>
                <th className="px-3 py-2 text-right font-medium">输出</th>
                <th className="px-3 py-2 text-right font-medium">缓存读</th>
                <th className="px-3 py-2 text-left font-medium">上游</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    暂无请求日志
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <td className="px-3 py-2">
                          <Badge variant={log.status >= 400 ? 'destructive' : 'default'} className="text-xs">
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground max-w-[180px] truncate">
                          {log.path}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium">
                          {log.model || '-'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-xs ${log.duration > 3000 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                            {log.duration}ms
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {log.inputTokens ? log.inputTokens.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {log.outputTokens ? log.outputTokens.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-green-600">
                          {log.cacheReadTokens ? log.cacheReadTokens.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-xs text-blue-600">
                          {log.upstream || '-'}
                        </td>
                      </tr>
                      {isExpanded && (log.error || log.errorType) && (
                        <tr className="border-b bg-muted/30">
                          <td colSpan={9} className="px-3 py-3">
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle size={14} className="text-red-600" />
                                <span className="text-xs font-semibold text-red-600">
                                  {log.errorType || '错误详情'}
                                </span>
                              </div>
                              <pre className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-words font-mono">
                                {log.error}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GatewaySurfaceCard>
    </div>
  )
}
