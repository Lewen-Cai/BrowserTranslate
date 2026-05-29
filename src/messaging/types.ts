export interface TranslateRequest {
  type: 'translate';
  requestId: string;
  text: string;
  sourceLang?: string;
  targetLang?: string;           // omit → use global setting
  context?: { url?: string; title?: string };
}

export type TranslateResponse =
  | { type: 'translate:chunk'; requestId: string; delta: string }
  | { type: 'translate:done'; requestId: string; full: string; cached: boolean }
  | { type: 'translate:error'; requestId: string; message: string; kind: string };

export interface AbortRequest {
  type: 'translate:abort';
  requestId: string;
}

export interface PingRequest {
  type: 'ping';
  requestId: string;
}

export type PingResponse =
  | {
      type: 'ping:ok';
      requestId: string;
      latencyMs: number;
      availableModels: string[];      // empty if provider didn't return a list we could parse
      modelInList: boolean | null;    // null if we couldn't determine (no list or no api.model set)
      configuredModel: string;        // echo of api.model for client-side reference
    }
  | { type: 'ping:error'; requestId: string; status?: number; message: string };

export type Request = TranslateRequest | AbortRequest | PingRequest;
