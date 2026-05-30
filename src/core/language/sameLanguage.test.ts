import { describe, it, expect } from 'vitest';
import { isSameLanguageAsTarget } from './sameLanguage';

describe('isSameLanguageAsTarget', () => {
  it('skips Chinese text when target is zh-CN', () => {
    expect(isSameLanguageAsTarget('这是一段中文文字内容', 'zh-CN')).toBe(true);
  });
  it('skips Chinese text when target is zh-TW', () => {
    expect(isSameLanguageAsTarget('這是一段中文文字內容', 'zh-TW')).toBe(true);
  });
  it('does NOT skip English text when target is zh-CN', () => {
    expect(isSameLanguageAsTarget('This is English running text', 'zh-CN')).toBe(false);
  });
  it('skips English text when target is en', () => {
    expect(isSameLanguageAsTarget('This is English running text', 'en')).toBe(true);
  });
  it('skips Japanese when target is ja', () => {
    expect(isSameLanguageAsTarget('これは日本語の文章です', 'ja')).toBe(true);
  });
  it('does not skip when detection is unknown', () => {
    expect(isSameLanguageAsTarget('12345 !!!', 'en')).toBe(false);
  });
  it('does not skip for a target the heuristic cannot represent (de)', () => {
    expect(isSameLanguageAsTarget('Dies ist ein deutscher Satz', 'de')).toBe(false);
  });
});
