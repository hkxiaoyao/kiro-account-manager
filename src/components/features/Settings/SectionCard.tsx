import type React from 'react'
import { Card, CardContent } from '../../ui/card'

type Accent = 'primary' | 'orange' | 'blue' | 'green' | 'violet' | 'amber'

interface SectionCardProps {
  title: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  desc?: string
  accent?: Accent
  className?: string
  children: React.ReactNode
}

const ACCENT_BAR: Record<Accent, string> = {
  primary: 'bg-primary',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
}

/**
 * 紧凑分组卡片：彩色短竖条 + 可选图标 + 标题 + 可选 badge / 描述。
 * 用于 Settings 各 tab 的统一分组容器。
 */
function SectionCard({
  title,
  icon,
  badge,
  desc,
  accent = 'primary',
  className = '',
  children,
}: SectionCardProps) {
  return (
    <Card className={`card-glow ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 ${ACCENT_BAR[accent]} rounded-full`} />
          {icon}
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {badge}
        </div>
        {desc && <p className="text-xs text-muted-foreground -mt-1">{desc}</p>}
        {children}
      </CardContent>
    </Card>
  )
}

export default SectionCard
