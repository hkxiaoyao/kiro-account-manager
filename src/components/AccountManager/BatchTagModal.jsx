import { useState, useEffect } from 'react'
import { X, Tag, Plus } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { useDialog } from '../../contexts/DialogContext'
import { getTags, setAccountTags } from '../../api/groupTag'
import { invoke } from '@tauri-apps/api/core'

const PRESET_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
]

function BatchTagModal({ accountIds, accounts = [], onClose, onSuccess }) {
  const { t, theme, colors } = useApp()
  const { showError } = useDialog()
  const isLightTheme = theme === 'light'
  
  const [tags, setTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTags().then(setTags).catch(() => {})
  }, [])

  // 计算选中账号的共同标签（交集）
  useEffect(() => {
    if (accounts.length === 0 || accountIds.length === 0) return
    
    const selectedAccounts = accounts.filter(a => accountIds.includes(a.id))
    if (selectedAccounts.length === 0) return
    
    // 获取所有选中账号的标签交集
    const firstTags = new Set(selectedAccounts[0]?.tags || [])
    const commonTags = selectedAccounts.slice(1).reduce((common, account) => {
      const accountTags = new Set(account.tags || [])
      return new Set([...common].filter(t => accountTags.has(t)))
    }, firstTags)
    
    setSelectedTagIds([...commonTags])
  }, [accounts, accountIds])

  const handleToggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleAddTag = async () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return
    const safeName = trimmed.slice(0, 20)
    
    const existing = tags.find(t => t.name === safeName)
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) {
        setSelectedTagIds([...selectedTagIds, existing.id])
      }
      setNewTagName('')
      return
    }
    
    const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    try {
      const newTag = await invoke('add_tag', { name: safeName, color })
      setTags([...tags, newTag])
      setSelectedTagIds([...selectedTagIds, newTag.id])
      setNewTagName('')
    } catch (e) {
      await showError(t('common.error'), e.toString())
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await Promise.all(accountIds.map(id => setAccountTags(id, selectedTagIds)))
      onSuccess?.()
      onClose()
    } catch (e) {
      await showError(t('common.error'), e.toString())
    } finally {
      setLoading(false)
    }
  }

  const availableTags = tags.filter(t => !selectedTagIds.includes(t.id))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`${isLightTheme ? 'bg-white' : 'bg-[#1a1a2e]'} rounded-xl w-full max-w-md shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${colors.cardBorder}`}>
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-purple-500" />
            <h3 className={`font-medium ${colors.text}`}>{t('tags.batchSet')}</h3>
            <span className={`text-sm ${colors.textMuted}`}>({accountIds.length})</span>
          </div>
          <button onClick={onClose} className={`p-1.5 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-white/10'} rounded-lg`}>
            <X size={18} className={colors.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 已选标签 - 点击 ❌ 取消 */}
          <div>
            <label className={`block text-sm font-medium ${colors.textMuted} mb-2`}>{t('tags.selected')}</label>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {selectedTagIds.length === 0 ? (
                <span className={`text-sm ${colors.textMuted}`}>{t('tags.noTags')}</span>
              ) : (
                selectedTagIds.map(tagId => {
                  const tag = tags.find(t => t.id === tagId)
                  if (!tag) return null
                  return (
                    <span key={tagId} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: tag.color || '#8b5cf6' }}
                      onClick={() => handleToggleTag(tagId)}
                      title={t('common.delete')}
                    >
                      {tag.name}
                      <X size={12} />
                    </span>
                  )
                })
              )}
            </div>
          </div>

          {/* 添加新标签 */}
          <div>
            <label className={`block text-sm font-medium ${colors.textMuted} mb-2`}>{t('tags.addTag')}</label>
            <div className="flex gap-2">
              <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newTagName.trim()) {
                      handleAddTag()
                    } else {
                      handleSubmit()
                    }
                  }
                }}
                placeholder={t('tags.newTagPlaceholder')}
                className={`flex-1 px-3 py-2 border ${colors.cardBorder} rounded-lg text-sm ${colors.input} ${colors.text}`}
              />
              <button type="button" onClick={handleAddTag} disabled={!newTagName.trim()}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* 可选标签 */}
          {availableTags.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${colors.textMuted} mb-2`}>{t('tags.available')}</label>
              <select
                onChange={(e) => {
                  const tagId = e.target.value
                  if (tagId) {
                    const tag = tags.find(t => t.id === tagId)
                    if (tag) setNewTagName(tag.name)
                  }
                  e.target.value = ''
                }}
                defaultValue=""
                className={`w-full px-3 py-2 border ${colors.cardBorder} rounded-lg text-sm ${colors.input} ${colors.text} ${isLightTheme ? 'bg-white' : 'bg-[#1a1a2e]'}`}
              >
                <option value="" disabled>{t('tags.selectTags')}</option>
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={`flex justify-end gap-3 px-5 py-4 border-t ${colors.cardBorder}`}>
          <button onClick={onClose} className={`px-4 py-2 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-white/10'} rounded-lg text-sm ${colors.text}`}>
            {t('common.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? t('common.saving') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BatchTagModal
