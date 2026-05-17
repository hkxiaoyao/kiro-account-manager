import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  value: string | number
  label: string
  delay: string
  onClick?: () => void
  warning?: boolean
}

/** 统计卡片：紧凑版，与 Home 头部 + Section 风格对齐。 */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  delay,
  onClick,
  warning,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`card-glow animate-scale-in ${delay} rounded-xl transition-colors duration-200 ${
        onClick ? 'cursor-pointer hover:bg-muted/40' : ''
      } ${warning ? 'border-orange-500/50 ring-1 ring-orange-500/20' : ''}`}
    >
      <div className="flex items-center gap-3 p-3.5">
        <div className={`relative w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className={iconColor} />
          {warning && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse ring-2 ring-background" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-base font-bold stat-number text-foreground leading-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground truncate">{label}</div>
        </div>
      </div>
    </Card>
  )
}

export default StatCard
