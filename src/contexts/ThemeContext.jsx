import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useTheme as useNextTheme } from 'next-themes'
import { isLightTheme as checkIsLightTheme } from '../utils/themeMode'

const ThemeContext = createContext()

/**
 * 语义化类名映射表 (Bridge)
 * 为了兼容 Kiro 的旧代码，我们保留 colors 对象，
 * 但所有的具体样式逻辑已经全部迁移到了 index.css 中的 CSS 变量中。
 */
const semanticColors = {
  sidebar: 'glass-sidebar',
  sidebarText: 'text-sidebar-foreground',
  sidebarHover: 'hover:bg-sidebar-hover',
  sidebarActive: 'bg-sidebar-active text-white',
  sidebarBorder: 'border-sidebar-border',
  sidebarMuted: 'text-sidebar-muted',
  sidebarCard: 'bg-sidebar-card',
  main: 'glass-main',
  card: 'glass-card',
  cardNormal: 'glass-card-border backdrop-blur-md',
  cardBorder: 'border-app-border',
  cardHover: 'hover:bg-surface-hover',
  cardSecondary: 'bg-surface-contrast',
  text: 'text-app-foreground',
  textMuted: 'text-app-muted',
  input: 'bg-app-input border-app-border',
  inputFocus: 'focus:ring-app-primary/20 focus:border-app-primary',
  btnPrimary: 'bg-app-primary hover:opacity-90 text-white',
  btnSecondary: 'bg-app-surface hover:bg-app-surface-hover border-app-border text-app-foreground',
  btnDisabled: 'bg-app-disabled text-app-muted',
  iconColor: 'currentColor',
  menuHover: 'hover:bg-app-surface-hover',
  menuBg: 'bg-app-popover',
  menuBorder: 'border-app-border',
  menuDivider: 'border-app-border',
  primary: 'text-app-primary',
  badgeDisabled: 'bg-app-disabled text-app-muted',
  badgeActive: 'bg-success/10 text-success',
  badgeInfo: 'bg-info/10 text-info',
  badgeSuccess: 'bg-success/10 text-success',
  badgePurple: 'bg-purple-500/10 text-purple-500',
  badgeWarning: 'bg-warning/10 text-warning',
  badgeCyan: 'bg-cyan-500/10 text-cyan-500',
  toggleOff: 'bg-app-disabled',
  toggleOn: 'bg-success',
  toggleThumb: 'bg-white',
  codeBlock: 'bg-surface-contrast text-app-foreground',
  divider: 'border-app-border',
  tagActive: 'bg-surface-contrast/70',
  tagHover: 'hover:bg-surface-contrast/50',
  dialogHeader: 'bg-surface-contrast/50',
  dialogFooter: 'bg-surface-contrast/70 border-t border-app-border',
  dashedBorder: 'border-app-border',
  dashedBorderHover: 'hover:border-app-primary/40 hover:bg-surface-contrast/50',
  error: 'bg-error/10 text-error',
  errorBorder: 'border-error/20',
  warning: 'bg-warning/10',
  warningBorder: 'border-warning/20',
  info: 'bg-info/10',
  infoBorder: 'border-info/20',
  danger: 'bg-error/20 text-error',
  dangerHover: 'hover:bg-error/30',
  cardSelected: 'border-app-primary/40 bg-app-primary/5',
  cardCurrent: 'border-success/30 bg-success/5',
  cardBanned: 'border-error/30 bg-error/5',
  cardWarning: 'border-warning/30 bg-warning/5',
  machineIdText: 'text-error',
  machineIdTextSecondary: 'text-error/80',
  machineIdIcon: 'text-error',
  actionView: 'text-purple-500',
  actionRefresh: 'text-blue-500',
  actionSwitch: 'text-success',
  statusSuccessBg: 'bg-success',
  statusErrorBg: 'bg-error',
  statusLoadingBorder: 'border-app-muted',
  ringColor: 'ring-app-primary/5',
}

export const ThemeProvider = ({ children }) => {
  const { theme: nextTheme, setTheme } = useNextTheme()
  const activeTheme = nextTheme || 'dark'

  useEffect(() => {
    try {
      const root = window.document.documentElement
      const body = window.document.body
      const isLight = checkIsLightTheme(activeTheme)
      
      // 同步关键类名
      root.classList.toggle('dark', !isLight)
      body.classList.toggle('dark', !isLight)
      root.style.colorScheme = isLight ? 'light' : 'dark'
    } catch (err) {
      console.error('Theme bridge error:', err)
    }
  }, [activeTheme])

  const value = useMemo(() => ({
    theme: activeTheme,
    setTheme,
    colors: semanticColors // 这里变成了静态映射，极大降低了渲染开销
  }), [activeTheme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    return {
      theme: 'dark',
      colors: semanticColors,
      setTheme: () => {}
    }
  }
  return context
}
