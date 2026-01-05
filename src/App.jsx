import { useState, useEffect, Suspense } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import Sidebar from './components/Sidebar'
import UpdateChecker from './components/UpdateChecker'
import AnnouncementModal from './components/AnnouncementModal'

import { useApp } from './hooks/useApp'
import { useAutoRefresh } from './hooks/useAutoRefresh'
import { useAutoSwitch } from './hooks/useAutoSwitch'
import { useModelLock } from './hooks/useModelLock'
import { useAppSettings } from './contexts/AppSettingsContext'
import { AccountProvider } from './contexts/AccountContext'
import { PrivacyProvider } from './contexts/PrivacyContext'
import { routes, internalRoutes } from './routes'

// 构建路由映射
const routeMap = Object.fromEntries(routes.map(r => [r.id, r.component]))
const allRoutes = { ...routeMap, ...internalRoutes }

// 页面加载骨架屏
function PageLoading() {
  const { colors } = useApp()
  return (
    <div className={`h-full flex items-center justify-center ${colors.main}`}>
      <div className={`animate-pulse ${colors.textMuted}`}>加载中...</div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState(() => {
    // 从 localStorage 恢复上次的页面
    return localStorage.getItem('activeMenu') || 'home'
  })
  const { colors } = useApp()
  const { settings: appSettings, loading: settingsLoading } = useAppSettings()

  // 保存当前页面到 localStorage
  useEffect(() => {
    if (activeMenu && activeMenu !== 'callback') {
      localStorage.setItem('activeMenu', activeMenu)
    }
  }, [activeMenu])

  // 使用抽离的 hooks
  const { startAutoRefreshTimer } = useAutoRefresh(appSettings, settingsLoading)
  const { startAutoSwitchTimer } = useAutoSwitch(appSettings, settingsLoading)
  const { checkAndRestoreLockedModel } = useModelLock(appSettings, settingsLoading)

  useEffect(() => {
    checkAuth()
    
    // 检查是否是回调页面
    const url = new URL(window.location.href)
    if (url.pathname === '/callback' && (url.searchParams.has('code') || url.searchParams.has('state'))) {
      setActiveMenu('callback')
      return
    }
    
    let unlisten = null
    let unlistenSettings = null
    let unlistenAppSettings = null
    let mounted = true

    const setupListeners = async () => {
      // 监听登录成功事件
      unlisten = await listen('login-success', (event) => {
        if (!mounted) return
        console.log('Login success in App:', event.payload)
        checkAuth()
        setActiveMenu('accounts')
      })
      
      // 监听设置变化，重启定时器
      unlistenSettings = await listen('settings-changed', () => {
        if (!mounted) return
        console.log('[AutoRefresh] 设置已变化，重启定时器')
        startAutoRefreshTimer()
        startAutoSwitchTimer()
      })
      
      // 监听设置变化，重新检查模型
      unlistenAppSettings = await listen('app-settings-changed', () => {
        if (!mounted) return
        console.log('[ModelLock] 设置已变化，重新检查模型')
        checkAndRestoreLockedModel()
      })
    }

    setupListeners()
    
    return () => { 
      mounted = false
      if (unlisten) unlisten()
      if (unlistenSettings) unlistenSettings()
      if (unlistenAppSettings) unlistenAppSettings()
    }
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await invoke('get_current_user')
      setUser(currentUser)
    } catch (e) {
      console.error('Auth check failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (loggedInUser) => {
    if (loggedInUser) {
      setUser(loggedInUser)
    }
    checkAuth()
  }

  const handleLogout = async () => {
    await invoke('logout')
    setUser(null)
  }

  // 路由渲染：根据 activeMenu 动态获取组件
  const renderContent = () => {
    const RouteComponent = allRoutes[activeMenu] || allRoutes.home
    // 特殊处理需要 props 的路由
    const routeProps = {
      home: { onNavigate: setActiveMenu },
      desktopOAuth: { onLogin: (user) => { handleLogin(user); setActiveMenu('accounts') } },
    }
    return <RouteComponent {...(routeProps[activeMenu] || {})} />
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  return (
    <PrivacyProvider>
      <AccountProvider>
        <div className={`flex h-screen ${colors.main}`}>
          <Sidebar 
            activeMenu={activeMenu} 
            onMenuChange={setActiveMenu}
            user={user}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-hidden">
            <Suspense fallback={<PageLoading />}>
              {renderContent()}
            </Suspense>
          </main>
          
          <UpdateChecker />
          <AnnouncementModal />
        </div>
      </AccountProvider>
    </PrivacyProvider>
  )
}

export default App
