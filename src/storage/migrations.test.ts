import { describe, it, expect } from 'vitest';
import { migrateAppData } from './migrations';
import { APP_DATA_VERSION } from './schema';
import type { AppData, ApiSettings } from './schema';
import { BUILTIN_TEMPLATES } from '~/core/prompt/builtin';
import { createDefaultAppData } from './defaults';

const baseSettings = {
  targetLanguage: 'en',
  triggerMode: 'icon' as const,
  hotkey: 'Alt+T',
  cacheEnabled: true,
  cacheTTLDays: 30,
  historyEnabled: true,
  historyMaxEntries: 200,
  theme: 'auto' as const,
  uiLanguage: 'auto' as const,
};

describe('migrateAppData', () => {
  it('returns data unchanged when shape is valid', () => {
    const input: AppData = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'http://x', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
        providerType: 'cloud',
        cloudProvider: 'custom',
        savedConfigs: { custom: { baseUrl: 'http://x', apiKey: 'k', model: 'm' } },
      },
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    };
    expect(migrateAppData(input)).toEqual(input);
  });

  it('throws on unknown future version', () => {
    expect(() => migrateAppData({ version: 99 } as never)).toThrow();
  });

  it('repairs api.promptTemplateId when it references a deleted template', () => {
    const input: AppData = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'http://x', apiKey: 'k', model: 'm',
        promptTemplateId: 'deleted-template-id',
        providerType: 'cloud',
        cloudProvider: 'custom',
      },
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    };
    const out = migrateAppData(input);
    expect(out.api.promptTemplateId).toBe('builtin-general');
  });

  it('ensures all built-in templates exist after migration', () => {
    const input: AppData = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: '', apiKey: '', model: '',
        promptTemplateId: 'builtin-general',
        providerType: 'cloud',
        cloudProvider: 'custom',
      },
      settings: baseSettings,
      promptTemplates: [],
    };
    const out = migrateAppData(input);
    for (const builtin of BUILTIN_TEMPLATES) {
      expect(out.promptTemplates.some((t) => t.id === builtin.id)).toBe(true);
    }
  });

  it('fills providerType and cloudProvider defaults when missing', () => {
    const input = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'http://x', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
        // providerType and cloudProvider absent (v0.1.0 data shape)
      } as unknown as AppData['api'],
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    } as AppData;
    const out = migrateAppData(input);
    expect(out.api.providerType).toBe('cloud');
    expect(out.api.cloudProvider).toBe('custom');
  });

  it('infers cloudProvider from baseUrl on v0.1.0 upgrade', () => {
    const input = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'https://api.openai.com/v1', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
        // providerType + cloudProvider absent
      } as unknown as AppData['api'],
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    } as AppData;
    const out = migrateAppData(input);
    expect(out.api.providerType).toBe('cloud');
    expect(out.api.cloudProvider).toBe('openai');
  });

  it('preserves a new-provider cloudProvider value (e.g. moonshot)', () => {
    const input: AppData = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'https://api.moonshot.cn/v1', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
        providerType: 'cloud',
        cloudProvider: 'moonshot',
      },
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    };
    expect(migrateAppData(input).api.cloudProvider).toBe('moonshot');
  });

  it('keeps a new-provider value even when baseUrl would not infer it', () => {
    const input: AppData = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'https://my-proxy.example/v1', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
        providerType: 'cloud',
        cloudProvider: 'mistral',
      },
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    };
    expect(migrateAppData(input).api.cloudProvider).toBe('mistral');
  });
});

describe('savedConfigs seeding', () => {
  it('seeds the active slot from the active fields when missing', () => {
    const data = createDefaultAppData();
    data.api = { ...data.api, providerType: 'cloud', cloudProvider: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-x', model: 'gpt-4o' };
    delete data.api.savedConfigs;
    const out = migrateAppData(data);
    expect(out.api.savedConfigs).toEqual({ openai: { baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-x', model: 'gpt-4o' } });
  });

  it('leaves a valid savedConfigs untouched', () => {
    const data = createDefaultAppData();
    data.api = { ...data.api, providerType: 'cloud', cloudProvider: 'openai', baseUrl: 'b', apiKey: 'k', model: 'm', savedConfigs: { openai: { baseUrl: 'b', apiKey: 'k', model: 'm' } } };
    const out = migrateAppData(data);
    expect(out.api.savedConfigs).toEqual({ openai: { baseUrl: 'b', apiKey: 'k', model: 'm' } });
  });

  it('drops malformed entries and keeps the active slot', () => {
    const data = createDefaultAppData();
    data.api = {
      ...data.api,
      providerType: 'cloud', cloudProvider: 'openai', baseUrl: 'b', apiKey: 'k', model: 'm',
      savedConfigs: { openai: { baseUrl: 'b', apiKey: 'k', model: 'm' }, deepseek: { baseUrl: 123 } } as unknown as ApiSettings['savedConfigs'],
    };
    const out = migrateAppData(data);
    expect(out.api.savedConfigs).toEqual({ openai: { baseUrl: 'b', apiKey: 'k', model: 'm' } });
  });
});
