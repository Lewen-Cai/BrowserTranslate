import { APP_DATA_VERSION, type AppData } from './schema';
import { BUILTIN_TEMPLATES } from '~/core/prompt/builtin';

export function createDefaultAppData(): AppData {
  return {
    version: APP_DATA_VERSION,
    api: {
      baseUrl: '',
      apiKey: '',
      model: '',
      promptTemplateId: 'builtin-general',
      providerType: 'cloud',
      cloudProvider: 'custom',
    },
    settings: {
      targetLanguage: 'zh-CN',
      triggerMode: 'icon',
      hotkey: 'Alt+T',
      fullPageHotkey: 'Alt+A',
      cacheEnabled: true,
      cacheTTLDays: 7,
      theme: 'auto',
      uiLanguage: 'auto',
    },
    promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
  };
}
