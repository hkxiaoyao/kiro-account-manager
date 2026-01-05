import { useState, useEffect } from 'react'
import { RefreshCw, Activity, Clock, Zap, BarChart3 } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { useApp } from '../../hooks/useApp'

function MetricsPage() {
  const { colors } = useApp()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const data = await invoke('get_kiro_gate_metrics')
      setMetrics(data)
    } catch (e) {
      console.error('加载统计失败:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (!metrics) {
    return (
      <div className={`flex items-center justify-center h-64 ${colors.textMuted}`}>
        <RefreshCw size={20} className="animate-spin mr-2" />
        加载中...
      </div>
    )
  }

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successRequests / metrics.totalRequests) * 100).toFixed(1) 
    : '0.0'

  return (
    <div className="space-y-5">
      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          colors={colors}
          icon={<Activity size={20} />}
          label="总请求"
          value={metrics.totalRequests}
          subValue={`成功率 ${successRate}%`}
          color="blue"
        />
        <StatCard 
          colors={colors}
          icon={<Clock size={20} />}
          label="平均响应"
          value={formatDuration(metrics.avgResponseTime)}
          subValue={`P95: ${formatDuration(metrics.latencyP95 * 1000)}`}
          color="green"
        />
        <StatCard 
          colors={colors}
          icon={<Zap size={20} />}
          label="流式请求"
          value={metrics.streamRequests}
          subValue={`非流式: ${metrics.nonStreamRequests}`}
          color="purple"
        />
        <StatCard 
          colors={colors}
          icon={<BarChart3 size={20} />}
          label="API 类型"
          value={Object.keys(metrics.apiTypeUsage).length}
          subValue={Object.entries(metrics.apiTypeUsage).map(([k, v]) => `${k}: ${v}`).join(', ') || '无'}
          color="orange"
        />
      </div>

      {/* 模型使用统计 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${colors.text}`}>模型使用统计</h3>
          <button 
            onClick={loadMetrics}
            disabled={loading}
            className={`p-2 rounded-lg hover:bg-white/10 ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={16} className={colors.textMuted} />
          </button>
        </div>
        
        {Object.keys(metrics.modelUsage).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(metrics.modelUsage)
              .sort((a, b) => b[1] - a[1])
              .map(([model, count]) => {
                const maxCount = Math.max(...Object.values(metrics.modelUsage))
                const percent = (count / maxCount) * 100
                return (
                  <div key={model}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={colors.text}>{model}</span>
                      <span className={colors.textMuted}>{count} 次</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className={`text-center py-8 ${colors.textMuted}`}>暂无数据</div>
        )}
      </div>

      {/* 最近请求 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <h3 className={`font-semibold ${colors.text} mb-4`}>最近请求</h3>
        
        {metrics.recentRequests.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...metrics.recentRequests].reverse().slice(0, 20).map((req, i) => (
              <div 
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border ${colors.cardBorder}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    req.apiType === 'openai' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {req.apiType}
                  </span>
                  <span className={`text-sm ${colors.text}`}>{req.path}</span>
                  <span className={`text-xs ${colors.textMuted}`}>{req.model}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    req.status >= 200 && req.status < 300 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {req.status}
                  </span>
                  <span className={`text-xs ${colors.textMuted}`}>{formatDuration(req.duration)}</span>
                  <span className={`text-xs ${colors.textMuted}`}>{formatTime(req.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${colors.textMuted}`}>暂无请求记录</div>
        )}
      </div>

      {/* 延迟百分位 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <h3 className={`font-semibold ${colors.text} mb-4`}>延迟分布</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className={`text-2xl font-bold ${colors.text}`}>{formatDuration(metrics.latencyP50 * 1000)}</div>
            <div className={`text-sm ${colors.textMuted}`}>P50 中位数</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className={`text-2xl font-bold ${colors.text}`}>{formatDuration(metrics.latencyP95 * 1000)}</div>
            <div className={`text-sm ${colors.textMuted}`}>P95</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className={`text-2xl font-bold ${colors.text}`}>{formatDuration(metrics.latencyP99 * 1000)}</div>
            <div className={`text-sm ${colors.textMuted}`}>P99</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ colors, icon, label, value, subValue, color }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
  }
  const iconColorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  }

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorMap[color]} border`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColorMap[color]}>{icon}</span>
        <span className={`text-sm ${colors.textMuted}`}>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
      <div className={`text-xs ${colors.textMuted} mt-1 truncate`}>{subValue}</div>
    </div>
  )
}

export default MetricsPage
