export interface HotkeyWatcher {
  start: () => void;
  stop: () => void;
  setHotkey: (combo: string) => void;
}

interface ParsedHotkey {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  key: string; // uppercase
}

function parse(combo: string): ParsedHotkey {
  const parts = combo.split('+').map((p) => p.trim());
  return {
    alt: parts.includes('Alt'),
    ctrl: parts.includes('Ctrl') || parts.includes('Control'),
    shift: parts.includes('Shift'),
    meta: parts.includes('Meta') || parts.includes('Cmd'),
    key: (parts[parts.length - 1] ?? '').toUpperCase(),
  };
}

export function createHotkeyWatcher(
  initialCombo: string,
  onTrigger: () => void,
): HotkeyWatcher {
  let parsed = parse(initialCombo);

  const handler = (e: KeyboardEvent) => {
    if (
      e.altKey === parsed.alt &&
      e.ctrlKey === parsed.ctrl &&
      e.shiftKey === parsed.shift &&
      e.metaKey === parsed.meta &&
      e.key.toUpperCase() === parsed.key
    ) {
      e.preventDefault();
      e.stopPropagation();
      onTrigger();
    }
  };

  return {
    start() {
      window.addEventListener('keydown', handler, true);
    },
    stop() {
      window.removeEventListener('keydown', handler, true);
    },
    setHotkey(combo) {
      parsed = parse(combo);
    },
  };
}
