import { describe, it, expect } from 'vitest';
import { advanceReveal } from './reveal';

describe('advanceReveal', () => {
  it('returns the target when already caught up or past it', () => {
    expect(advanceReveal(5, 5)).toBe(5);
    expect(advanceReveal(7, 5)).toBe(5);
  });
  it('advances a fraction of the remaining gap (eased)', () => {
    expect(advanceReveal(0, 60)).toBe(10); // ceil(60/6)
    expect(advanceReveal(50, 60)).toBe(52); // ceil(10/6) = 2
  });
  it('advances at least 2 chars, clamped to the target', () => {
    expect(advanceReveal(59, 60)).toBe(60);
  });
  it('never overshoots and always reaches the target', () => {
    let cur = 0;
    for (let i = 0; i < 200 && cur < 200; i++) cur = advanceReveal(cur, 200);
    expect(cur).toBe(200);
  });
});
