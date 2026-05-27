import { describe, it, expect } from 'vitest';
import { detectLanguage } from './detect';

describe('detectLanguage', () => {
  it('detects English', () => {
    expect(detectLanguage('Hello world, this is plain English text.')).toBe('en');
  });

  it('detects Simplified Chinese', () => {
    expect(detectLanguage('你好世界，这是中文文本')).toBe('zh');
  });

  it('detects Japanese (hiragana/katakana)', () => {
    expect(detectLanguage('こんにちは、これは日本語のテキストです')).toBe('ja');
  });

  it('detects Korean', () => {
    expect(detectLanguage('안녕하세요, 이것은 한국어 텍스트입니다')).toBe('ko');
  });

  it('returns unknown for empty string', () => {
    expect(detectLanguage('')).toBe('unknown');
  });

  it('returns unknown for symbols only', () => {
    expect(detectLanguage('!!! ??? ...')).toBe('unknown');
  });

  it('handles mixed text by dominant script', () => {
    // Mostly Chinese with some English
    expect(detectLanguage('这是一个 hello world 例子，主要是中文')).toBe('zh');
  });
});
