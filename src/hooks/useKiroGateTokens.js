// KiroGate Token 管理 Hook
import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function useKiroGateTokens() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await invoke('get_kiro_gate_tokens')
      setTokens(data || [])
    } catch (e) {
      console.error('获取 Token 失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const addToken = async (tokenData) => {
    const token = await invoke('add_kiro_gate_token', { params: tokenData })
    setTokens(prev => [...prev, token])
    return token
  }

  const updateToken = async (id, name, refreshToken) => {
    await invoke('update_kiro_gate_token', { id, name, refreshToken })
    setTokens(prev => prev.map(t => t.id === id ? { ...t, name, refreshToken } : t))
  }

  const deleteToken = async (id) => {
    await invoke('delete_kiro_gate_token', { id })
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  return { tokens, loading, refresh, addToken, updateToken, deleteToken }
}
