/**
 * True when a model response looks like a dictionary JSON object rather than a
 * plain-text translation. Decided by the first non-whitespace character being
 * '{'. Used by the card (which renderer) and the background (history gating).
 */
export function looksLikeDictionary(text: string): boolean {
  return text.trimStart().startsWith('{');
}
