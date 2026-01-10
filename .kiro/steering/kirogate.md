# KiroGate 参考规范

## 原项目

- **GitHub**: https://github.com/aliom-v/KiroGate
- **本地 Fork**: `E:\VSCodeSpace\Kiro\KiroGate`

## 参考说明

本项目部分功能参考了 KiroGate 原项目的实现，开发相关功能时可以参考原项目代码。

## 可参考的功能

- Token 刷新逻辑
- 配额获取接口
- AWS SSO OIDC 认证流程
- Kiro API 调用方式

## 访问方式

KiroGate 原项目在工作区外，需要通过 PowerShell 访问：
```powershell
Get-Content "E:\VSCodeSpace\Kiro\KiroGate\文件路径" -Raw
```

## 注意事项

- 参考实现思路，不要直接复制代码
- 本项目使用 Rust + React，KiroGate 使用 Python
- 接口调用方式可能有差异，需要适配
