---
inclusion: always
---

# 子代理使用指南

## 何时使用子代理

- 需要并行执行多个独立任务时
- 探索不熟悉的代码库时（用 context-gatherer）
- 任务可以拆分且互不依赖时

## 内置子代理

- **context-gatherer** - 项目探索，识别相关文件
- **general-task-execution** - 通用任务并行化

## 触发方式

自然语言触发：
- "用子代理并行执行任务 1 和任务 2"
- "Use subagents to execute tasks in parallel"

## 注意事项

- 每个子代理有独立的上下文窗口
- 子代理完成后结果返回主代理
- 适合大型重构或多文件修改
