import { describe, it, expect } from 'vitest';
import { migrateAppData } from './migrations';
import { APP_DATA_VERSION } from './schema';
import type { AppData } from './schema';
import { BUILTIN_TEMPLATES } from '~/core/prompt/builtin';

const baseSettings = {
  targetLanguage: 'en',
  triggerMode: 'icon' as const,
  hotkey: 'Alt+T',
  streamingEnabled: true,
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
});
