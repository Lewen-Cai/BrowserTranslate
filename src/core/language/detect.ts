export type DetectedLanguage = 'zh' | 'ja' | 'ko' | 'en' | 'unknown';

/**
 * Lightweight script-based language detection.
 * Counts characters in Unicode ranges; returns the dominant script.
 * For higher accuracy, the LLM itself will handle source detection.
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text) return 'unknown';

  const counts = { zh: 0, ja: 0, ko: 0, en: 0 };

  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    // Hiragana 0x3040–0x309F + Katakana 0x30A0–0x30FF → Japanese-specific
    if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      counts.ja++;
    }
    // Hangul Syllables 0xAC00–0xD7AF → Korean
    else if (code >= 0xac00 && code <= 0xd7af) {
      counts.ko++;
    }
    // CJK Unified Ideographs 0x4E00–0x9FFF → Chinese (also used in Japanese kanji, but no hiragana means likely Chinese)
    else if (code >= 0x4e00 && code <= 0x9fff) {
      counts.zh++;
    }
    // Basic Latin letters → English (rough proxy)
    else if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
      counts.en++;
    }
  }

  const total = counts.zh + counts.ja + counts.ko + counts.en;
  if (total === 0) return 'unknown';

  // Japanese wins if any hiragana/katakana present
  if (counts.ja > 0) return 'ja';
  // Pick the max of remaining
  const max = Math.max(counts.zh, counts.ko, counts.en);
  if (counts.zh === max) return 'zh';
  if (counts.ko === max) return 'ko';
  return 'en';
}
