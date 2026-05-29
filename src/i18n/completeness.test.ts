import { describe, it, expect } from 'vitest';
import { MESSAGES, LOCALES } from './strings';
import { en } from './locales/en';

describe('i18n completeness', () => {
  const enKeys = Object.keys(en).sort();
  for (const locale of LOCALES) {
    it(`${locale} has exactly the en key set`, () => {
      expect(Object.keys(MESSAGES[locale]).sort()).toEqual(enKeys);
    });
  }
});
