import type { VercelRequest, VercelResponse } from '@vercel/node'

// 公告列表 - 支持多个公告
const ANNOUNCEMENTS = [
  {
    id: '2025-01-04-v1',
    enabled: true,
    title: '重要提示',
    content: [
      '本项目完全免费开源，遵循 GPL-3.0 协议。',
      '近期发现有人恶意倒卖本工具收费，请勿上当！',
      '请认准官方 GitHub 仓库下载，其他渠道均为盗版。'
    ],
    officialUrl: 'https://github.com/hj01857655/kiro-account-manager',
    // 使用教程
    tutorialUrl: 'https://xcn46cm1l4ir.feishu.cn/wiki/YfaAw3qnoixFJgkzTSmcgtPfntc',
    // 续杯教程
    refillTutorialUrl: 'https://xcn46cm1l4ir.feishu.cn/wiki/EGR1wiXGGin8RgkFRGIcioSFnqh',
    qqGroup: '1020204332',
    qqGroupUrl: 'https://qm.qq.com/q/JjXJiVCiAw',
    // 续杯交流群
    buyGroup: 'Kiro续杯交流群',
    buyGroupUrl: 'https://qm.qq.com/q/MhecVOcvaW',
    // 购买链接
    buyUrl: 'https://pay.ldxp.cn/item/yrqrff',
    // 续杯教程
    refillTutorialUrl: 'https://xcn46cm1l4ir.feishu.cn/wiki/EGR1wiXGGin8RgkFRGIcioSFnqh'
  }
]

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 只返回 enabled 的公告
  const activeAnnouncements = ANNOUNCEMENTS.filter(a => a.enabled)
  return res.status(200).json(activeAnnouncements)
}
