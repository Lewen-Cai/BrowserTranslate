const SENTENCE_PUNCT = /[.!?。！？…;；]/;

/**
 * Heuristic: is this selection a passage (sentence/clause/running prose) rather
 * than a word or short term? Used only to gate the same-language skip — short
 * selections return false so dictionary lookups are never skipped.
 *
 * A selection is a passage when ANY of:
 *  - it contains sentence-ending punctuation, OR
 *  - it has more than 3 whitespace-separated words, OR
 *  - it is a CJK run of more than 12 characters.
 */
export function isLikelyPassage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (SENTENCE_PUNCT.test(trimmed)) return true;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 3) return true;
  // CJK has no spaces; fall back to a character-count threshold.
  const cjk = trimmed.replace(/[^぀-ヿ一-鿿가-힯]/g, '');
  if (cjk.length > 12) return true;
  return false;
}
