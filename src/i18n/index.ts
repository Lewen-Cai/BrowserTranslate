import { useAppStore } from '~/storage/store';
import { STRINGS, type Locale, type StringKey } from './strings';

export function resolveLocale(setting: string): Locale {
  if (setting === 'zh-CN' || setting === 'en') return setting;
  // 'auto' — derive from browser
  const browser = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (browser.startsWith('zh')) return 'zh-CN';
  return 'en';
}

export function useT(): (key: StringKey) => string {
  const uiLang = useAppStore((s) => s.data.settings.uiLanguage);
  const locale = resolveLocale(uiLang);
  return (key: StringKey) => STRINGS[key][locale];
}

// For non-React contexts (e.g. background script)
export function t(key: StringKey, locale: Locale = 'en'): string {
  return STRINGS[key][locale];
}
