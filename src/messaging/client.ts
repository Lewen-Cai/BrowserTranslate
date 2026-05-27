import type { PingResponse, Request, TranslateRequest, TranslateResponse } from './types';

export function sendRequest(req: Request): void {
  void chrome.runtime.sendMessage(req).catch(() => {
    // background may not be ready yet on first install
  });
}

/**
 * Sends a translate request and yields response chunks for the given requestId.
 * Caller owns the requestId and is responsible for unique-ifying it.
 */
export async function* streamTranslate(req: TranslateRequest): AsyncIterable<TranslateResponse> {
  const queue: TranslateResponse[] = [];
  let resolveNext: ((v: TranslateResponse | null) => void) | null = null;
  let ended = false;

  const listener = (msg: unknown) => {
    const m = msg as TranslateResponse;
    if (m.requestId !== req.requestId) return;
    if (m.type === 'translate:chunk') {
      if (resolveNext) { resolveNext(m); resolveNext = null; }
      else queue.push(m);
    } else {
      // done or error
      if (resolveNext) { resolveNext(m); resolveNext = null; }
      else queue.push(m);
      ended = true;
      chrome.runtime.onMessage.removeListener(listener);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
  sendRequest(req);

  try {
    while (!ended || queue.length > 0) {
      let next: TranslateResponse | null;
      if (queue.length > 0) {
        next = queue.shift()!;
      } else {
        next = await new Promise<TranslateResponse | null>((r) => { resolveNext = r; });
      }
      if (!next) break;
      yield next;
      if (next.type !== 'translate:chunk') break;
    }
  } finally {
    chrome.runtime.onMessage.removeListener(listener);
  }
}

export function abortTranslate(requestId: string): void {
  sendRequest({ type: 'translate:abort', requestId });
}

/**
 * Tests connectivity to the configured OpenAI-compatible endpoint
 * by calling GET {baseUrl}/models. Returns success or error info.
 */
export function pingApi(): Promise<PingResponse> {
  const requestId = `ping-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return new Promise((resolve) => {
    const listener = (msg: unknown) => {
      const m = msg as PingResponse;
      if (m.requestId !== requestId) return;
      if (m.type === 'ping:ok' || m.type === 'ping:error') {
        chrome.runtime.onMessage.removeListener(listener);
        resolve(m);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    sendRequest({ type: 'ping', requestId });
    // Safety timeout (15s)
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(listener);
      resolve({ type: 'ping:error', requestId, message: 'Timeout (15s)' });
    }, 15000);
  });
}
