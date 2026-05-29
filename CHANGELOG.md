# Changelog

All notable changes will be documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.4] — 2026-05-29

### Added
- Interface language now available in 8 languages — Simplified Chinese,
  Traditional Chinese, English, Japanese, Korean, Spanish, French, and German
  (Settings → General → Interface language). "Follow system" auto-detects the
  browser locale. The translation card follows the chosen language too.
- More cloud provider presets: Moonshot (Kimi), Zhipu GLM, Qwen (DashScope),
  SiliconFlow, OpenRouter, and Mistral, in addition to OpenAI and DeepSeek.
  Providers with separate China and International services offer an endpoint
  picker so you can choose the right base URL.

### Changed
- The target translation language list is unchanged.

## [0.1.3] — 2026-05-29

### Added
- Dictionary mode: selecting a single word or short term shows a structured
  dictionary entry (US/UK IPA for single English words, part of speech, numbered
  senses, and an example) instead of a full translation. The mode is
  auto-detected from the selection, with a manual Translate/Define toggle on the
  card, and the card follows your UI language. Uses your configured model — no
  third-party dictionary service.
- Settings export / import (Settings → Data): back up or transfer your
  configuration as a JSON file. API keys are excluded by default (opt-in
  checkbox to include them). History and cache are not exported.

### Fixed
- Orphaned content scripts (after the extension reloads or updates while a tab
  is open) now show a "refresh this page" message instead of a raw
  "Cannot read properties of undefined" error.

## [0.1.2] — 2026-05-29

### Added
- Per-provider config memory: each cloud provider (OpenAI / DeepSeek /
  Custom) and Local remembers its own Base URL, API key, and model.
  Switching providers restores the remembered config instead of clearing
  to a blank slate — no re-typing. The active request always uses the
  active provider's key (keys are never cross-sent).

### Changed
- Popup "Save config" button renamed to "Apply config" — it now both
  saves the draft and switches the active provider.
- Popup version label is read from the extension manifest instead of a
  hardcoded string.
- Dependencies: zustand 5.0.14, lucide-preact 1.17.0.

### Fixed
- Selection trigger icon and translation card no longer render off-screen
  on scrolled pages (the shadow host was viewport-anchored while its
  contents used document coordinates).
- Long translations now scroll inside the card instead of overflowing
  past the viewport.

### Removed
- Dead `followUp` backend code (a remnant of the dropped multi-turn
  follow-up input that had no UI to invoke it).

## [0.1.1] — 2026-05-28

### Added
- TranslationCard now follows the user's theme (light / dark / auto).
- Popup API section: explicit Cloud / Local provider type toggle and
  Cloud provider preset dropdown (OpenAI / DeepSeek / Custom).
- 5-state status indicator: NOT CONFIGURED / CHECKING / READY / MODEL
  NOT FOUND / OFFLINE, auto-pinged on popup open and on Save.
- README mentions LiteLLM / OpenRouter as the path to Anthropic and
  Gemini until native presets land.

### Changed
- Popup API section now uses an explicit "Save config" button (draft
  editing) instead of live-saving every keystroke. Translation section
  is unchanged.
- Background ping no longer requires an API key when the provider type
  is Local; the Authorization header is omitted when the key is empty.
- Translate path (background + OpenAI provider) parity: Authorization
  header skipped for local providers, lets local Ollama-style servers
  translate end-to-end without a dummy key.

### Removed
- Manual "Test connection" button (subsumed by the auto-pinged status
  indicator).
- "Translation style preset" idea from the deferred wishlist.
- "Native Anthropic / Gemini providers" idea from the deferred
  wishlist (resolved via the LiteLLM hint).

### Fixed
- The popup status indicator no longer reports `READY` based on
  "fields are non-empty" — it now reflects the actual ping result.

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
