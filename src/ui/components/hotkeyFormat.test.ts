import { describe, it, expect } from 'vitest';
import { formatHotkey } from './hotkeyFormat';

const base = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false };

describe('formatHotkey', () => {
  it('formats Alt + letter', () => {
    expect(formatHotkey({ ...base, altKey: true, key: 't' })).toBe('Alt+T');
  });
  it('formats Ctrl+Shift + letter in fixed order', () => {
    expect(formatHotkey({ ...base, ctrlKey: true, shiftKey: true, key: 'y' })).toBe('Ctrl+Shift+Y');
  });
  it('formats a digit', () => {
    expect(formatHotkey({ ...base, altKey: true, key: '1' })).toBe('Alt+1');
  });
  it('formats Meta', () => {
    expect(formatHotkey({ ...base, metaKey: true, key: 'k' })).toBe('Meta+K');
  });
  it('returns null when the pressed key is itself a modifier', () => {
    expect(formatHotkey({ ...base, altKey: true, key: 'Alt' })).toBeNull();
    expect(formatHotkey({ ...base, ctrlKey: true, key: 'Control' })).toBeNull();
    expect(formatHotkey({ ...base, shiftKey: true, key: 'Shift' })).toBeNull();
    expect(formatHotkey({ ...base, metaKey: true, key: 'Meta' })).toBeNull();
  });
  it('returns null when no modifier is held', () => {
    expect(formatHotkey({ ...base, key: 'a' })).toBeNull();
  });
  it('keeps named keys as-is', () => {
    expect(formatHotkey({ ...base, ctrlKey: true, key: 'ArrowUp' })).toBe('Ctrl+ArrowUp');
  });
  it('rejects keys that break the +-delimited round-trip (space, plus)', () => {
    expect(formatHotkey({ ...base, altKey: true, key: ' ' })).toBeNull();
    expect(formatHotkey({ ...base, ctrlKey: true, key: '+' })).toBeNull();
  });
});
