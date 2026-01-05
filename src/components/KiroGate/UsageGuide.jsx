import { useApp } from '../../hooks/useApp'
import { useAppSettings } from '../../contexts/AppSettingsContext'

function UsageGuide() {
  const { colors } = useApp()
  const { settings } = useAppSettings()
  
  const port = settings?.kiroGatePort || 8000
  const serverUrl = `http://127.0.0.1:${port}`

  return (
    <div className="space-y-5">
      {/* Python 示例 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs">🐍</span>
          <h3 className={`font-semibold ${colors.text}`}>OpenAI SDK (Python)</h3>
        </div>
        <pre className={`text-xs ${colors.text} bg-black/30 p-4 rounded-xl overflow-x-auto`}>
{`from openai import OpenAI

client = OpenAI(
    base_url="${serverUrl}/v1",
    api_key="<生成的 API Key>"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")`}
        </pre>
      </div>

      {/* cURL 示例 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs">$</span>
          <h3 className={`font-semibold ${colors.text}`}>cURL</h3>
        </div>
        <pre className={`text-xs ${colors.text} bg-black/30 p-4 rounded-xl overflow-x-auto`}>
{`curl ${serverUrl}/v1/chat/completions \\
  -H "Authorization: Bearer <生成的 API Key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
        </pre>
      </div>

      {/* 支持的模型 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <h3 className={`font-semibold ${colors.text}`}>支持的模型</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['claude-sonnet-4-5', 'claude-sonnet-4', 'claude-opus-4-5', 'claude-haiku-4-5'].map(m => (
            <span key={m} className={`px-3 py-1.5 rounded-lg text-sm ${colors.card} border ${colors.cardBorder}`}>{m}</span>
          ))}
        </div>
      </div>

      {/* 获取 Token 说明 */}
      <div className={`${colors.card} rounded-2xl p-5 border ${colors.cardBorder}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <h3 className={`font-semibold ${colors.text}`}>如何获取 Refresh Token</h3>
        </div>
        <ol className={`text-sm space-y-2 ${colors.textMuted}`}>
          <li>1. 打开 <code className="px-1.5 py-0.5 rounded bg-black/30">https://app.kiro.dev</code> 并登录</li>
          <li>2. 按 F12 打开开发者工具</li>
          <li>3. 点击 Application → Storage → Cookie</li>
          <li>4. 找到 <code className="px-1.5 py-0.5 rounded bg-black/30 text-green-400">RefreshToken</code> 并复制值</li>
        </ol>
      </div>
    </div>
  )
}

export default UsageGuide
