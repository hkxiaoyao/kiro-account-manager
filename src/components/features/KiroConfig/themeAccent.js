import { isLightTheme as checkIsLightTheme } from '../../../utils/themeMode'

/**
 * 现代化的主题装饰系统
 * 全部基于 CSS 变量驱动，确保与 index.css 100% 同步
 */
const THEME_ACCENTS = {
  // 共享的变量驱动配置
  base: {
    text: 'text-[var(--primary)]',
    textHover: 'hover:text-[var(--primary)]',
    textSoft: 'text-[var(--primary)]/80',
    bg: 'bg-[var(--primary)]/20',
    bgSoft: 'bg-[var(--primary)]/10',
    hoverBgSoft: 'hover:bg-[var(--primary)]/15',
    border: 'border-[var(--primary)]/50',
    borderSoft: 'border-[var(--primary)]/20',
    hoverBorder: 'hover:border-[var(--primary)]/40',
    ring: 'ring-[var(--primary)]/60',
    gradientFrom: 'from-[var(--primary)]',
    gradientTo: 'to-[var(--primary)]/60',
    solidBg: 'bg-[var(--primary)]',
    solidHoverBg: 'hover:opacity-90',
    gradientHoverFrom: 'hover:from-[var(--primary)]/90',
    gradientHoverTo: 'hover:to-[var(--primary)]/50',
    shadow: 'shadow-[var(--primary)]/20',
    scopeBadge: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
    tabActive: 'bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm',
    iconBadgeBg: 'bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5',
  }
}

// 兼容旧接口，但逻辑已简化为全自动适配
export function getThemeAccent() {
  return THEME_ACCENTS.base
}

export function isLightTheme(theme) {
  return checkIsLightTheme(theme)
}

// 表面样式也统一由 CSS 变量控制
export function getThemeSurfaceStyles() {
  return {
    inputBg: 'transparent',
    inputBorder: 'var(--border)',
    inputText: 'var(--foreground)',
    placeholder: 'var(--muted-foreground)',
    dropdownBg: 'var(--popover)',
    dropdownBorder: 'var(--border)',
    editorText: 'var(--foreground)',
    editorBg: 'rgb(var(--surface-rgb) / 0.1)',
    editorBorder: 'var(--border)',
    pillBg: 'rgb(var(--primary-rgb) / 0.1)',
    pillText: 'var(--primary)',
    pillBorder: '1px solid rgb(var(--primary-rgb) / 0.2)',
  }
}

export function getSolidAccentButton(accent) {
  return `${accent.solidBg} text-white ${accent.solidHoverBg}`
}

export function getGradientAccentButton(accent) {
  return `bg-gradient-to-r ${accent.gradientFrom} ${accent.gradientTo} text-white shadow-lg ${accent.shadow} ${accent.gradientHoverFrom} ${accent.gradientHoverTo}`
}
