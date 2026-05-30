import { describe, it, expect } from 'vitest';
import { isLikelyPassage } from './isLikelyPassage';

describe('isLikelyPassage', () => {
  it('is false for a single English word', () => {
    expect(isLikelyPassage('serendipity')).toBe(false);
  });
  it('is false for a short two-word term', () => {
    expect(isLikelyPassage('machine learning')).toBe(false);
  });
  it('is true for a full sentence', () => {
    expect(isLikelyPassage('The quick brown fox jumps over the lazy dog.')).toBe(true);
  });
  it('is true when sentence-ending punctuation is present', () => {
    expect(isLikelyPassage('Hello there!')).toBe(true);
  });
  it('is true for a CJK sentence with a full stop', () => {
    expect(isLikelyPassage('这是一个完整的句子。')).toBe(true);
  });
  it('is false for a single CJK word', () => {
    expect(isLikelyPassage('翻译')).toBe(false);
  });
  it('is true for a long CJK run without punctuation', () => {
    expect(isLikelyPassage('这是一段没有标点但是足够长的中文文本内容用于测试')).toBe(true);
  });
  it('is false for empty / whitespace', () => {
    expect(isLikelyPassage('   ')).toBe(false);
  });
});
