const DARK_THEME_NAMES = Object.freeze(['dark', 'dark-one', 'tech', 'midnight'])

export function isLightTheme(theme) {
  return !DARK_THEME_NAMES.includes(theme)
}
