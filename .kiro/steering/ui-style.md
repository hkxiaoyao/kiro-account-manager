---
inclusion: always
---

# UI 样式规范

## 表单元素

### 下拉框 (select)
使用 ThemeContext 提供的 colors 变量，确保所有主题下样式一致：

```jsx
<select
  className={`px-4 py-3 border rounded-xl ${colors.text} ${colors.input} ${colors.inputFocus} focus:ring-2 transition-all`}
>
  <option value="xxx">选项</option>
</select>
```

**禁止**：
- ❌ 不要用 `bg-white/5` 或 `border-white/10` 这类硬编码
- ❌ 不要用 `style={{ backgroundColor: ... }}` 内联样式
- ❌ 不要给 `<option>` 单独设置样式（浏览器不支持）

**正确做法**：
- ✅ 使用 `${colors.input}` 设置背景和边框
- ✅ 使用 `${colors.inputFocus}` 设置聚焦样式
- ✅ 使用 `${colors.text}` 设置文字颜色

### 输入框 (input)
```jsx
<input
  className={`px-4 py-3 border rounded-xl ${colors.text} ${colors.input} ${colors.inputFocus} focus:ring-2 transition-all`}
/>
```

### 文本域 (textarea)
```jsx
<textarea
  className={`p-4 border rounded-xl ${colors.text} ${colors.input} ${colors.inputFocus} focus:ring-2 resize-none`}
/>
```

## ThemeContext colors 参考

| 变量 | 用途 |
|------|------|
| `colors.text` | 主文字颜色 |
| `colors.textMuted` | 次要文字颜色 |
| `colors.input` | 输入框背景+边框 |
| `colors.inputFocus` | 输入框聚焦样式 |
| `colors.card` | 卡片背景 |
| `colors.cardBorder` | 卡片边框 |

## 标签选择器交互规范

标签选择器（TagSelector）采用"填充编辑"模式，而非"直接添加"模式。

### 交互流程
1. 用户从下拉框选择已有标签
2. 标签名称填充到输入框（不直接添加到已选列表）
3. 用户可以在输入框中编辑标签名称
4. 点击添加按钮后：
   - 如果名称与已有标签相同 → 直接选中该标签
   - 如果名称是新的 → 创建新标签并选中

### UI 要求
- 可用标签必须使用下拉框（select），禁止平铺展示
- 下拉框选择后填充到输入框，不直接添加

### 设计原因
- 允许用户基于已有标签快速创建变体（如 "测试" → "测试-新"）
- 避免误操作直接添加不想要的标签
- 统一的添加入口，减少认知负担
- 下拉框避免标签过多时界面溢出

### 代码位置
- `TagSelector` 组件：`src/components/AccountManager/GroupTagManager.jsx`
- `BatchTagModal` 组件：`src/components/AccountManager/BatchTagModal.jsx`
