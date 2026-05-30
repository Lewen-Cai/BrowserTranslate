import { detectLanguage, type DetectedLanguage } from './detect';

/**
 * Map a target-language setting value (e.g. 'zh-CN', 'en', 'ja') to the coarse
 * script bucket the detector produces. Returns null for targets the script-based
 * detector cannot represent (es/fr/de — all Latin, indistinguishable from en).
 */
export function targetToScript(target: string): DetectedLanguage | null {
  const t = target.toLowerCase();
  if (t.startsWith('zh')) return 'zh';
  if (t === 'en') return 'en';
  if (t === 'ja') return 'ja';
  if (t === 'ko') return 'ko';
  return null;
}

/**
 * True when `text` is already in the target language per the script heuristic,
 * so it should be skipped. Conservative: unknown / unrepresentable → false.
 */
export function isSameLanguageAsTarget(text: string, target: string): boolean {
  const script = targetToScript(target);
  if (script === null) return false;
  const detected = detectLanguage(text);
  if (detected === 'unknown') return false;
  return detected === script;
}
