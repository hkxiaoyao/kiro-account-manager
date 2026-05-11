/**
 * 模型锁定 Hook（后端实现）
 * 
 * 后端已使用 tokio::time::interval 实现真正的后台定时检查
 * 前端不再需要定时器，后端自动运行
 * 
 * 后端模型锁定功能：
 * - 使用 Rust tokio 后台任务，应用最小化后继续运行
 * - 自动读取 app-settings.json 中的 lockModel 和 lockedModel 配置
 * - 每 30 秒检查一次 Kiro IDE 的模型设置
 * - 如果检测到模型变更，自动恢复锁定的模型
 */
export function useModelLock() {
  // 后端自动运行，前端无需任何操作
  return {}
}
