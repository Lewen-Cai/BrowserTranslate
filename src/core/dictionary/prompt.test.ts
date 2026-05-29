import { describe, it, expect } from 'vitest';
import { autoSystemPrompt, DICTIONARY_SPEC } from './prompt';

describe('DICTIONARY_SPEC', () => {
  it('carries the JSON contract parseDictionaryEntry expects', () => {
    expect(DICTIONARY_SPEC).toContain('"headword"');
    expect(DICTIONARY_SPEC).toContain('senses');
    expect(DICTIONARY_SPEC).toContain('phonetic');
  });
});

describe('autoSystemPrompt', () => {
  it('embeds the dictionary spec and preserves the translation style', () => {
    const sys = autoSystemPrompt('Be very formal and academic.');
    expect(sys).toContain('headword');
    expect(sys).toContain('Be very formal and academic.');
    expect(sys).toContain('TRANSLATION MODE');
    expect(sys).toContain('DICTIONARY MODE');
  });
});
