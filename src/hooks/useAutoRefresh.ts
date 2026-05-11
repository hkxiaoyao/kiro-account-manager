/**
 * 自动刷新 Hook（后端实现）
 * 
 * 后端已使用 tokio::time::interval 实现真正的后台定时刷新
 * 前端不再需要定时器，后端自动运行
 * 
 * 后端自动刷新功能：
 * - 使用 Rust tokio 后台任务，应用最小化后继续运行
 * - 自动读取 app-settings.json 中的 autoRefresh 和 autoRefreshInterval 配置
 * - 支持动态更新刷新间隔
 * - 自动发送事件通知前端（account-banned、account-token-invalid、sync-network-error、accounts-updated）
 */
export function useAutoRefresh() {
  // 后端自动运行，前端无需任何操作
  return {}
}
