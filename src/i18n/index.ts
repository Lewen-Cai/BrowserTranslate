import { useAppStore } from '~/storage/store';
import { MESSAGES, type Locale, type StringKey } from './strings';

const EXPLICIT: readonly Locale[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'fr', 'de'];

/** Pure: resolve a uiLanguage setting + browser language into a concrete Locale. */
export function resolveLocale(setting: string, browserLang: string): Locale {
  if ((EXPLICIT as readonly string[]).includes(setting)) return setting as Locale;
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

function currentBrowserLang(): string {
  return typeof navigator !== 'undefined' ? navigator.language : 'en';
}

export function useT(): (key: StringKey) => string {
  const uiLang = useAppStore((s) => s.data.settings.uiLanguage);
  const locale = resolveLocale(uiLang, currentBrowserLang());
  return (key: StringKey) => MESSAGES[locale][key];
}

// For non-React contexts (e.g. background script)
export function t(key: StringKey, locale: Locale = 'en'): string {
  return MESSAGES[locale][key];
}
