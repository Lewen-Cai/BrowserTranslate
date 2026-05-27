# Changelog

All notable changes will be documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-05-28

### Added
- Selection-based translation: floating icon at top-right of selection (or hotkey-only mode), with a translation card that streams the LLM response inline.
- Single API configuration: Base URL, API Key, Model, default prompt template — works with any OpenAI-compatible endpoint (OpenAI, DeepSeek, Moonshot, Groq, SiliconFlow, OpenRouter, local Ollama, LM Studio, vLLM).
- One-click connection test that verifies the endpoint is reachable AND the configured model exists in the provider's `/models` list.
- 4 built-in prompt templates (General, Academic, Casual, Technical) plus unlimited user-defined templates with `{{text}}` / `{{targetLang}}` / `{{sourceLang}}` / `{{url}}` / `{{title}}` variables.
- Translation cache (configurable TTL) and translation history (searchable, capped, never leaves the device).
- Popup as a self-contained control center; full settings open in a dedicated tab.
- Light / Dark / Follow-system theme.
- UI in English and Simplified Chinese (auto-detects browser locale).
- Apparatus design system: self-hosted Geist Sans + Geist Mono, numbered section headers, hairline rules, custom rocker toggles.
- Chromium MV3; CI checks typecheck / lint / unit tests / production build on every PR.

### Privacy
- Zero relay: requests go directly from your browser to the configured provider.
- Zero telemetry: no analytics, no error reporting, no remote logging.
