import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'

// 常量
const REFRESH_BEFORE_EXPIRY_SECONDS = 5 * 60 // 5 分钟内过期才刷新
const DEFAULT_REFRESH_INTERVAL = 10 // 分钟

// 根据账号数量计算并发数
const getConcurrency = (count) => {
  if (count <= 10) return count // 10 个以内全并发
  if (count <= 50) return 10    // 50 个以内并发 10
  if (count <= 200) return 20   // 200 个以内并发 20
  return 30                     // 超过 200 并发 30
}

// 分批执行异步任务
const runWithConcurrency = async (tasks, concurrency) => {
  const results = []
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(batch.map(fn => fn()))
    results.push(...batchResults)
  }
  return results
}

/**
 * 自动刷新 Token 的 Hook
 * @param {Object} appSettings - 应用设置
 * @param {boolean} settingsLoading - 设置是否加载中
 */
export function useAutoRefresh(appSettings, settingsLoading) {
  const refreshTimerRef = useRef(null)
  const appSettingsRef = useRef(appSettings)

  // 同步 appSettings 到 ref
  useEffect(() => {
    appSettingsRef.current = appSettings
  }, [appSettings])

  // 判断 token 是否在指定秒数内过期
  const isAuthTokenExpiredWithinSeconds = (acc, seconds) => {
    if (!acc.expiresAt || !acc.accessToken) return true
    const expiresAt = new Date(acc.expiresAt.replace(/\//g, '-'))
    return expiresAt.valueOf() < Date.now() + seconds * 1000
  }

  // 判断账号是否需要刷新
  const isExpiringSoon = (acc) => {
    if (acc.status === 'banned') return false
    if (!acc.expiresAt || !acc.accessToken) return false
    return isAuthTokenExpiredWithinSeconds(acc, REFRESH_BEFORE_EXPIRY_SECONDS)
  }

  // 刷新过期的 token
  const refreshExpiredTokens = async () => {
    try {
      const accounts = await invoke('get_accounts')
      if (!accounts?.length) return

      const expiredAccounts = accounts.filter(isExpiringSoon)
      if (!expiredAccounts.length) {
        console.log('[AutoRefresh] 没有需要刷新的 token')
        return
      }

      const concurrency = getConcurrency(expiredAccounts.length)
      console.log(`[AutoRefresh] 刷新 ${expiredAccounts.length} 个过期 token，并发数: ${concurrency}`)

      // 构建任务列表
      const tasks = expiredAccounts.map((account) => async () => {
        try {
          await invoke('refresh_account_token', { id: account.id })
          console.log(`[AutoRefresh] ${account.email} token 刷新成功`)
        } catch (e) {
          console.warn(`[AutoRefresh] ${account.email} token 刷新失败:`, e)
        }
      })

      // 分批执行
      await runWithConcurrency(tasks, concurrency)

      console.log('[AutoRefresh] token 刷新完成')
      emit('accounts-updated')
    } catch (e) {
      console.error('[AutoRefresh] 刷新失败:', e)
    }
  }

  // 定时刷新检查
  const checkAndRefreshExpiringTokens = async () => {
    const settings = appSettingsRef.current || {}
    if (settings.autoRefresh === false) return
    await refreshExpiredTokens()
  }

  // 启动定时器
  const startAutoRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }

    // 启动时刷新 5 分钟内过期的 token
    refreshExpiredTokens()

    const settings = appSettingsRef.current || {}
    const interval = settings.autoRefreshInterval ?? DEFAULT_REFRESH_INTERVAL
    const intervalMs = interval * 60 * 1000

    console.log(`[AutoRefresh] 定时器间隔: ${interval} 分钟`)
    refreshTimerRef.current = setInterval(checkAndRefreshExpiringTokens, intervalMs)
  }

  // 设置加载完成后启动定时器
  useEffect(() => {
    if (settingsLoading) return

    console.log('[AutoRefresh] 设置加载完成，启动定时器')
    startAutoRefreshTimer()

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [settingsLoading])

  return { startAutoRefreshTimer }
}
