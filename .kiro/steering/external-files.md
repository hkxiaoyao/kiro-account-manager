---
inclusion: always
---

# 外部文件访问

## 参考项目路径
- `D:\Downloads\Documents\kiro-account0manager` - 参考项目，可用于对比功能实现

## 访问方式
工作区外的文件无法用 readFile 工具读取，需要用 PowerShell 命令：

```powershell
# 读取文件内容
Get-Content -Path "D:\path\to\file.jsx" -Raw

# 列出目录
Get-ChildItem -Path "D:\path\to\dir" -Recurse
```
