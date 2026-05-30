export const APP_DATA_VERSION = 1 as const;

export interface AppData {
  version: typeof APP_DATA_VERSION;
  api: ApiSettings;
  settings: GlobalSettings;
  promptTemplates: PromptTemplate[];
}

export interface ApiSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  promptTemplateId: string;
  customHeaders?: Record<string, string>;
  providerType: 'cloud' | 'local';
  cloudProvider:
    | 'openai'
    | 'deepseek'
    | 'moonshot'
    | 'zhipu'
    | 'dashscope'
    | 'siliconflow'
    | 'openrouter'
    | 'mistral'
    | 'custom';
  savedConfigs?: Partial<Record<ProviderSlot, ProviderConfig>>;
}

/** Identity of a remembered config bucket. */
export type ProviderSlot = ApiSettings['cloudProvider'] | 'local';

/** The remembered config for one provider slot. */
export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface GlobalSettings {
  targetLanguage: string;
  triggerMode: 'icon' | 'hotkey';
  hotkey: string;
  fullPageHotkey: string;
  cacheEnabled: boolean;
  cacheTTLDays: number;
  historyEnabled: boolean;
  historyMaxEntries: number;
  theme: 'light' | 'dark' | 'auto';
  uiLanguage: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de';
}

export interface PromptTemplate {
  id: string;
  name: string;
  isBuiltin: boolean;
  systemPrompt: string;
  userPromptTemplate: string;
  createdAt: number;
  updatedAt: number;
}

export interface CacheMeta {
  key: string;
  storageKey: string;
  createdAt: number;
  hitCount: number;
}

export interface CacheEntry {
  translated: string;
}

export interface HistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  model: string;        // ← was profileId; snapshot of model used at translation time
  targetLang: string;
  url?: string;
  title?: string;
  createdAt: number;
}
