import type { PromptTemplate } from '~/storage/schema';

export interface TranslateOptions {
  text: string;
  sourceLang?: string;             // optional hint; provider may ignore
  targetLang: string;
  template: PromptTemplate;
  temperature?: number;        // omit → provider uses its own default
  maxTokens?: number;
  stream: boolean;
  signal?: AbortSignal;
  context?: { url?: string; title?: string };
}

export interface TranslationChunk {
  delta: string;                   // incremental text
  done: boolean;                   // true on the final chunk
}

export interface ProviderError {
  kind: 'auth' | 'network' | 'rate-limit' | 'server' | 'aborted' | 'parse' | 'unknown';
  message: string;
  retryable: boolean;
  status?: number;
}

export interface TranslationProvider {
  readonly id: string;
  translate(opts: TranslateOptions): AsyncIterable<TranslationChunk>;
}

export class TranslationProviderError extends Error {
  constructor(public readonly info: ProviderError) {
    super(info.message);
    this.name = 'TranslationProviderError';
  }
}
