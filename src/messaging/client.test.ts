import { describe, it, expect, afterEach } from 'vitest';
import { streamTranslate } from './client';

const originalChrome = (globalThis as { chrome?: unknown }).chrome;

afterEach(() => {
  (globalThis as { chrome?: unknown }).chrome = originalChrome;
});

describe('streamTranslate context guard', () => {
  async function drain(req: Parameters<typeof streamTranslate>[0]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of streamTranslate(req)) { /* exhaust */ }
  }

  it('throws a refresh-actionable error when the extension context is invalidated', async () => {
    // Orphaned content script after an extension reload: chrome.runtime is undefined.
    (globalThis as { chrome?: unknown }).chrome = {};
    await expect(drain({ type: 'translate', requestId: 'r1', text: 'hi' })).rejects.toThrow(/context invalidated/i);
  });

  it('throws when chrome.runtime has lost its id', async () => {
    (globalThis as { chrome?: unknown }).chrome = { runtime: {} };
    await expect(drain({ type: 'translate', requestId: 'r2', text: 'hi' })).rejects.toThrow(/context invalidated/i);
  });
});
