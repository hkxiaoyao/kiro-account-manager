---
inclusion: always
---

# 外部文件访问

## 参考项目

### KiroGate 原版
- GitHub 仓库：https://github.com/aliom-v/KiroGate
- owner: `aliom-v`
- repo: `KiroGate`
- OpenAI 兼容的 Kiro API 代理服务
- 用于参考 KiroGate 功能实现

### Kiro Account Manager 参考
- GitHub 仓库：https://github.com/chaogei/Kiro-account-manager
- owner: `chaogei`
- repo: `Kiro-account-manager`
- 用于对比功能实现和学习优化

## 访问 GitHub 仓库
使用 MCP GitHub 工具访问：
```
mcp_github_get_file_contents(owner="aliom-v", repo="KiroGate", path="路径")
mcp_github_get_file_contents(owner="chaogei", repo="Kiro-account-manager", path="路径")
```
