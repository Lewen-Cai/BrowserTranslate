const MODIFIER_KEYS = new Set(['Alt', 'Control', 'Shift', 'Meta']);
// Keys that survive formatting but break the '+'-delimited round-trip (the
// parser splits on '+' and trims, leaving an empty key that never matches).
const UNSUPPORTED_KEYS = new Set([' ', '+']);

export interface HotkeyEventLike {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  key: string;
}

/**
 * Build a canonical hotkey combo (e.g. "Ctrl+Shift+Y") from a keyboard event.
 * Returns null when the pressed key is itself a modifier, or when no modifier is
 * held (single-key shortcuts are rejected so they can't hijack typing). The
 * output format matches the hotkeyWatcher parser: modifiers in a fixed order
 * (Ctrl, Alt, Shift, Meta) + the main key, single chars uppercased, joined by '+'.
 */
export function formatHotkey(e: HotkeyEventLike): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;
  if (UNSUPPORTED_KEYS.has(e.key)) return null;
  if (!(e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) return null;
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Meta');
  parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return parts.join('+');
}
