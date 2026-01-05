import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { useAppSettings } from '../../contexts/AppSettingsContext'

function UsageGuide() {
  const { colors } = useApp()
  const { settings } = useAppSettings()
  const [copiedId, setCopiedId] = useState(null)
  
  const port = settings?.kiroGatePort || 8000
  const serverUrl = `http://127.0.0.1:${port}`

  const copyText = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pythonCode = `from openai import OpenAI

client = OpenAI(
    base_url="${serverUrl}/v1",
    api_key="sk-..."  # 在「API Key」页生成
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`

  const curlCode = `curl ${serverUrl}/v1/chat/completions \\
  -H "Authorization: Bearer sk-..." \\
  -H "Content-Type: application/json" \\
  -d '{"model": "claude-sonnet-4-5", "messages": [{"role": "user", "content": "Hello!"}]}'`

  const models = [
    'claude-sonnet-4-5',
    'claude-sonnet-4',
    'claude-opus-4-5',
    'claude-haiku-4-5',
    'claude-3-7-sonnet-20250219'
  ]

  return (
    <div className="space-y-5">
      {/* 快速开始 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🚀</span>
          <h3 className={`font-semibold ${colors.text}`}>快速开始</h3>
        </div>
        <ol className={`text-sm space-y-2 ${colors.textMuted}`}>
          <li>1. 在「服务器」页启动服务</li>
          <li>2. 在「Token」页添加 Kiro 账号的 Refresh Token</li>
          <li>3. 在「API Key」页为 Token 生成 API Key</li>
          <li>4. 使用 API Key 调用 OpenAI 兼容接口</li>
        </ol>
      </div>

      {/* Python 示例 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs">🐍</span>
            <h3 className={`font-semibold ${colors.text}`}>Python (OpenAI SDK)</h3>
          </div>
          <button 
            onClick={() => copyText(pythonCode, 'python')}
            className={`p-2 rounded-lg hover:bg-white/10 ${copiedId === 'python' ? 'text-green-400' : colors.textMuted}`}
          >
            {copiedId === 'python' ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <pre className={`text-xs ${colors.text} bg-black/30 p-4 rounded-xl overflow-x-auto`}>
          {pythonCode}
        </pre>
      </div>

      {/* cURL 示例 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">$</span>
            <h3 className={`font-semibold ${colors.text}`}>cURL</h3>
          </div>
          <button 
            onClick={() => copyText(curlCode, 'curl')}
            className={`p-2 rounded-lg hover:bg-white/10 ${copiedId === 'curl' ? 'text-green-400' : colors.textMuted}`}
          >
            {copiedId === 'curl' ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <pre className={`text-xs ${colors.text} bg-black/30 p-4 rounded-xl overflow-x-auto`}>
          {curlCode}
        </pre>
      </div>

      {/* 支持的模型 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📋</span>
          <h3 className={`font-semibold ${colors.text}`}>支持的模型</h3>
          <span className={`text-xs ${colors.textMuted}`}>（点击复制）</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {models.map(m => (
            <button 
              key={m} 
              onClick={() => copyText(m, m)}
              className={`px-3 py-1.5 rounded-lg text-sm ${colors.card} border ${colors.cardBorder} hover:bg-white/10 transition-all ${
                copiedId === m ? 'border-green-500/50 text-green-400' : ''
              }`}
            >
              {copiedId === m ? '✓ ' : ''}{m}
            </button>
          ))}
        </div>
      </div>

      {/* 第三方工具 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔧</span>
          <h3 className={`font-semibold ${colors.text}`}>第三方工具配置</h3>
        </div>
        <div className={`text-sm ${colors.textMuted} space-y-2`}>
          <p>KiroGate 兼容 OpenAI API 格式，可用于 ChatBox、LobeChat、Cursor 等工具</p>
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span>API 地址：</span>
              <code 
                onClick={() => copyText(`${serverUrl}/v1`, 'apiUrl')}
                className={`bg-black/30 px-2 py-0.5 rounded cursor-pointer hover:bg-black/50 ${
                  copiedId === 'apiUrl' ? 'text-green-400' : ''
                }`}
              >
                {copiedId === 'apiUrl' ? '✓ 已复制' : `${serverUrl}/v1`}
              </code>
            </div>
            <p>API Key：在「API Key」页生成的 <code className="bg-black/30 px-2 py-0.5 rounded">sk-...</code></p>
          </div>
        </div>
      </div>

      {/* 注意事项 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <h3 className={`font-semibold ${colors.text}`}>注意事项</h3>
        </div>
        <div className={`text-sm ${colors.textMuted} space-y-2`}>
          <p>• 服务启动后刷新页面不会停止，关闭应用才会停止</p>
          <p>• Token 支持 Google/GitHub（Social）和 BuilderId（IdC）两种类型</p>
          <p>• API Key 与 Token 绑定，删除 Token 后对应的 API Key 失效</p>
        </div>
      </div>
    </div>
  )
}

export default UsageGuide
