# 双仓库工作流程

## 概述
- **私有仓库**：开发版本（内部开发、测试）
- **公开仓库**：发行版本（用户使用、release）

## 工作流程

### 1. 本地开发（私有仓库）
```powershell
# 克隆私有仓库
git clone <private-repo-url>

# 日常开发、提交、推送
git add .
git commit -m "message"
git push origin main
```

### 2. 同步到公开仓库
```powershell
# 添加公开仓库为远程分支
git remote add public <public-repo-url>

# 推送到公开仓库
git push public main
```

### 3. 创建 Release（公开仓库）
```powershell
# 在公开仓库上创建 tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push public v1.0.0

# 或在 GitHub 网页上：
# 1. 进入 Releases
# 2. 点击 "New Release"
# 3. 选择 tag，填写描述
# 4. 点击 "Publish Release"
```

## 常用命令

### 查看远程仓库
```powershell
git remote -v
```

### 拉取最新代码
```powershell
# 从私有仓库
git pull origin main

# 从公开仓库
git pull public main
```

### 删除远程 tag
```powershell
git push public --delete v1.0.0
```
