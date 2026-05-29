/** A structured dictionary entry rendered by the card's DictionaryView. */
export interface DictionaryEntry {
  headword: string;
  phonetic?: string;        // IPA, Latin-script words only (never pinyin/romanization)
  partOfSpeech?: string;
  senses: string[];
  example?: { source: string; target: string };
}

/**
 * Parse the dictionary model's JSON response into a DictionaryEntry.
 * Tolerates ```json code fences. Returns null when the text isn't valid JSON,
 * lacks a headword, or is too thin to render structurally — the card then falls
 * back to showing the raw text.
 */
export function parseDictionaryEntry(raw: string): DictionaryEntry | null {
  if (!raw) return null;
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence && fence[1]) text = fence[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const o = parsed as Record<string, unknown>;

  const headword = typeof o.headword === 'string' ? o.headword.trim() : '';
  if (!headword) return null;

  const senses = Array.isArray(o.senses)
    ? o.senses.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim())
    : [];

  const entry: DictionaryEntry = { headword, senses };

  if (typeof o.phonetic === 'string' && o.phonetic.trim()) entry.phonetic = o.phonetic.trim();
  if (typeof o.partOfSpeech === 'string' && o.partOfSpeech.trim()) entry.partOfSpeech = o.partOfSpeech.trim();

  if (o.example && typeof o.example === 'object' && !Array.isArray(o.example)) {
    const ex = o.example as Record<string, unknown>;
    const source = typeof ex.source === 'string' ? ex.source.trim() : '';
    const target = typeof ex.target === 'string' ? ex.target.trim() : '';
    if (source || target) entry.example = { source, target };
  }

  // Too thin to justify the structured layout — let the caller fall back to text.
  if (entry.senses.length === 0 && !entry.example) return null;

  return entry;
}
