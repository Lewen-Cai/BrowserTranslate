import type { PromptTemplate } from '~/storage/schema';

/**
 * Internal, fixed dictionary prompt. NOT stored in AppData and NOT user-editable
 * (those PromptTemplates are translation styles). Shaped as a PromptTemplate so
 * it drops straight into the existing provider call. Its `id` doubles as the
 * cache-key discriminator that keeps dictionary results from colliding with
 * translations (computeCacheKey already hashes promptTemplateId).
 *
 * Returns a JSON object parsed by `parseDictionaryEntry` and rendered by the
 * card's DictionaryView. Dictionary mode runs non-streaming (background sets
 * stream:false) because partial JSON can't be rendered.
 *
 * NOTE: systemPrompt is sent verbatim by the provider — keep all {{vars}} in
 * userPromptTemplate, which is the only field run through renderPrompt.
 */
export const DICTIONARY_TEMPLATE: PromptTemplate = {
  id: 'builtin-dictionary',
  name: 'Dictionary',
  isBuiltin: true,
  systemPrompt:
    'You are a concise bilingual dictionary. The user gives a word, phrase, idiom, or proper noun, ' +
    'plus a target language. Respond with ONLY a single JSON object — no markdown, no code fences, ' +
    'no prose before or after — with this exact shape:\n' +
    '{"headword": string, "phonetic": string, "partOfSpeech": string, "senses": string[], "example": {"source": string, "target": string} | null}\n' +
    'Field rules:\n' +
    '- headword: the term itself, in its original language.\n' +
    '- phonetic: IPA in slashes, ONLY for English / Latin-script words (e.g. "/ˌsɛrənˈdɪpɪti/"). ' +
    'For Chinese, Japanese, Korean, or any non-Latin script, use an EMPTY STRING — do NOT add pinyin or any romanization.\n' +
    '- partOfSpeech: written in the target language; empty string when not applicable (e.g. proper nouns).\n' +
    '- senses: 1 to 3 short definitions written in the target language. For a proper noun, use a single sense that glosses what it refers to.\n' +
    '- example: one natural example sentence (source = in the term\'s own language, target = translated into the target language), or null if none fits.\n' +
    'Output ONLY the JSON object.',
  userPromptTemplate: 'Target language: {{targetLang}}\n\nDefine:\n\n{{text}}',
  createdAt: 0,
  updatedAt: 0,
};
