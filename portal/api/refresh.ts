import type { VercelRequest, VercelResponse } from '@vercel/node'

const KIRO_AUTH_ENDPOINT = 'https://prod.us-east-1.auth.desktop.kiro.dev'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // authMethod: 'social' | 'idc'
  // social 需要: refreshToken, machineId(可选)
  // idc 需要: refreshToken, clientId, clientSecret, region(可选，默认 us-east-1)
  const { refreshToken, machineId, authMethod = 'social', clientId, clientSecret, region = 'us-east-1' } = req.body
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing required field: refreshToken' })
  }

  try {
    if (authMethod === 'idc') {
      // IdC 类型：调用 AWS SSO OIDC 端点
      if (!clientId || !clientSecret) {
        return res.status(400).json({ error: 'Missing required fields for IdC: clientId, clientSecret' })
      }
      
      const ssoUrl = `https://oidc.${region}.amazonaws.com/token`
      const response = await fetch(ssoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          grantType: 'refresh_token',
          refreshToken
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return res.status(response.status).json(data)
      }

      return res.status(200).json(data)
    } else {
      // Social 类型：调用 Kiro Auth 端点
      const userAgent = `KiroIDE-0.6.18-${machineId || 'unknown'}`
      const response = await fetch(`${KIRO_AUTH_ENDPOINT}/refreshToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent
        },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return res.status(response.status).json(data)
      }

      return res.status(200).json(data)
    }
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
