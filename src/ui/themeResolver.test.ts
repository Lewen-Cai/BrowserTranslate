import { describe, it, expect } from 'vitest';
import { resolveEffectiveTheme } from './themeResolver';

describe('resolveEffectiveTheme', () => {
  it("returns false for 'light' regardless of system preference", () => {
    expect(resolveEffectiveTheme('light', true)).toBe(false);
    expect(resolveEffectiveTheme('light', false)).toBe(false);
  });

  it("returns true for 'dark' regardless of system preference", () => {
    expect(resolveEffectiveTheme('dark', true)).toBe(true);
    expect(resolveEffectiveTheme('dark', false)).toBe(true);
  });

  it("follows system preference for 'auto'", () => {
    expect(resolveEffectiveTheme('auto', true)).toBe(true);
    expect(resolveEffectiveTheme('auto', false)).toBe(false);
  });
});
