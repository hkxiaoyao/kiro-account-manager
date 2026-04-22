import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider'
import { DialogProvider } from './contexts/DialogContext.jsx'
import { AppSettingsProvider } from './contexts/AppSettingsContext.jsx'
import { I18nProvider } from './i18n.jsx'
import { TooltipProvider } from '@/components/ui/tooltip'

// 生产环境禁用浏览器快捷键
if (import.meta.env.PROD) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || e.key === 'F12') {
      e.preventDefault()
      return false
    }
    if (e.ctrlKey) {
      const key = e.key.toLowerCase()
      if (['r', 'u', 'p', 's', 'g', 'f'].includes(key)) {
        e.preventDefault()
        return false
      }
      if (e.shiftKey && ['i', 'j'].includes(key)) {
        e.preventDefault()
        return false
      }
    }
  })

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nProvider>
    <AppSettingsProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        themes={[
          'light', 'dark', 'dark-one', 'tech', 'midnight', 
          'purple', 'green', 'business', 'sunset', 'ocean', 
          'forest', 'rose', 'aurora', 'sakura'
        ]}
      >
        <TooltipProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </TooltipProvider>
      </ThemeProvider>
    </AppSettingsProvider>
  </I18nProvider>,
)
