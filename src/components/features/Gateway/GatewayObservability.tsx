import { Activity, AlertTriangle, FolderOpen, Radio, RefreshCw, Search, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatGatewayRequestDuration } from './gatewayPageUtils'
import { GatewayCodeCard, GatewayPathCard, GatewaySectionHeader, GatewayStatCard, GatewaySubCard, GatewaySurfaceCard } from './GatewayShared'
import { MetricBar } from './MetricBar'
import React from 'react'

interface GatewayObservabilityProps {
  colors: any;
  observabilityHighlights: any[];
  effectiveConfig: any;
  status: any;
  loading: boolean;
  handleRefresh: () => Promise<void>;
  handleClearErrors: () => void;
  errorHistory: any[];
  statusSummary: any;
  hasUnsavedChanges: boolean;
  filteredRequestLogSummary: any;
  integrationSummary: any;
  logDir: string;
  handleOpenLogDir: () => Promise<void>;
  loadRequestLogs: (limit?: number) => Promise<void>;
  requestLogsLoading: boolean;
  handleClearRequestLogs: () => Promise<void>;
  requestLogs: any[];
  lastRequestLogsSyncAt: string;
  requestLogOutcome: string;
  setRequestLogOutcome: (value: string) => void;
  requestLogQuery: string;
  setRequestLogQuery: (value: string) => void;
  requestLogSummary: any;
  requestMetrics: any;
  filteredRequestLogs: any[];
}

