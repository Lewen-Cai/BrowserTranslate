import type { PromptTemplate } from '~/storage/schema';

const now = 0; // built-ins use 0 so they sort before any user-created template

export const BUILTIN_TEMPLATES: readonly PromptTemplate[] = [
  {
    id: 'builtin-general',
    name: 'General',
    isBuiltin: true,
    systemPrompt:
      'You are a professional translator. Translate the given text accurately and naturally. ' +
      'Preserve the original meaning, tone, and formatting. ' +
      'Output ONLY the translation — no explanations, no quotes, no labels.',
    userPromptTemplate: 'Translate the following text to {{targetLang}}:\n\n{{text}}',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builtin-academic',
    name: 'Academic',
    isBuiltin: true,
    systemPrompt:
      'You are a translator specializing in academic and scientific writing. ' +
      'Translate with rigorous accuracy. Preserve domain-specific terminology ' +
      '(use the canonical translated term where one exists; otherwise keep the original term in parentheses after a translated approximation). ' +
      'Maintain formal register. Output ONLY the translation.',
    userPromptTemplate: 'Translate to {{targetLang}} (academic register):\n\n{{text}}',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builtin-casual',
    name: 'Casual / Natural',
    isBuiltin: true,
    systemPrompt:
      'You are a translator who produces natural, conversational output as a native speaker would write it. ' +
      'Do not translate word-for-word. Render idioms, jokes, and cultural references appropriately for the target language. ' +
      'Output ONLY the translation.',
    userPromptTemplate: 'Translate to {{targetLang}} as natural casual speech:\n\n{{text}}',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builtin-technical',
    name: 'Technical Documentation',
    isBuiltin: true,
    systemPrompt:
      'You are a translator for technical documentation. ' +
      'DO NOT translate: code identifiers, command names, file paths, URLs, English technical acronyms (e.g. API, HTTP, JSON), or text inside backticks. ' +
      'Translate explanatory prose around them. Preserve markdown/code structure exactly. Output ONLY the translation.',
    userPromptTemplate: 'Translate to {{targetLang}} (technical documentation):\n\n{{text}}',
    createdAt: now,
    updatedAt: now,
  },
] as const;

export function getBuiltinTemplate(id: string): PromptTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}
