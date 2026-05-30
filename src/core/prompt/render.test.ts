import { describe, it, expect } from 'vitest';
import { renderPrompt } from './render';

describe('renderPrompt', () => {
  it('replaces single variable', () => {
    expect(renderPrompt('Hello {{name}}', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple variables', () => {
    expect(
      renderPrompt('{{a}} and {{b}}', { a: 'foo', b: 'bar' }),
    ).toBe('foo and bar');
  });

  it('replaces same variable multiple times', () => {
    expect(renderPrompt('{{x}}-{{x}}', { x: 'y' })).toBe('y-y');
  });

  it('leaves unknown variables as empty string', () => {
    expect(renderPrompt('Hello {{name}}', {})).toBe('Hello ');
  });

  it('does not interpret variables inside user-provided text', () => {
    // critical: user text may contain {{ — must not be re-rendered
    const result = renderPrompt('Translate: {{text}}', { text: 'foo {{bar}}' });
    expect(result).toBe('Translate: foo {{bar}}');
  });

  it('does not re-substitute mustache syntax that appears inside a value (single-pass)', () => {
    const out = renderPrompt('{{text}}', { text: 'page with {{foo}} and {{targetLang}} literals' });
    expect(out).toBe('page with {{foo}} and {{targetLang}} literals');
  });

  it('handles empty template', () => {
    expect(renderPrompt('', { x: 'y' })).toBe('');
  });

  it('handles variable with underscores and digits', () => {
    expect(renderPrompt('{{var_1}}', { var_1: 'ok' })).toBe('ok');
  });
});
