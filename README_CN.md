# BrowserTranslate

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

[English](./README.md) | **中文**

> 开源、隐私优先的浏览器翻译扩展。自带 LLM API Key，零中转，零遥测。

## 为什么

市面上的翻译扩展要么把 LLM 锁在付费墙后、要么把你的文本经它们的服务器中转、要么把决定翻译质量的 prompt 藏起来。BrowserTranslate 反对以上三点。

- **自带 Key**：兼容所有 OpenAI 协议的服务——OpenAI、DeepSeek、Moonshot、Groq、SiliconFlow、OpenRouter、本地 Ollama / LM Studio / vLLM
- **零中转**：翻译请求由你的浏览器直接打到你配置的服务方，我们没有服务器
- **零遥测**：不接入任何统计、错误上报、远程日志
- **Prompt 开放**：所有翻译 prompt 都可编辑，自由调教学术 / 口语 / 技术风格
- **一键连接测试**：翻译前先在 popup 验证端点和模型是否可用

## 功能（v1）

- 划词翻译（图标二段触发，或纯快捷键模式）
- 流式输出（SSE）
- 多轮追问（"解释这个术语"、"翻得直白一点"）
- 4 个内置 Prompt 模板 + 无限自定义模板
- 内置连接测试（验证端点 + 模型有效性）
- 翻译缓存（可配 TTL）
- 翻译历史（可搜索）
- 浅色 / 深色主题（跟随系统）
- UI 支持中英文

## 安装

### Chrome / Edge / Brave / Arc

1. 在 [Releases](https://github.com/Lewen-Cai/BrowserTranslate/releases) 下载最新 `.zip`
2. 解压
3. 打开 `chrome://extensions` → 开启开发者模式 → "加载已解压的扩展程序" → 选解压后的目录

Chrome Web Store 上架中。

## 配置

1. 点扩展图标，popup 即是快速配置面板。
2. 填入 **Base URL**、**API Key** 和 **Model**（例如 `https://api.deepseek.com/v1` + 你的 key + `deepseek-chat`）。
3. 点击 **Test connection** 验证端点是否可达、模型名是否有效。
4. 在任意网页选中文字 → 点蓝色图标（或按 **Alt+T**）→ 看到译文。

高级设置（Prompt 模板、历史记录、主题、界面语言）在完整设置页里 —— 通过 popup 右上角的 ⚙ 图标进入。

## 开发

```bash
pnpm install
pnpm dev          # 开发构建，监听 src/，输出到 .output/
pnpm test         # 监听模式跑测试
pnpm build        # 生产构建
```

加载 `.output/chrome-mv3-dev/`（开发）或 `.output/chrome-mv3/`（生产）作为未打包扩展。

## 许可证

GPL-3.0。详见 [LICENSE](./LICENSE)。

选用 GPL 是刻意的：派生作品必须保持开源，防止本项目的初衷被闭源付费 fork 反噬。
