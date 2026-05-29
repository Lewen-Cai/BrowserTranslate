import { en, type StringKey } from './locales/en';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de';
export type { StringKey };

export const LOCALES: readonly Locale[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'fr', 'de'];

export const MESSAGES: Record<Locale, Record<StringKey, string>> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
  es,
  fr,
  de,
};
