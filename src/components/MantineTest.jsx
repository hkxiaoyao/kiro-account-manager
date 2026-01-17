import { Button, TextInput, Card, Group, Stack, Title } from '@mantine/core'

export default function MantineTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Stack gap="lg">
        <Title order={2} className="text-blue-600">
          Mantine + TailwindCSS 测试
        </Title>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Mantine 组件</Title>
            
            <TextInput
              label="用户名"
              placeholder="输入用户名"
              description="这是 Mantine 的 TextInput"
            />

            <Group>
              <Button variant="filled">填充按钮</Button>
              <Button variant="light">浅色按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-gradient-to-r from-purple-50 to-pink-50">
          <Stack gap="md">
            <Title order={3} className="text-purple-700">
              TailwindCSS 样式
            </Title>
            
            <div className="p-4 bg-white rounded-lg shadow-md">
              <p className="text-gray-700">这个卡片使用了 TailwindCSS 的渐变背景</p>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Tailwind 按钮 1
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
                Tailwind 按钮 2
              </button>
            </div>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} className="mb-4 text-indigo-600">
            混合使用示例
          </Title>
          
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Mantine + Tailwind
            </Button>
            <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50">
              自定义样式
            </Button>
          </div>
        </Card>
      </Stack>
    </div>
  )
}
