import type { DictionaryEntry } from '~/core/dictionary/parse';
import { t } from '~/i18n';
import type { Locale } from '~/i18n/strings';

/**
 * Styled rendering of a structured dictionary entry inside the Shadow-DOM card.
 * Uses .bt-card-dict-* classes from theme.css (the card is inline-styled / class
 * based, not Tailwind). The card falls back to raw text when parsing fails.
 */
export function DictionaryView({ entry, locale }: { entry: DictionaryEntry; locale: Locale }) {
  const phonetic = entry.phonetic;
  return (
    <div class="bt-card-dict">
      <div class="bt-card-dict-head">
        <span class="bt-card-dict-word">{entry.headword}</span>
      </div>
      {phonetic && (phonetic.us || phonetic.uk) && (
        <div class="bt-card-dict-phon-row">
          {phonetic.us && (
            <span class="bt-card-dict-phon">
              <span class="bt-card-dict-phon-label">US</span> {phonetic.us}
            </span>
          )}
          {phonetic.uk && (
            <span class="bt-card-dict-phon">
              <span class="bt-card-dict-phon-label">UK</span> {phonetic.uk}
            </span>
          )}
        </div>
      )}
      {entry.partOfSpeech && <span class="bt-card-dict-pos">{entry.partOfSpeech}</span>}
      {entry.senses.length > 0 && (
        <ol class="bt-card-dict-senses">
          {entry.senses.map((sense, i) => (
            <li key={i} class="bt-card-dict-sense">
              <span class="bt-card-dict-num">{i + 1}</span>
              <span>{sense}</span>
            </li>
          ))}
        </ol>
      )}
      {entry.example && (
        <div class="bt-card-dict-example">
          <div class="bt-card-dict-example-label">{t('cardExample', locale)}</div>
          {entry.example.source && <div class="bt-card-dict-example-src">{entry.example.source}</div>}
          {entry.example.target && <div class="bt-card-dict-example-tgt">{entry.example.target}</div>}
        </div>
      )}
    </div>
  );
}
