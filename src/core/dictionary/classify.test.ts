import { describe, it, expect } from 'vitest';
import { classifySelection } from './classify';

describe('classifySelection', () => {
  it('treats a single word as dictionary', () => {
    expect(classifySelection('serendipity')).toBe('dictionary');
  });

  it('treats a short multi-word proper noun as dictionary', () => {
    expect(classifySelection('machine learning')).toBe('dictionary');
    expect(classifySelection('New York Times')).toBe('dictionary');
  });

  it('treats a sentence (ending punctuation) as translate', () => {
    expect(classifySelection('This is a full sentence.')).toBe('translate');
    expect(classifySelection('这是一句话。')).toBe('translate');
  });

  it('treats >4 words as translate', () => {
    expect(classifySelection('one two three four five')).toBe('translate');
  });

  it('treats exactly 4 words as dictionary (boundary)', () => {
    expect(classifySelection('one two three four')).toBe('dictionary');
  });

  it('treats a short CJK term as dictionary', () => {
    expect(classifySelection('翻译')).toBe('dictionary');
  });

  it('treats a long CJK run as translate', () => {
    expect(classifySelection('这是一个没有标点但是很长的中文句子用来测试边界情况')).toBe('translate');
  });

  it('defaults empty / whitespace to translate', () => {
    expect(classifySelection('')).toBe('translate');
    expect(classifySelection('   ')).toBe('translate');
  });
});
