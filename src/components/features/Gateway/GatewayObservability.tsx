import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  const [isRequestDetailExpanded, setIsRequestDetailExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isRunning = status?.running === true

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: requestLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5
  })

  const fetchRequestLogs = async () => {
    if (!isRunning) return
    setIsRefreshing(true)
    try {
      const logs = await invoke<ProcessedRequestLog[]>('get_gateway_request_logs')
      setRequestLogs(logs)
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
    if (requestLogs.length === 0) {
      setRequestMetrics(null)
      return
    }

    const total = requestLogs.length
    const errors = requestLogs.filter(log => log.status >= 400).length
    const streaming = requestLogs.filter(log => log.streaming).length
    const success = total - errors

    const maxDuration = Math.max(...requestLogs.map(log => log.duration))
    const maxDurationLabel = maxDuration >= 1000 ? `${(maxDuration / 1000).toFixed(2)}s` : `${maxDuration}ms`

    const latestOccurredAt = requestLogs.length > 0 ? requestLogs[0].timestamp : null

    const totalInputTokens = requestLogs.reduce((sum, log) => sum + (log.inputTokens || 0), 0)
    const totalOutputTokens = requestLogs.reduce((sum, log) => sum + (log.outputTokens || 0), 0)
    const totalCacheReadTokens = requestLogs.reduce((sum, log) => sum + (log.cacheReadTokens || 0), 0)
    const totalCacheCreationTokens = requestLogs.reduce((sum, log) => sum + (log.cacheCreationTokens || 0), 0)

    const requestsWithCache = requestLogs.filter(log => (log.cacheReadTokens || 0) > 0 || (log.cacheCreationTokens || 0) > 0).length
    const cacheHitRate = requestsWithCache > 0 ? ((requestsWithCache / total) * 100).toFixed(1) + '%' : '0%'

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
  }, [requestLogs])

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
    <div className="space-y-6">
      <GatewaySubCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <h3 className="font-semibold">请求概览</h3>
          </div>
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
            刷新
          </Button>
        </div>

        {requestMetrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GatewaySubCard>
              <p className="text-xs text-muted-foreground">总请求</p>
              <p className="font-bold mt-1">{requestMetrics.total}</p>
            </GatewaySubCard>
            <GatewaySubCard>
              <p className="text-xs text-muted-foreground">成功</p>
              <p className="font-bold mt-1 text-green-600">{requestMetrics.success}</p>
            </GatewaySubCard>
            <GatewaySubCard>
              <p className="text-xs text-muted-foreground">错误</p>
              <p className="font-bold mt-1 text-red-600">{requestMetrics.errors}</p>
            </GatewaySubCard>
            <GatewaySubCard>
              <p className="text-xs text-muted-foreground">流式</p>
              <p className="font-bold mt-1">{requestMetrics.streaming}</p>
            </GatewaySubCard>
          </div>
        ) : (
          <Alert>
            <AlertTitle>暂无数据</AlertTitle>
            <AlertDescription>
              等待第一个请求...
            </AlertDescription>
          </Alert>
        )}
      </GatewaySubCard>

      {requestMetrics && (
        <GatewaySurfaceCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <h3 className="font-semibold">性能指标</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRequestDetailExpanded(!isRequestDetailExpanded)}
            >
              {isRequestDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isRequestDetailExpanded ? '收起' : '展开'}
            </Button>
          </div>

          {isRequestDetailExpanded && (
            <div className="space-y-4">
              {requestMetrics.totalInputTokens > 0 && (
                <Alert>
                  <AlertTitle>Token 统计</AlertTitle>
                  <AlertDescription>
                    输入: {requestMetrics.totalInputTokens.toLocaleString()} | 输出: {requestMetrics.totalOutputTokens.toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </GatewaySurfaceCard>
      )}

      <GatewaySurfaceCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio size={16} />
            <h3 className="font-semibold">请求日志</h3>
            <Badge variant="outline">{requestMetrics?.total || 0}</Badge>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">全部 ({requestMetrics?.total || 0})</TabsTrigger>
            <TabsTrigger value="success">成功 ({requestMetrics?.success || 0})</TabsTrigger>
            <TabsTrigger value="error">错误 ({requestMetrics?.errors || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {requestLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无请求日志
              </div>
            ) : (
              <div
                ref={parentRef}
                className="h-[400px] overflow-auto border rounded-md"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const log = requestLogs[virtualRow.index]
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`
                        }}
                        className="px-4 py-2 border-b hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {log.status >= 400 ? (
                              <XCircle size={16} className="text-red-500" />
                            ) : (
                              <CheckCircle2 size={16} className="text-green-500" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{log.method}</span>
                                <span className="text-xs text-muted-foreground">{log.path}</span>
                                {log.streaming && (
                                  <Badge variant="outline" className="text-xs">流式</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                                <span className="text-xs">·</span>
                                <span className="text-xs">{log.duration}ms</span>
                                {log.model && (
                                  <>
                                    <span className="text-xs">·</span>
                                    <span className="text-xs text-muted-foreground">{log.model}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={log.status >= 400 ? 'destructive' : 'default'}>
                            {log.status}
                          </Badge>
                        </div>
                        {log.error && (
                          <div className="mt-2 text-xs text-red-600 font-mono">
                            {log.error}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="success" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              成功请求列表
            </div>
          </TabsContent>

          <TabsContent value="error" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              错误请求列表
            </div>
          </TabsContent>
        </Tabs>
      </GatewaySurfaceCard>
    </div>
  )
}
