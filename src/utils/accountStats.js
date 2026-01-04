// 账号统计计算工具函数

// 智能格式化使用量：整数显示整数，小数保留2位（去掉末尾0）
const formatUsage = (value) => {
  if (value == null) return '0'
  if (Number.isInteger(value)) return value.toString()
  return parseFloat(value.toFixed(2)).toString()
}

// 从 account 获取 breakdown（API 返回 camelCase）
const getBreakdown = (a) => {
  return a.usageData?.usageBreakdownList?.[0] || null
}

// 获取总配额（主配额 + 试用 + 奖励）
const getQuota = (a) => {
  const breakdown = getBreakdown(a)
  if (!breakdown) return a.quota ?? 50
  
  const main = breakdown.usageLimit ?? 50
  const freeTrial = breakdown.freeTrialInfo?.usageLimit ?? 0
  // bonuses 可能是 null/undefined，确保是数组
  const bonuses = Array.isArray(breakdown.bonuses) ? breakdown.bonuses : []
  const bonus = bonuses.reduce((sum, b) => sum + (b.usageLimit ?? 0), 0)
  return main + freeTrial + bonus
}

// 获取已使用量（主配额 + 试用 + 奖励）
const getUsed = (a) => {
  const breakdown = getBreakdown(a)
  if (!breakdown) return a.used ?? 0
  
  const main = breakdown.currentUsage ?? 0
  const freeTrial = breakdown.freeTrialInfo?.currentUsage ?? 0
  // bonuses 可能是 null/undefined，确保是数组
  const bonuses = Array.isArray(breakdown.bonuses) ? breakdown.bonuses : []
  const bonus = bonuses.reduce((sum, b) => sum + (b.currentUsage ?? 0), 0)
  return main + freeTrial + bonus
}
const getSubType = (a) => a.usageData?.subscriptionInfo?.type ?? a.subscriptionType ?? ''
const getSubPlan = (a) => a.usageData?.subscriptionInfo?.subscriptionTitle ?? a.subscriptionPlan ?? ''

export function calcAccountStats(accounts) {
  const total = accounts.length
  const active = accounts.filter(a => a.status === 'active' || a.status === '正常' || a.status === '有效').length
  const banned = accounts.filter(a => a.status === 'banned' || a.status === '封禁' || a.status === '已封禁').length
  // 保留精确值，不再取整
  const totalQuota = accounts.reduce((sum, a) => sum + getQuota(a), 0)
  const totalUsed = accounts.reduce((sum, a) => sum + getUsed(a), 0)
  const proPlus = accounts.filter(a => getSubType(a).includes('PRO+') || getSubPlan(a).includes('PRO+')).length
  const pro = accounts.filter(a => 
    (getSubType(a).includes('PRO') || getSubPlan(a).includes('PRO')) && 
    !(getSubType(a).includes('PRO+') || getSubPlan(a).includes('PRO+'))
  ).length
  const usagePercent = totalQuota > 0 ? (totalUsed / totalQuota * 100).toFixed(1) : 0

  return { 
    total, active, banned, proPlus, pro, usagePercent,
    totalQuota, totalUsed, remaining: totalQuota - totalUsed,
    // 格式化后的显示值
    totalQuotaStr: formatUsage(totalQuota),
    totalUsedStr: formatUsage(totalUsed),
    remainingStr: formatUsage(totalQuota - totalUsed)
  }
}

export function getUsagePercent(used, quota) {
  return quota === 0 ? 0 : Math.min(100, (used / quota) * 100)
}

export { getQuota, getUsed, getSubType, getSubPlan, formatUsage }
