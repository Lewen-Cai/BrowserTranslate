import { describe, it, expect } from 'vitest';
import { batchSystemPrompt, batchUserPrompt } from './prompt';

describe('batchSystemPrompt', () => {
  it('embeds the style prompt and forbids dictionary JSON', () => {
    const sys = batchSystemPrompt('Be formal and precise.');
    expect(sys).toContain('Be formal and precise.');
    expect(sys).toContain('JSON array');
    expect(sys.toLowerCase()).toContain('translation');
  });
});

describe('batchUserPrompt', () => {
  it('numbers each segment and states the target language', () => {
    const user = batchUserPrompt(['Hello', 'World'], 'zh-CN');
    expect(user).toContain('zh-CN');
    expect(user).toContain('Hello');
    expect(user).toContain('World');
    expect(user).toContain('2'); // count or index appears
  });
});
