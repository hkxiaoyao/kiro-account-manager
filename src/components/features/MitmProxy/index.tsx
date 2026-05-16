import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Shield, CheckCircle, XCircle, Download, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface MitmStatus {
  running: boolean
  port: number
  caInstalled: boolean
  caCertPath: string | null
  mitmDomains: string[]
  targetDeviceId: string | null
}

function MitmProxy() {
  const [status, setStatus] = useState<MitmStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const s = await invoke<MitmStatus>('get_mitm_status')
      setStatus(s)
    } catch (e) {
      console.error('Failed to get MITM status:', e)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleGenerateCa = async () => {
    setLoading(true)
    try {
      await invoke('generate_mitm_ca')
      await fetchStatus()
    } catch (e) {
      console.error('Failed to generate CA:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleInstallCa = async () => {
    setLoading(true)
    try {
      await invoke('install_mitm_ca')
      await fetchStatus()
    } catch (e) {
      console.error('Failed to install CA:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-3">
          <Shield size={24} />
          <div>
            <h1 className="text-xl font-bold">MITM 代理</h1>
            <p className="text-sm text-muted-foreground">拦截 Kiro IDE 请求，支持机器码替换和提示词过滤</p>
          </div>
        </div>

        {/* 状态卡片 */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">代理状态</Label>
            <div className="flex items-center gap-2">
              {status?.running ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-600">运行中 :{status.port}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-muted-foreground">已停止</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" disabled={status?.running || loading}>
              <Play size={14} className="mr-1" />
              启动
            </Button>
            <Button size="sm" variant="destructive" disabled={!status?.running || loading}>
              <Square size={14} className="mr-1" />
              停止
            </Button>
          </div>
        </div>

        {/* CA 证书管理 */}
        <div className="border rounded-lg p-4 space-y-4">
          <Label className="text-base font-medium">CA 证书</Label>

          <div className="flex items-center gap-2">
            {status?.caInstalled ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">CA 证书已生成</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">CA 证书未生成</span>
              </>
            )}
          </div>

          {status?.caCertPath && (
            <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
              {status.caCertPath}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleGenerateCa} disabled={loading}>
              生成 CA
            </Button>
            <Button size="sm" variant="outline" onClick={handleInstallCa} disabled={!status?.caInstalled || loading}>
              <Download size={14} className="mr-1" />
              安装到系统
            </Button>
          </div>
        </div>

        {/* 拦截域名 */}
        <div className="border rounded-lg p-4 space-y-3">
          <Label className="text-base font-medium">拦截域名</Label>
          <div className="space-y-1">
            {status?.mitmDomains.map((domain) => (
              <div key={domain} className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                {domain}
              </div>
            ))}
          </div>
        </div>

        {/* 机器码 */}
        <div className="border rounded-lg p-4 space-y-3">
          <Label className="text-base font-medium">机器码替换</Label>
          <p className="text-sm text-muted-foreground">
            {status?.targetDeviceId
              ? `目标机器码: ${status.targetDeviceId.substring(0, 16)}...`
              : '未配置目标机器码'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MitmProxy
