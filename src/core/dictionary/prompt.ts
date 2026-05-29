import type { PromptTemplate } from '~/storage/schema';

/**
 * Internal, fixed dictionary prompt. NOT stored in AppData and NOT user-editable
 * (those PromptTemplates are translation styles). Shaped as a PromptTemplate so
 * it drops straight into the existing provider call. Its `id` doubles as the
 * cache-key discriminator that keeps dictionary results from colliding with
 * translations (computeCacheKey already hashes promptTemplateId).
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
    'plus a target language. Produce a compact dictionary entry written IN THE TARGET LANGUAGE. ' +
    'Use EXACTLY this plain-text layout — no markdown, no asterisks, no preamble:\n' +
    'HEADWORD  /pronunciation/\n' +
    '(part of speech)\n' +
    '• short definition in the target language\n' +
    '• short definition in the target language\n' +
    'Example: <a sentence using the term>\n' +
    '         <its translation in the target language>\n' +
    'Rules: include IPA pronunciation only when applicable; at most 3 senses; ' +
    'for a proper noun, give a single line glossing what it refers to instead of senses; ' +
    'keep it tight. Output ONLY the entry.',
  userPromptTemplate: 'Target language: {{targetLang}}\n\nEntry for:\n\n{{text}}',
  createdAt: 0,
  updatedAt: 0,
};
