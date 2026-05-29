import { describe, it, expect } from 'vitest';
import { looksLikeDictionary } from './discriminate';

describe('looksLikeDictionary', () => {
  it('is true when the first non-whitespace char is {', () => {
    expect(looksLikeDictionary('{"headword":"x"}')).toBe(true);
    expect(looksLikeDictionary('   \n  {"a":1}')).toBe(true);
  });
  it('is false for plain translation text', () => {
    expect(looksLikeDictionary('Hello world')).toBe(false);
    expect(looksLikeDictionary('你好')).toBe(false);
  });
  it('is false for empty / whitespace', () => {
    expect(looksLikeDictionary('')).toBe(false);
    expect(looksLikeDictionary('   ')).toBe(false);
  });
});
