/**
 * 自动刷新 Hook（简化版）
 * 
 * 后端已使用 tokio::time::interval 实现真正的后台定时刷新
 * 前端只需要保留 startAutoRefreshTimer 接口供手动触发使用
 * 
 * 后端自动刷新功能：
 * - 使用 Rust tokio 后台任务，应用最小化后继续运行
 * - 自动读取 app-settings.json 中的 autoRefresh 和 autoRefreshInterval 配置
 * - 支持动态更新刷新间隔
 * - 自动发送事件通知前端（account-banned、account-token-invalid、sync-network-error、accounts-updated）
 */
export function useAutoRefresh() {
  // 手动触发刷新（保留接口兼容性，实际由后端自动执行）
  const startAutoRefreshTimer = () => {
    console.log('[AutoRefresh] 后端自动刷新已启用，无需前端定时器')
  }

  return { startAutoRefreshTimer }
}
