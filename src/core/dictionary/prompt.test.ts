import { describe, it, expect } from 'vitest';
import { DICTIONARY_TEMPLATE } from './prompt';
import { renderPrompt } from '~/core/prompt/render';

describe('DICTIONARY_TEMPLATE', () => {
  it('has the synthetic builtin id used for cache separation', () => {
    expect(DICTIONARY_TEMPLATE.id).toBe('builtin-dictionary');
    expect(DICTIONARY_TEMPLATE.isBuiltin).toBe(true);
  });

  it('keeps targetLang substitution in the user prompt (system is sent verbatim)', () => {
    expect(DICTIONARY_TEMPLATE.systemPrompt).not.toContain('{{');
    const rendered = renderPrompt(DICTIONARY_TEMPLATE.userPromptTemplate, {
      text: 'serendipity',
      targetLang: 'zh-CN',
    });
    expect(rendered).toContain('serendipity');
    expect(rendered).toContain('zh-CN');
  });
});
