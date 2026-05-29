import type { DictionaryEntry } from '~/core/dictionary/parse';

/**
 * Styled rendering of a structured dictionary entry inside the Shadow-DOM card.
 * Uses .bt-card-dict-* classes from theme.css (the card is inline-styled / class
 * based, not Tailwind). The card falls back to raw text when parsing fails.
 */
export function DictionaryView({ entry }: { entry: DictionaryEntry }) {
  return (
    <div class="bt-card-dict">
      <div class="bt-card-dict-head">
        <span class="bt-card-dict-word">{entry.headword}</span>
        {entry.phonetic && <span class="bt-card-dict-phon">{entry.phonetic}</span>}
      </div>
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
          <div class="bt-card-dict-example-label">EXAMPLE</div>
          {entry.example.source && <div class="bt-card-dict-example-src">{entry.example.source}</div>}
          {entry.example.target && <div class="bt-card-dict-example-tgt">{entry.example.target}</div>}
        </div>
      )}
    </div>
  );
}
