import { useState, useEffect } from 'react'
import { AlertTriangle, X, ExternalLink } from 'lucide-react'
import { useApp } from '../hooks/useApp'

// 公告版本号，修改此值会重新显示公告
const ANNOUNCEMENT_VERSION = '1'

export default function AnnouncementModal() {
  const { t, theme, colors } = useApp()
  const isDark = theme === 'dark' || theme === 'purple'
  const [show, setShow] = useState(false)

  useEffect(() => {
    // 检查是否已经显示过此版本的公告
    const shownVersion = localStorage.getItem('announcement_shown')
    if (shownVersion !== ANNOUNCEMENT_VERSION) {
      setShow(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('announcement_shown', ANNOUNCEMENT_VERSION)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-[480px] max-w-[90vw] rounded-2xl shadow-2xl border ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } overflow-hidden animate-fade-in-up`}>
        {/* 顶部警告条 */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={24} className="text-white" />
          <span className="text-white font-bold text-lg">{t('announcement.title')}</span>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className={`text-base leading-relaxed ${colors.text}`}>
            <p className="mb-4 font-medium text-red-500">
              ⚠️ {t('announcement.warning')}
            </p>
            <p className="mb-3">
              {t('announcement.content1')}
            </p>
            <p className="mb-3">
              {t('announcement.content2')}
            </p>
            <p className={`text-sm ${colors.textMuted}`}>
              {t('announcement.content3')}
            </p>
          </div>

          {/* 官方链接 */}
          <div className={`mt-5 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium mb-2 ${colors.text}`}>{t('announcement.official')}</p>
            <a 
              href="https://github.com/hj01857655/kiro-account-manager" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-sm"
            >
              <span>github.com/hj01857655/kiro-account-manager</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t('announcement.understand')}
          </button>
        </div>
      </div>
    </div>
  )
}
