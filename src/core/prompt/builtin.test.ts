import { describe, it, expect } from 'vitest';
import { BUILTIN_TEMPLATES, getBuiltinTemplate } from './builtin';

describe('BUILTIN_TEMPLATES', () => {
  it('has exactly 4 built-in templates', () => {
    expect(BUILTIN_TEMPLATES).toHaveLength(4);
  });

  it('all templates have isBuiltin=true', () => {
    for (const t of BUILTIN_TEMPLATES) {
      expect(t.isBuiltin).toBe(true);
    }
  });

  it('all templates have stable IDs', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(['builtin-general', 'builtin-academic', 'builtin-casual', 'builtin-technical']);
  });

  it('all user prompt templates contain {{text}}', () => {
    for (const t of BUILTIN_TEMPLATES) {
      expect(t.userPromptTemplate).toContain('{{text}}');
    }
  });

  it('all user prompt templates contain {{targetLang}}', () => {
    for (const t of BUILTIN_TEMPLATES) {
      expect(t.userPromptTemplate).toContain('{{targetLang}}');
    }
  });

  it('getBuiltinTemplate returns by id', () => {
    expect(getBuiltinTemplate('builtin-general')?.name).toBe('General');
  });

  it('getBuiltinTemplate returns undefined for unknown id', () => {
    expect(getBuiltinTemplate('nope')).toBeUndefined();
  });
});
