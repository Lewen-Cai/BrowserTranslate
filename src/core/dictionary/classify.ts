/** Default mode for a selection. The card lets the user override it. */
export type LookupMode = 'translate' | 'dictionary';

// Sentence-ending punctuation (Latin + CJK). Presence ⇒ it's prose, not a term.
const SENTENCE_PUNCT = /[.!?。！？…;；]/;
// A term is at most a few words…
const MAX_WORDS = 4;
// …and short overall (guards CJK, where whitespace word-counting under-counts).
const MAX_CHARS = 24;

/**
 * Heuristic default: is this selection a *term* to define, or a *passage* to
 * translate? Single words and short multi-word proper nouns → dictionary;
 * sentences / long or many-word selections → translate. This is only the
 * default — the card exposes a manual toggle to correct mis-classification.
 */
export function classifySelection(text: string): LookupMode {
  const trimmed = text.trim();
  if (!trimmed) return 'translate';
  if (SENTENCE_PUNCT.test(trimmed)) return 'translate';
  if (trimmed.length > MAX_CHARS) return 'translate';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return 'translate';
  return 'dictionary';
}
