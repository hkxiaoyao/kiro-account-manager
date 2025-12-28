---
inclusion: always
---

# 技术栈

## 前端
- React 18 + JSX（非 TypeScript）
- Vite 5 打包
- TailwindCSS 3 样式
- Lucide React 图标
- Tauri API v2 通信（`@tauri-apps/api/core`）
- i18next + react-i18next 国际化（i18n）

## 后端（Rust）
- Tauri 2.x 框架
- Tokio 异步运行时
- Reqwest HTTP 请求
- Serde 序列化
- JSON 文件本地存储
- Chrono 日期时间处理
- SHA2/Hex 哈希计算

## Tauri 插件
- `tauri-plugin-shell` - Shell 命令执行
- `tauri-plugin-process` - 进程管理
- `tauri-plugin-updater` - 自动更新
- `tauri-plugin-opener` - 打开 URL/文件
- `tauri-plugin-dialog` - 系统对话框
- `tauri-plugin-fs` - 文件系统操作
- `tauri-plugin-deep-link` - Deep Link 处理（OAuth 回调）

## 依赖管理

- 新增/删除/更新依赖后必须运行 `npm install` 同步 package-lock.json
- 只改版本号不需要 npm install
- 提交代码前确保两个文件版本一致，否则 CI 构建会失败

## 常用命令

```bash
# 安装依赖（同时更新 lock 文件）
npm install

# 开发模式（启动 Vite + Tauri 开发服务器）
npm run tauri dev

# 构建生产版本
npm run tauri build

# 仅前端开发
npm run dev

# 仅前端构建
npm run build

# 提取国际化文本
npm run extract

# 编译国际化文件
npm run compile
```

## 配置文件
- `vite.config.js` - Vite 配置（端口 1420）
- `tailwind.config.js` - TailwindCSS 配置
- `locales/*.json` - i18next 语言包（zh-CN、en-US、ru-RU）
- `src-tauri/tauri.conf.json` - Tauri 应用配置
- `src-tauri/Cargo.toml` - Rust 依赖

## 平台支持
- Windows 10/11 (64位) - 需要 WebView2
- macOS 10.15+（Intel/Apple Silicon）

## 界面主题
- 浅色（light）
- 深色（dark）
- 紫色（purple）
- 绿色（green）
