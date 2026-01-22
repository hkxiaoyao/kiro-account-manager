// Toast 通知工具
import toast from 'react-hot-toast'

/**
 * 成功提示
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    ...options,
  })
}

/**
 * 错误提示
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    ...options,
  })
}

/**
 * 警告提示
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    duration: 3500,
    position: 'top-center',
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    ...options,
  })
}

/**
 * 普通提示
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 3000,
    position: 'top-center',
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    ...options,
  })
}

/**
 * 加载提示
 */
export const showLoading = (message = '加载中...', options = {}) => {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      background: '#6366f1',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    ...options,
  })
}

/**
 * Promise 提示（自动处理成功/失败）
 */
export const showPromise = (promise, messages = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || '处理中...',
      success: messages.success || '操作成功',
      error: messages.error || '操作失败',
    },
    {
      position: 'top-center',
      style: {
        borderRadius: '12px',
        padding: '12px 20px',
      },
    }
  )
}

/**
 * 注意：确认对话框请使用 DialogContext 的 showConfirm
 * import { useDialog } from '@/contexts/DialogContext'
 * const { showConfirm } = useDialog()
 * const confirmed = await showConfirm('标题', '消息')
 */

export default toast
