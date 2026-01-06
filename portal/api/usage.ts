import type { VercelRequest, VercelResponse } from '@vercel/node'
import { encode, decode } from 'cbor-x'

const KIRO_WEB_PORTAL = 'https://app.kiro.dev'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // authMethod: 'social' | 'idc'
  // social 需要: accessToken, idp
  // idc 需要: accessToken
  const { accessToken, idp, authMethod = 'social' } = req.body
  
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing required field: accessToken' })
  }
  
  if (authMethod === 'social' && !idp) {
    return res.status(400).json({ error: 'Missing required field: idp (for social auth)' })
  }

  try {
    const url = `${KIRO_WEB_PORTAL}/service/KiroWebPortalService/operation/GetUserUsageAndLimits`
    const encoded = encode({ isEmailRequired: true, origin: 'KIRO_IDE' })
    const body = new Uint8Array(encoded)

    // Social 用 Cookie 认证，IdC 只用 Bearer token
    const headers: Record<string, string> = {
      'Content-Type': 'application/cbor',
      'Accept': 'application/cbor',
      'smithy-protocol': 'rpc-v2-cbor',
      'authorization': `Bearer ${accessToken}`
    }
    
    if (authMethod === 'social') {
      headers['Cookie'] = `Idp=${idp}; AccessToken=${accessToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    })

    const bytes = new Uint8Array(await response.arrayBuffer())
    
    if (!response.ok) {
      let errorMsg: string
      try {
        errorMsg = JSON.stringify(decode(bytes))
      } catch {
        errorMsg = new TextDecoder().decode(bytes)
      }
      
      const isBannedStatus = response.status === 403 || response.status === 423
      const isBannedMsg = errorMsg.includes('AccountSuspendedException') || errorMsg.includes('TEMPORARILY_SUSPENDED')
      if (isBannedStatus && isBannedMsg) {
        return res.status(403).json({ error: 'BANNED', message: errorMsg })
      }
      return res.status(response.status).json({ error: errorMsg })
    }

    return res.status(200).json(decode(bytes))
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
