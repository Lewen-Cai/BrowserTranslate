import { describe, it, expect } from 'vitest';
import { computeCacheKey } from './key';

describe('computeCacheKey', () => {
  it('produces stable key for identical inputs', async () => {
    const a = await computeCacheKey({ text: 'hello', model: 'gpt-4o', promptTemplateId: 'p', targetLang: 'zh-CN' });
    const b = await computeCacheKey({ text: 'hello', model: 'gpt-4o', promptTemplateId: 'p', targetLang: 'zh-CN' });
    expect(a).toBe(b);
  });

  it('differs when text changes', async () => {
    const a = await computeCacheKey({ text: 'a', model: 'm', promptTemplateId: 'p', targetLang: 'zh-CN' });
    const b = await computeCacheKey({ text: 'b', model: 'm', promptTemplateId: 'p', targetLang: 'zh-CN' });
    expect(a).not.toBe(b);
  });

  it('differs when model changes', async () => {
    const a = await computeCacheKey({ text: 't', model: 'm1', promptTemplateId: 'p', targetLang: 'zh-CN' });
    const b = await computeCacheKey({ text: 't', model: 'm2', promptTemplateId: 'p', targetLang: 'zh-CN' });
    expect(a).not.toBe(b);
  });

  it('differs when prompt template changes', async () => {
    const a = await computeCacheKey({ text: 't', model: 'm', promptTemplateId: 'p1', targetLang: 'zh-CN' });
    const b = await computeCacheKey({ text: 't', model: 'm', promptTemplateId: 'p2', targetLang: 'zh-CN' });
    expect(a).not.toBe(b);
  });

  it('differs when target language changes', async () => {
    const a = await computeCacheKey({ text: 't', model: 'm', promptTemplateId: 'p', targetLang: 'zh-CN' });
    const b = await computeCacheKey({ text: 't', model: 'm', promptTemplateId: 'p', targetLang: 'en' });
    expect(a).not.toBe(b);
  });

  it('separates dictionary from translation via the builtin-dictionary id', async () => {
    const translation = await computeCacheKey({ text: 'cat', model: 'm', promptTemplateId: 'builtin-general', targetLang: 'zh-CN' });
    const dictionary = await computeCacheKey({ text: 'cat', model: 'm', promptTemplateId: 'builtin-dictionary', targetLang: 'zh-CN' });
    expect(translation).not.toBe(dictionary);
  });

  it('produces hex-only output', async () => {
    const k = await computeCacheKey({ text: 't', model: 'm', promptTemplateId: 'p', targetLang: 'en' });
    expect(k).toMatch(/^[0-9a-f]+$/);
  });
});
