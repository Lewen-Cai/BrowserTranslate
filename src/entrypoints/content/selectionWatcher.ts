export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export interface SelectionWatcher {
  start: () => void;
  stop: () => void;
}

const MAX_LEN = 5000;
const DEBOUNCE_MS = 100;

export function createSelectionWatcher(
  onSelect: (info: SelectionInfo | null) => void,
): SelectionWatcher {
  let timer: number | undefined;

  const handler = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        onSelect(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text || text.length > MAX_LEN) {
        onSelect(null);
        return;
      }
      onSelect({ text, rect: sel.getRangeAt(0).getBoundingClientRect() });
    }, DEBOUNCE_MS);
  };

  return {
    start() {
      document.addEventListener('selectionchange', handler);
      document.addEventListener('mouseup', handler);
    },
    stop() {
      document.removeEventListener('selectionchange', handler);
      document.removeEventListener('mouseup', handler);
      window.clearTimeout(timer);
    },
  };
}

/**
 * Used in hotkey mode when selection is empty — returns the text of
 * the block element containing the caret.
 */
export function getCurrentParagraphText(): { text: string; rect: DOMRect } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.focusNode;
  while (node && !(node instanceof HTMLElement)) node = node.parentNode;
  while (node && node instanceof HTMLElement && !isBlock(node)) node = node.parentElement;
  if (!node || !(node instanceof HTMLElement)) return null;
  const text = node.innerText.trim();
  if (!text) return null;
  return { text, rect: node.getBoundingClientRect() };
}

function isBlock(el: HTMLElement): boolean {
  const display = window.getComputedStyle(el).display;
  return ['block', 'flex', 'grid', 'list-item'].includes(display);
}
