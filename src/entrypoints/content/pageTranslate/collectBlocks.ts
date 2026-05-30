import { isSameLanguageAsTarget } from '~/core/language/sameLanguage';

const BLOCK_TAGS = new Set([
  'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'DD', 'DT', 'CAPTION', 'SUMMARY',
]);
const BLOCK_SELECTOR = Array.from(BLOCK_TAGS).join(',');

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'CANVAS',
  'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON',
]);

const MIN_TEXT_LEN = 3;

function isSkippable(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest('[contenteditable="true"]')) return true;
  if (el.closest('code, pre, script, style, textarea')) return true;
  if (el.closest('.bt-bilingual')) return true;
  return false;
}

/** True if the element holds its own non-whitespace text directly (not only via child blocks). */
function hasDirectText(el: Element): boolean {
  let len = 0;
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) len += (n.textContent ?? '').trim().length;
  });
  return len >= MIN_TEXT_LEN;
}

/**
 * Walk `root` and return block-level elements worth translating. Skips
 * code/editable/non-content nodes, already-injected bilingual nodes,
 * whitespace-only/too-short text, and blocks already in the target language.
 *
 * Nesting: a PURE container block (has a block-tag descendant but no meaningful
 * direct text of its own — e.g. a <blockquote> wrapping a <p>) is skipped so the
 * inner block is translated instead. But a block that has BOTH its own direct
 * text AND a nested block (e.g. an <li> with lead-in text before a nested list)
 * IS collected, and its nested block descendants are marked covered so they are
 * not translated twice. This prevents the ancestor's direct text from being
 * silently dropped.
 */
export function collectBlocks(root: ParentNode, targetLang: string): HTMLElement[] {
  const candidates: HTMLElement[] = [];
  const covered = new Set<Element>();
  const all = root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR);
  all.forEach((el) => {
    if (covered.has(el)) return;
    if (isSkippable(el)) return;
    const text = (el.textContent ?? '').trim();
    if (text.length < MIN_TEXT_LEN) return;
    if (isSameLanguageAsTarget(text, targetLang)) return;
    const hasBlockChild = el.querySelector(BLOCK_SELECTOR) !== null;
    if (hasBlockChild && !hasDirectText(el)) return; // pure container — inner block handles it
    candidates.push(el);
    if (hasBlockChild) {
      el.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach((d) => covered.add(d));
    }
  });
  return candidates;
}