function GatewayErrorHistoryCard({ errorHistory }: { errorHistory: any[] }) {
  const entries = errorHistory.length
    ? errorHistory
    : [{ message: '暂无流式错误', firstSeenAt: '-', lastSeenAt: '-', count: 1 }]

  return (
    <GatewayCodeCard title="流式 / 上游错误明细">
      <div className="flex flex-col gap-1.5 mt-2">
        {entries.map((item, idx) => (
          <GatewaySubCard key={`${item.message}-${idx}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <div className="text-sm font-semibold">错误命中 {item.count} 次</div>
              </div>
              <Badge variant="secondary">{item.lastSeenAt}</Badge>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
              {`首次: ${item.firstSeenAt}\n最近: ${item.lastSeenAt}\n次数: ${item.count}\n${item.message}`}
            </pre>
          </GatewaySubCard>
        ))}
      </div>
    </GatewayCodeCard>
  )
}

function GatewayObservability({
  colors,
  observabilityHighlights,
  effectiveConfig,
  status,
  loading,
  handleRefresh,
  handleClearErrors,
  errorHistory,
  statusSummary,
  hasUnsavedChanges,
  filteredRequestLogSummary,
  integrationSummary,
  logDir,
  handleOpenLogDir,
  loadRequestLogs,
  requestLogsLoading,
  handleClearRequestLogs,
  requestLogs,
  lastRequestLogsSyncAt,
  requestLogOutcome,
  setRequestLogOutcome,
  requestLogQuery,
  setRequestLogQuery,
  requestLogSummary,
  requestMetrics,
  filteredRequestLogs}: GatewayObservabilityProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {observabilityHighlights.map((item) => (
          <GatewayStatCard
            key={item.label}
            colors={colors}
            label={item.label}
            value={item.value}
            detail={item.detail}
            className={`glass-card border-border`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] gap-4">
        <GatewaySurfaceCard colors={colors}>
          <div className="flex flex-col gap-3">
            <GatewaySectionHeader
              colors={colors}
              icon={Shield}
              title="观测总览"
              actions={(
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Radio size={12} />
                    {`账号池 ${effectiveConfig.strategy}`}
                  </Badge>
                  <Badge variant={effectiveConfig.localOnly ? 'default' : 'secondary'}>{effectiveConfig.localOnly ? '仅本机' : '允许远程'}</Badge>
                  <Badge variant={status.running ? 'default' : 'destructive'}>{status.running ? '运行中' : '已停止'}</Badge>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                    刷新状态
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearErrors} disabled={!errorHistory.length}>
                    清空错误
                  </Button>
                </div>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GatewayStatCard colors={colors} label="监听地址" value={statusSummary.listen} />
              <GatewayStatCard colors={colors} label="请求计数" value={statusSummary.requests} />
              <GatewayStatCard colors={colors} label="路由策略" value={statusSummary.routing} />
              <GatewayStatCard colors={colors} label="暴露范围" value={statusSummary.exposure} />
              <GatewayStatCard colors={colors} label="Region / 日志级别" value={`${statusSummary.region} / ${statusSummary.logLevel}`} />
              <GatewayStatCard colors={colors} label="最后同步" value={statusSummary.sync} />
            </div>

            <Alert>
              <AlertTitle>运行摘要</AlertTitle>
              <AlertDescription>
                {`错误历史 ${statusSummary.errorCount}，当前${status.running ? '已启动' : '未启动'}，${hasUnsavedChanges ? '页面存在未保存变更。' : '页面配置已与已保存状态同步。'}`}
              </AlertDescription>
            </Alert>

            <GatewaySubCard>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">运维建议</div>
                  <Badge variant={filteredRequestLogSummary.errors ? 'secondary' : 'default'}>
                    {filteredRequestLogSummary.errors ? '优先看错误明细' : '优先看请求趋势'}
                  </Badge>
                </div>
                <div className={`text-sm text-muted-foreground`}>
                  先看顶部指标判断是否是整体异常，再结合错误聚合确认是鉴权、限流、上游返回还是流式中断；最后下钻到最近请求明细核对状态码、模型、Region、上游来源与错误信息。
                </div>
              </div>
            </GatewaySubCard>
          </div>
        </GatewaySurfaceCard>

        <GatewaySurfaceCard colors={colors}>
          <div className="flex flex-col gap-3">
            <GatewaySectionHeader
              colors={colors}
              title="运维与排障"
              badge={<Badge variant={errorHistory.length ? 'secondary' : 'default'}>{integrationSummary.errorDigest}</Badge>}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GatewayStatCard colors={colors} label="日志状态" value={integrationSummary.logDirState} />
              <GatewayStatCard colors={colors} label="错误摘要" value={integrationSummary.errorDigest} />
            </div>

            <GatewayPathCard
              value={logDir || '尚未获取'}
              actions={(
                <Button variant="outline" onClick={handleOpenLogDir}>
                  <FolderOpen size={16} className="mr-1" />
                  打开日志目录
                </Button>
              )}
            />

            <GatewayErrorHistoryCard errorHistory={errorHistory} />
          </div>
        </GatewaySurfaceCard>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <GatewaySurfaceCard colors={colors}>
          <div className="flex flex-col gap-3">
            <GatewaySectionHeader
              colors={colors}
              icon={Activity}
              title="请求日志"
              actions={(
                <div className="flex items-center gap-2">
                  <Badge variant="default">gateway-request-log.jsonl</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRequestLogs()}
                    disabled={requestLogsLoading}
                  >
                    <RefreshCw size={14} className={`mr-1 ${requestLogsLoading ? 'animate-spin' : ''}`} />
                    刷新日志
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearRequestLogs}
                    disabled={requestLogsLoading || !requestLogs.length}
                  >
                    清空日志
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenLogDir}
                  >
                    <FolderOpen size={14} className="mr-1" />
                    打开目录
                  </Button>
                </div>
              )}
            />

            <div className={`text-sm text-muted-foreground`}>
              这里展示最近 120 条反代请求记录，按时间倒序读取本地 JSONL 文件。最后同步时间：{lastRequestLogsSyncAt}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="outcome-filter">结果过滤</Label>
                <Select value={requestLogOutcome} onValueChange={(value) => setRequestLogOutcome(value || 'all')}>
                  <SelectTrigger id="outcome-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部结果</SelectItem>
                    <SelectItem value="success">仅成功</SelectItem>
                    <SelectItem value="stream">仅流式</SelectItem>
                    <SelectItem value="error">仅错误</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="query-search">关键词搜索</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="query-search"
                    placeholder="搜索模型、端点、IP、错误、上游来源或 Region"
                    value={requestLogQuery}
                    onChange={(event) => setRequestLogQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <GatewayStatCard colors={colors} label="显示中 / 总记录" value={`${filteredRequestLogSummary.total} / ${requestLogSummary.total}`} />
              <GatewayStatCard colors={colors} label="成功 / 流式" value={`${filteredRequestLogSummary.success} / ${filteredRequestLogSummary.streaming}`} />
              <GatewayStatCard colors={colors} label="错误数" value={filteredRequestLogSummary.errors} />
              <GatewayStatCard colors={colors} label="最新记录 / 最长耗时" value={filteredRequestLogSummary.latestOccurredAt} detail={filteredRequestLogSummary.maxDurationLabel} />
            </div>

            <GatewayPathCard value={logDir || '尚未获取'} />
          </div>
        </GatewaySurfaceCard>

        <GatewaySurfaceCard colors={colors}>
          <div className="flex flex-col gap-3">
            <GatewaySectionHeader
              colors={colors}
              icon={Radio}
              title="统计视图"
              badge={(
                <Badge variant={requestMetrics.errorRateLabel === '0%' ? 'default' : 'secondary'}>
                  成功率 {requestMetrics.successRateLabel} / 错误率 {requestMetrics.errorRateLabel}
                </Badge>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <GatewayStatCard colors={colors} label="平均耗时" value={requestMetrics.avgDurationLabel} />
              <GatewayStatCard colors={colors} label="模型数" value={requestMetrics.uniqueModels} />
              <GatewayStatCard colors={colors} label="上游来源数" value={requestMetrics.uniqueUpstreams} />
              <GatewayStatCard colors={colors} label="统计样本" value={requestMetrics.total} />
            </div>

            {/* 统计可视化 - 紧凑布局 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {/* 热门模型 */}
              <div className="border rounded-lg p-3">
                <div className="text-xs font-semibold mb-2 text-muted-foreground">热门模型</div>
                {requestMetrics.topModels.length === 0 ? (
                  <div className="text-center py-2 text-muted-foreground text-xs">暂无统计</div>
                ) : (
                  <div className="space-y-1.5">
                    {requestMetrics.topModels.map((item: any, idx: number) => (
                      <MetricBar key={idx} label={item.label} count={item.count} percent={item.percent} />
                    ))}
                  </div>
                )}
              </div>

              {/* 热门上游来源 */}
              <div className="border rounded-lg p-3">
                <div className="text-xs font-semibold mb-2 text-muted-foreground">热门上游来源</div>
                {requestMetrics.topUpstreams.length === 0 ? (
                  <div className="text-center py-2 text-muted-foreground text-xs">暂无统计</div>
                ) : (
                  <div className="space-y-1.5">
                    {requestMetrics.topUpstreams.map((item: any, idx: number) => (
                      <MetricBar key={idx} label={item.label} count={item.count} percent={item.percent} />
                    ))}
                  </div>
                )}
              </div>

              {/* 状态码分布 */}
              <div className="border rounded-lg p-3">
                <div className="text-xs font-semibold mb-2 text-muted-foreground">状态码分布</div>
                {requestMetrics.topStatuses.length === 0 ? (
                  <div className="text-center py-2 text-muted-foreground text-xs">暂无统计</div>
                ) : (
                  <div className="space-y-1.5">
                    {requestMetrics.topStatuses.map((item: any, idx: number) => {
                      const statusCode = parseInt(item.label)
                      const isError = statusCode >= 400
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs h-5 ${isError ? 'border-red-500 text-red-500' : ''}`}
                          >
                            {item.label}
                          </Badge>
                          <MetricBar label="" count={item.count} percent={item.percent} isError={isError} className="flex-1" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 端点 / Region */}
              <div className="border rounded-lg p-3">
                <div className="text-xs font-semibold mb-2 text-muted-foreground">端点 / Region</div>
                <div className="space-y-3">
                  {/* 端点 */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">端点</div>
                    {requestMetrics.topEndpoints.length === 0 ? (
                      <div className="text-center py-1 text-muted-foreground text-xs">暂无统计</div>
                    ) : (
                      <div className="space-y-1.5">
                        {requestMetrics.topEndpoints.map((item: any, idx: number) => (
                          <MetricBar key={idx} label={item.label} count={item.count} percent={item.percent} />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Region */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Region</div>
                    {requestMetrics.topRegions.length === 0 ? (
                      <div className="text-center py-1 text-muted-foreground text-xs">暂无统计</div>
                    ) : (
                      <div className="space-y-1.5">
                        {requestMetrics.topRegions.map((item: any, idx: number) => (
                          <MetricBar key={idx} label={item.label} count={item.count} percent={item.percent} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GatewaySurfaceCard>

        <GatewaySurfaceCard colors={colors}>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className={`font-semibold text-foreground`}>最近请求明细</div>
              <Badge variant={filteredRequestLogSummary.errors ? 'destructive' : 'default'}>
                {filteredRequestLogSummary.errors ? `${filteredRequestLogSummary.errors} 条错误` : '无错误记录'}
              </Badge>
            </div>

            {!filteredRequestLogs.length ? (
              <Alert>
                <AlertTitle>暂无请求日志</AlertTitle>
                <AlertDescription>
                  {requestLogs.length
                    ? '当前筛选条件下没有匹配结果，请调整结果过滤或搜索关键词。'
                    : '当前还没有反代请求写入本地日志文件。启动反代并发起请求后，这里会显示最新记录。'}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold">#</th>
                        <th className="text-left p-3 font-semibold">状态</th>
                        <th className="text-left p-3 font-semibold">端点</th>
                        <th className="text-left p-3 font-semibold">模型</th>
                        <th className="text-left p-3 font-semibold">上游来源</th>
                        <th className="text-left p-3 font-semibold">耗时</th>
                        <th className="text-left p-3 font-semibold">时间</th>
                        <th className="text-left p-3 font-semibold">客户端</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequestLogs.map((item, idx) => (
                        <tr 
                          key={`${item.requestIndex || idx}-${item.occurredAt || idx}`}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            item.outcome === 'error' ? 'bg-red-50 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            #{item.requestIndex ?? '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <Badge 
                                  variant={item.outcome === 'success' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {item.outcome || 'unknown'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${item.statusCode >= 400 ? 'border-red-500 text-red-500' : ''}`}
                                >
                                  {item.statusCode || 0}
                                </Badge>
                              </div>
                              {item.stream && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-500 w-fit">
                                  stream
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-xs">{item.endpoint || '-'}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium">{item.model || '未记录'}</span>
                              <span className="text-xs text-muted-foreground">{item.region || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-xs">{item.upstreamSource || '未解析'}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs font-mono font-semibold">
                              {formatGatewayRequestDuration(item.durationMs)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-muted-foreground">{item.occurredAt || '-'}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-muted-foreground">{item.clientIp || '-'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* 展开详情（可选） */}
                {filteredRequestLogs.some(item => item.error || item.requestBody || item.responseBody) && (
                  <div className="border-t bg-muted/20 p-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        查看详细日志（错误信息、请求/响应体）
                      </summary>
                      <div className="mt-3 space-y-3">
                        {filteredRequestLogs.map((item, idx) => {
                          if (!item.error && !item.requestBody && !item.responseBody) return null
                          return (
                            <div key={`detail-${idx}`} className="border rounded-lg p-3 bg-background">
                              <div className="text-xs font-semibold mb-2">
                                #{item.requestIndex ?? '-'} - {item.occurredAt || '-'}
                              </div>
                              {item.error && (
                                <div className="mb-2">
                                  <div className="text-xs text-red-600 font-semibold mb-1">错误信息</div>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                    {item.error}
                                  </pre>
                                </div>
                              )}
                              {(item.requestBody || item.responseBody) && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                  {item.requestBody && (
                                    <div>
                                      <div className="text-xs font-semibold mb-1">请求体</div>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                                        {item.requestBody}
                                      </pre>
                                    </div>
                                  )}
                                  {item.responseBody && (
                                    <div>
                                      <div className="text-xs font-semibold mb-1">响应体</div>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                                        {item.responseBody}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </GatewaySurfaceCard>
      </div>
    </>
  )
}

export default GatewayObservability
