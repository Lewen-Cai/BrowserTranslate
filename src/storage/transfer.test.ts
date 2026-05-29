import { describe, it, expect } from 'vitest';
import { exportAppData, importAppData, EXPORT_FORMAT, ImportError } from './transfer';
import { createDefaultAppData } from './defaults';
import type { AppData } from './schema';

function sample(): AppData {
  const d = createDefaultAppData();
  d.api.baseUrl = 'https://api.example.com/v1';
  d.api.apiKey = 'sk-secret';
  d.api.model = 'gpt-4o';
  d.api.customHeaders = { Authorization: 'Bearer sk-header-secret' };
  d.api.savedConfigs = { openai: { baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-openai', model: 'gpt-4o' } };
  d.settings.targetLanguage = 'en';
  d.promptTemplates.push({
    id: 'user-1', name: 'Mine', isBuiltin: false,
    systemPrompt: 's', userPromptTemplate: 'u', createdAt: 1, updatedAt: 1,
  });
  return d;
}

describe('exportAppData', () => {
  it('strips all api keys by default', () => {
    const file = exportAppData(sample(), { includeKeys: false }, 123);
    expect(file.format).toBe(EXPORT_FORMAT);
    expect(file.exportedAt).toBe(123);
    expect(file.data.api.apiKey).toBe('');
    expect(file.data.api.savedConfigs?.openai?.apiKey).toBe('');
  });

  it('keeps keys when includeKeys is true', () => {
    const file = exportAppData(sample(), { includeKeys: true }, 123);
    expect(file.data.api.apiKey).toBe('sk-secret');
    expect(file.data.api.savedConfigs?.openai?.apiKey).toBe('sk-openai');
  });

  it('excludes builtin templates, keeps user templates', () => {
    const file = exportAppData(sample(), { includeKeys: false }, 123);
    expect(file.data.promptTemplates.every((t) => !t.isBuiltin)).toBe(true);
    expect(file.data.promptTemplates.map((t) => t.id)).toContain('user-1');
  });

  it('strips customHeaders by default (they can carry secrets)', () => {
    const file = exportAppData(sample(), { includeKeys: false }, 123);
    expect(file.data.api.customHeaders).toBeUndefined();
  });

  it('keeps customHeaders when includeKeys is true', () => {
    const file = exportAppData(sample(), { includeKeys: true }, 123);
    expect(file.data.api.customHeaders).toEqual({ Authorization: 'Bearer sk-header-secret' });
  });
});

describe('importAppData', () => {
  it('rejects a non-object', () => {
    expect(() => importAppData(null)).toThrow(ImportError);
    expect(() => importAppData(42)).toThrow(ImportError);
  });

  it('rejects an unrecognized format', () => {
    expect(() => importAppData({ format: 'something-else', version: 1, data: {} })).toThrow(ImportError);
  });

  it('rejects a file with an unsupported version', () => {
    expect(() => importAppData({ format: EXPORT_FORMAT, version: 99, data: {} })).toThrow(ImportError);
  });

  it('rejects a file missing the data object', () => {
    expect(() => importAppData({ format: EXPORT_FORMAT, version: 1 })).toThrow(ImportError);
  });

  it('round-trips settings, api, and user templates; builtins re-seeded', () => {
    const exported = exportAppData(sample(), { includeKeys: true }, 123);
    const imported = importAppData(JSON.parse(JSON.stringify(exported)));
    expect(imported.settings.targetLanguage).toBe('en');
    expect(imported.api.model).toBe('gpt-4o');
    expect(imported.api.apiKey).toBe('sk-secret');
    expect(imported.promptTemplates.some((t) => t.id === 'user-1')).toBe(true);
    expect(imported.promptTemplates.some((t) => t.id === 'builtin-general')).toBe(true);
  });

  it('fills defaults for fields missing from the file', () => {
    const imported = importAppData({ format: EXPORT_FORMAT, version: 1, exportedAt: 0, data: { settings: { targetLanguage: 'fr' } } });
    expect(imported.settings.targetLanguage).toBe('fr');
    expect(imported.settings.theme).toBe('auto'); // default filled
    expect(imported.api.promptTemplateId).toBe('builtin-general'); // default filled
  });
});
