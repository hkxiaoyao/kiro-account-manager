import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { useDialog } from '../contexts/DialogContext'
import { useAppSettings } from '../contexts/AppSettingsContext'

/**
 * 核心 Hook：整合全站最常用的工具
 * 按照参考项目架构，不再通过 JS 分发颜色变量。
 */
export function useApp() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const dialog = useDialog()
  const { settings, updateSettings, loading: settingsLoading } = useAppSettings()

  return {
    // 基础
    t,
    i18n,
    
    // 主题 (直接使用 next-themes)
    theme: theme || 'dark',
    resolvedTheme,
    setTheme,
    
    // 设置
    settings,
    updateSettings,
    settingsLoading,
    
    // 弹窗
    dialog
  }
}
