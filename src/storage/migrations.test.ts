import { describe, it, expect } from 'vitest';
import { migrateAppData } from './migrations';
import { APP_DATA_VERSION } from './schema';
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
    const input = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'http://x', apiKey: 'k', model: 'm',
        promptTemplateId: 'builtin-general',
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
    const input = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: 'http://x', apiKey: 'k', model: 'm',
        promptTemplateId: 'deleted-template-id',
      },
      settings: baseSettings,
      promptTemplates: BUILTIN_TEMPLATES.map((t) => ({ ...t })),
    };
    const out = migrateAppData(input);
    expect(out.api.promptTemplateId).toBe('builtin-general');
  });

  it('ensures all built-in templates exist after migration', () => {
    const input = {
      version: APP_DATA_VERSION,
      api: {
        baseUrl: '', apiKey: '', model: '',
        promptTemplateId: 'builtin-general',
      },
      settings: baseSettings,
      promptTemplates: [],
    };
    const out = migrateAppData(input);
    for (const builtin of BUILTIN_TEMPLATES) {
      expect(out.promptTemplates.some((t) => t.id === builtin.id)).toBe(true);
    }
  });
});
