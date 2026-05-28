export type Locale = 'en' | 'zh-CN';

export const STRINGS = {
  // Common
  loading: { en: 'Loading…', 'zh-CN': '加载中…' },
  save: { en: 'Save', 'zh-CN': '保存' },
  cancel: { en: 'Cancel', 'zh-CN': '取消' },
  delete: { en: 'Delete', 'zh-CN': '删除' },
  edit: { en: 'Edit', 'zh-CN': '编辑' },
  close: { en: 'Close', 'zh-CN': '关闭' },
  clone: { en: 'Clone', 'zh-CN': '克隆' },
  clearAll: { en: 'Clear all', 'zh-CN': '清空全部' },
  // Popup / options shared
  settings: { en: 'Settings', 'zh-CN': '设置' },
  openFullSettings: { en: 'Open full settings', 'zh-CN': '打开完整设置' },
  privacyTagline: { en: 'Open-source · BYOK · Zero relay · Zero telemetry', 'zh-CN': '开源 · 自带 Key · 零中转 · 零遥测' },
  ready: { en: 'Ready', 'zh-CN': '已就绪' },
  notConfigured: { en: 'Not configured', 'zh-CN': '尚未配置' },
  // Sections
  sectionApi: { en: 'API', 'zh-CN': 'API' },
  sectionTranslation: { en: 'Translation', 'zh-CN': '翻译' },
  sectionRecent: { en: 'Recent', 'zh-CN': '最近翻译' },
  sectionApiEndpoint: { en: 'API Endpoint', 'zh-CN': '接口地址' },
  sectionCacheHistory: { en: 'Cache & History', 'zh-CN': '缓存与历史' },
  sectionAppearance: { en: 'Appearance', 'zh-CN': '外观' },
  sectionPromptTemplates: { en: 'Prompt Templates', 'zh-CN': '提示词模板' },
  sectionHistory: { en: 'History', 'zh-CN': '翻译历史' },
  openaiCompatible: { en: 'OpenAI-compatible', 'zh-CN': '兼容 OpenAI 协议' },
  // Options nav
  navApi: { en: 'API', 'zh-CN': 'API' },
  navPrompts: { en: 'PROMPTS', 'zh-CN': '提示词' },
  navGeneral: { en: 'GENERAL', 'zh-CN': '通用' },
  navHistory: { en: 'HISTORY', 'zh-CN': '历史' },
  // Provider type + presets
  providerType: { en: 'Provider type', 'zh-CN': '服务类型' },
  providerTypeCloud: { en: 'Cloud', 'zh-CN': '云服务' },
  providerTypeLocal: { en: 'Local', 'zh-CN': '本地' },
  cloudProvider: { en: 'Provider', 'zh-CN': '供应商' },
  cloudProviderCustom: { en: 'Custom', 'zh-CN': '自定义' },
  saveConfig: { en: 'Save config', 'zh-CN': '保存配置' },
  // Status states
  statusChecking: { en: 'Checking…', 'zh-CN': '检测中…' },
  statusModelMissing: { en: 'Model not found', 'zh-CN': '模型未找到' },
  statusOffline: { en: 'Offline', 'zh-CN': '离线' },
  // API form
  baseUrl: { en: 'Base URL', 'zh-CN': 'Base URL' },
  apiKey: { en: 'API Key', 'zh-CN': 'API Key' },
  model: { en: 'Model', 'zh-CN': '模型' },
  defaultPromptTemplate: { en: 'Default prompt template', 'zh-CN': '默认提示词模板' },
  prompt: { en: 'Prompt', 'zh-CN': '提示词' },
  // Translation form
  targetLanguage: { en: 'Target language', 'zh-CN': '目标语言' },
  triggerMode: { en: 'Trigger mode', 'zh-CN': '触发方式' },
  hotkey: { en: 'Hotkey', 'zh-CN': '快捷键' },
  hotkeyHint: { en: 'Works in both modes. Active in any tab.', 'zh-CN': '任何页面都能用，两种触发方式下都有效。' },
  iconAfterSelection: { en: 'Icon after selection (default)', 'zh-CN': '选中文本后显示图标（默认）' },
  hotkeyOnly: { en: 'Hotkey only — no icon', 'zh-CN': '仅快捷键触发 — 不显示图标' },
  // Behavior
  streamingOutput: { en: 'Streaming output', 'zh-CN': '流式输出' },
  streamingDesc: { en: 'Show translation as it generates', 'zh-CN': '边生成边显示译文' },
  cacheTranslations: { en: 'Cache translations', 'zh-CN': '缓存译文' },
  cacheDesc: { en: 'Reuse exact-match translations to save tokens', 'zh-CN': '相同文本直接复用缓存，省 token' },
  cacheTtl: { en: 'Cache TTL (days)', 'zh-CN': '缓存有效期（天）' },
  saveHistory: { en: 'Save translation history', 'zh-CN': '记录翻译历史' },
  saveHistoryDesc: { en: 'Stored locally; never sent anywhere', 'zh-CN': '仅保存在本地，不会上传任何地方' },
  historyMax: { en: 'History max entries', 'zh-CN': '历史记录上限' },
  cacheShort: { en: 'Cache', 'zh-CN': '缓存' },
  streamingShort: { en: 'Streaming', 'zh-CN': '流式' },
  historyShort: { en: 'History', 'zh-CN': '历史' },
  // Appearance
  theme: { en: 'Theme', 'zh-CN': '主题' },
  themeAuto: { en: 'Follow system', 'zh-CN': '跟随系统' },
  themeLight: { en: 'Light', 'zh-CN': '浅色' },
  themeDark: { en: 'Dark', 'zh-CN': '深色' },
  uiLanguage: { en: 'Interface language', 'zh-CN': '界面语言' },
  uiLangAuto: { en: 'Follow system', 'zh-CN': '跟随系统' },
  uiLangEn: { en: 'English', 'zh-CN': 'English' },
  uiLangZhCN: { en: '简体中文', 'zh-CN': '简体中文' },
  // Prompt templates
  newTemplate: { en: 'New template', 'zh-CN': '新建模板' },
  builtin: { en: 'BUILTIN', 'zh-CN': '内置' },
  systemPrompt: { en: 'System prompt', 'zh-CN': '系统提示词' },
  userPromptTemplate: { en: 'User prompt template', 'zh-CN': '用户提示词模板' },
  userPromptTemplateHint: { en: 'Variables · {{text}} (required) · {{targetLang}} · {{sourceLang}} · {{url}} · {{title}}', 'zh-CN': '变量列表：{{text}}（必填）· {{targetLang}} · {{sourceLang}} · {{url}} · {{title}}' },
  viewReadonly: { en: 'View · Read-only', 'zh-CN': '查看 · 只读' },
  editTemplate: { en: 'Edit template', 'zh-CN': '编辑模板' },
  // History
  searchHistory: { en: 'Search source or translation...', 'zh-CN': '搜索原文或译文…' },
  noEntries: { en: 'No entries', 'zh-CN': '暂无记录' },
  noEntriesHint: { en: 'Translations you make will appear here.', 'zh-CN': '做过的翻译会显示在这里' },
  // Errors
  noProfileError: { en: 'API not configured. Open settings to add your key.', 'zh-CN': '尚未配置 API，请到设置中填入 Key。' },
};

export type StringKey = keyof typeof STRINGS;
