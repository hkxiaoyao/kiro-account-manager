# Kiro Gateway 迁移规范

## 项目信息

- **外部项目路径**: `E:\VSCodeSpace\Kiro\kiro-gateway`
- **GitHub 仓库**: `hj01857655/kiro-gateway_dev`
- **用途**: 独立的 Kiro API 代理服务器

## 迁移策略

### ❌ 禁止操作
- **禁止** 直接复制文件覆盖（会破坏现有代码）
- **禁止** 保留 Tauri 依赖（独立项目不需要）
- **禁止** 简单粘贴代码（需要适配）

### ✅ 正确做法
1. **分析差异** - 对比两个项目的模块差异
2. **适配依赖** - 移除 Tauri，使用标准库
3. **整合代码** - 合并到现有文件，不创建重复
4. **测试编译** - 确保能正常编译运行

## 模块迁移清单

### 1. Logger 模块 ⚠️ 需要适配

**当前状态**: 依赖 Tauri 的 `AppHandle` 和 `Emitter`

**迁移方案**:
```rust
// 移除 Tauri 依赖
// use tauri::{AppHandle, Emitter};  // ❌ 删除

// 使用标准日志库
use tracing::{info, debug, warn, error};

// 简化为内存日志存储
use tokio::sync::RwLock;
use std::collections::VecDeque;

static LOGS: OnceLock<RwLock<VecDeque<LogEntry>>> = OnceLock::new();

pub fn emit_log_sync(level: &str, target: &str, message: &str) {
    let entry = LogEntry {
        timestamp: chrono::Utc::now().to_rfc3339(),
        level: level.to_string(),
        target: target.to_string(),
        message: message.to_string(),
    };
    
    // 同时输出到 tracing
    match level {
        "INFO" => info!(target: target, "{}", message),
        "DEBUG" => debug!(target: target, "{}", message),
        "WARN" => warn!(target: target, "{}", message),
        "ERROR" => error!(target: target, "{}", message),
        _ => {}
    }
    
    // 存储到内存（用于 /admin/logs API）
    if let Some(logs) = LOGS.get() {
        if let Ok(mut guard) = logs.try_write() {
            guard.push_back(entry);
            if guard.len() > 1000 {
                guard.pop_front();
            }
        }
    }
}

pub async fn get_logs() -> Vec<LogEntry> {
    if let Some(logs) = LOGS.get() {
        logs.read().await.iter().cloned().collect()
    } else {
        Vec::new()
    }
}

pub async fn clear_logs() {
    if let Some(logs) = LOGS.get() {
        logs.write().await.clear();
    }
}
```

### 2. Metrics 模块 ✅ 已存在

**状态**: 外部项目已有 `metrics.rs`，功能完整

**操作**: 对比两个版本，确保功能一致

### 3. Thinking Parser 模块 ✅ 已存在

**状态**: 外部项目已有 `thinking_parser.rs`

**操作**: 对比两个版本，确保功能一致

### 4. WebSearch 模块 ⚠️ 需要整合

**当前状态**: 已复制到外部项目

**需要适配**:
- 移除 `crate::kiro_gate::` 前缀
- 改为 `crate::` 或直接模块名
- 适配 `ServerState` 结构

### 5. Converter 模块 ✅ 已存在

**状态**: 外部项目已有 `converter.rs`

**操作**: 对比功能，确保模型映射一致

### 6. Auth 模块 ✅ 已存在

**状态**: 外部项目已有 `auth.rs`

**操作**: 对比 Token 刷新逻辑

### 7. Models 模块 ✅ 已存在

**状态**: 外部项目已有 `models.rs`

**操作**: 对比数据结构

### 8. Server 模块 ⚠️ 需要整合

**当前状态**: 已复制为 `server_new.rs`

**需要整合**:
- 对比现有 `main.rs` 的路由
- 合并 WebSearch 支持
- 合并多租户 API Key 支持
- 合并 Metrics 端点

## 依赖对比

### 当前项目 (Tauri)
```toml
tauri = { version = "2", features = ["..." ] }
tauri-plugin-* = "2"
```

### 外部项目 (独立)
```toml
axum = "0.7"
tokio = "1"
reqwest = "0.12"
# 无 Tauri 依赖
```

## 迁移步骤

### 第一步：适配 Logger
1. 打开 `E:\VSCodeSpace\Kiro\kiro-gateway\src\logger.rs`
2. 移除 Tauri 依赖
3. 实现内存日志存储
4. 添加 `get_logs()` 和 `clear_logs()` 函数

### 第二步：对比核心模块
1. 对比 `metrics.rs` - 确保统计功能一致
2. 对比 `thinking_parser.rs` - 确保解析逻辑一致
3. 对比 `converter.rs` - 确保模型映射一致
4. 对比 `auth.rs` - 确保 Token 刷新逻辑一致

### 第三步：整合 WebSearch
1. 修改 `websearch.rs` 中的模块引用
2. 从 `crate::kiro_gate::` 改为 `crate::`
3. 适配 `ServerState` 结构

### 第四步：整合 Server
1. 对比 `server_new.rs` 和 `main.rs`
2. 合并路由定义
3. 合并 WebSearch 处理
4. 合并 Metrics 端点
5. 删除 `server_new.rs`

### 第五步：测试编译
```bash
cd E:\VSCodeSpace\Kiro\kiro-gateway
cargo check
cargo build
cargo test
```

## 注意事项

1. **不要破坏现有功能** - 外部项目已经能运行，不要破坏
2. **逐步迁移** - 一个模块一个模块来，不要一次性改太多
3. **保留测试** - 确保每次修改后都能编译通过
4. **文档更新** - 更新 README 和 API 文档

## 访问外部项目

由于 Kiro IDE 的文件访问限制，访问外部项目必须使用 PowerShell：

```powershell
# 读取文件
Get-Content "E:\VSCodeSpace\Kiro\kiro-gateway\src\main.rs" -Raw

# 列出文件
Get-ChildItem "E:\VSCodeSpace\Kiro\kiro-gateway\src"

# 编辑文件（需要用 PowerShell 写入）
@"
// 新内容
"@ | Out-File -FilePath "E:\VSCodeSpace\Kiro\kiro-gateway\src\logger.rs" -Encoding UTF8 -Force
```

## 迁移完成标准

- [ ] Logger 模块已适配（移除 Tauri 依赖）
- [ ] 所有模块引用已修正
- [ ] `cargo check` 通过
- [ ] `cargo build` 成功
- [ ] 功能测试通过（OpenAI API、Anthropic API、WebSearch）
- [ ] Metrics 统计正常
- [ ] 文档已更新
