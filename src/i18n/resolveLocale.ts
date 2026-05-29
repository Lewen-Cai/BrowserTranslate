import { LOCALES, type Locale } from './strings';

/** Pure: resolve a uiLanguage setting + browser language into a concrete Locale. */
export function resolveLocale(setting: string, browserLang: string): Locale {
  if ((LOCALES as readonly string[]).includes(setting)) return setting as Locale;
  const b = (browserLang || '').toLowerCase();
  if (b.startsWith('zh')) {
    if (b.includes('tw') || b.includes('hk') || b.includes('hant')) return 'zh-TW';
    return 'zh-CN';
  }
  if (b.startsWith('ja')) return 'ja';
  if (b.startsWith('ko')) return 'ko';
  if (b.startsWith('es')) return 'es';
  if (b.startsWith('fr')) return 'fr';
  if (b.startsWith('de')) return 'de';
  return 'en';
}
