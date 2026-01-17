import { Card, Badge, Group, Stack, Text } from '@mantine/core'

// 统计卡片组件 - 紧凑版
function StatCard({ icon: Icon, iconBg, value, label, delay, isLightTheme, onClick, warning }) {
  return (
    <Card
      onClick={onClick}
      className={`card-glow animate-scale-in ${delay} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      shadow="sm"
      padding="md"
      radius="xl"
      withBorder
      style={{ 
        background: isLightTheme ? 'white' : 'rgba(30, 30, 50, 0.8)',
        borderColor: warning ? 'rgba(249, 115, 22, 0.5)' : (isLightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'),
        borderWidth: warning ? '2px' : '1px'
      }}
    >
      <Group gap="md" wrap="nowrap">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center relative flex-shrink-0`}>
          <Icon size={18} className={!isLightTheme ? 'text-current' : ''} />
          {warning && (
            <Badge
              size="xs"
              circle
              color="orange"
              className="absolute -top-1 -right-1 animate-pulse"
              style={{ width: 12, height: 12, padding: 0 }}
            />
          )}
        </div>
        <Stack gap={0}>
          <Text size="xl" fw={700} className={`stat-number ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
            {value}
          </Text>
          <Text size="xs" c="dimmed">{label}</Text>
        </Stack>
      </Group>
    </Card>
  )
}

export default StatCard
