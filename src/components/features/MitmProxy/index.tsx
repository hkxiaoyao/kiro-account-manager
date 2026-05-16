import { Shield } from 'lucide-react'

function MitmProxy() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <Shield size={48} className="opacity-30" />
      <div className="text-lg font-medium">MITM 代理</div>
      <div className="text-sm text-center max-w-md">
        拦截 Kiro IDE 的 HTTPS 请求，支持机器码替换和提示词过滤。
        <br />
        功能开发中...
      </div>
    </div>
  )
}

export default MitmProxy
