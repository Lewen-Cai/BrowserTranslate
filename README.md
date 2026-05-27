# BrowserTranslate

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![CI](https://github.com/Lewen-Cai/BrowserTranslate/actions/workflows/ci.yml/badge.svg)](https://github.com/Lewen-Cai/BrowserTranslate/actions/workflows/ci.yml)

**English** | [中文](./README_CN.md)

> Open-source, privacy-first browser translation extension. Bring your own LLM key. Zero relay, zero telemetry.

## Why

Existing translation extensions either lock LLM access behind paywalls, route your text through their servers, or hide the prompts that drive translation quality. BrowserTranslate is the opposite of all three.

- **Bring your own key** — works with any OpenAI-compatible API: OpenAI, DeepSeek, Moonshot, Groq, SiliconFlow, OpenRouter, local Ollama, LM Studio, vLLM
- **Zero relay** — your text goes directly from your browser to the provider you configured. We have no server.
- **Zero telemetry** — no analytics, no error reporting, no remote logging
- **Open prompts** — every translation prompt is editable. Tune for academic / casual / technical / your-own-style
- **One-click connection test** — verify endpoint + model in the popup before translating

## Features

- Selection-based translation with floating icon (or hotkey-only mode)
- Streaming output via Server-Sent Events
- Multi-turn follow-up ("explain this term", "translate more literally")
- 4 built-in prompt templates + unlimited custom templates
- Built-in connection test (verifies endpoint and model availability)
- Translation cache (configurable TTL)
- Translation history with search
- Light / dark theme (follows system)
- UI available in English and Simplified Chinese

## Install

### Chrome / Edge / Brave / Arc

1. Download the latest `.zip` from [Releases](https://github.com/Lewen-Cai/BrowserTranslate/releases)
2. Unzip
3. Open `chrome://extensions` → enable Developer mode → "Load unpacked" → select the unzipped folder

Chrome Web Store listing pending.

## Configure

1. Click the extension icon — the popup opens as the quick config panel.
2. Fill **Base URL**, **API Key**, and **Model** (e.g. `https://api.deepseek.com/v1` + your key + `deepseek-chat`).
3. Click **Test connection** to verify the endpoint is reachable and your model name is valid.
4. Select text on any webpage → click the blue icon (or press **Alt+T**) → see the translation.

Advanced settings (prompt templates, history, theme, UI language) live in the full settings page — accessible via the ⚙ icon at the top-right of the popup.

## Develop

```bash
pnpm install
pnpm dev          # start dev build, watches src/, output in .output/
pnpm test         # run tests in watch mode
pnpm build        # production build
```

Load `.output/chrome-mv3-dev/` (dev) or `.output/chrome-mv3/` (prod) as an unpacked extension.

## License

GPL-3.0. See [LICENSE](./LICENSE).

This license is chosen deliberately: derivative works must remain open-source, preventing the closed-source paywalled forks that motivated this project.
