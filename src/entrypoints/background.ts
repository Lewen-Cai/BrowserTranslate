import { StorageClient } from '~/storage/client';
import { CacheStore } from '~/storage/cacheStore';
import { HistoryStore } from '~/storage/historyStore';
import { OpenAICompatibleProvider } from '~/core/providers/openai';
import { TranslationProviderError } from '~/core/providers/types';
import { computeCacheKey } from '~/core/cache/key';
import { detectLanguage } from '~/core/language/detect';
import { autoSystemPrompt } from '~/core/dictionary/prompt';
import { looksLikeDictionary } from '~/core/dictionary/discriminate';
import { t as i18nT, resolveLocale } from '~/i18n';
import type { Request, TranslateRequest } from '~/messaging/types';

export default defineBackground(() => {
  const client = new StorageClient();
  const activeAborts = new Map<string, AbortController>();

  chrome.runtime.onMessage.addListener((msg: Request, _sender, sendResponse) => {
    if (msg.type === 'translate:abort') {
      activeAborts.get(msg.requestId)?.abort();
      sendResponse({ ok: true });
      return false;
    }
    if (msg.type === 'translate') {
      void handleTranslate(msg, _sender, client, activeAborts);
      sendResponse({ ok: true });
      return false;
    }
    if (msg.type === 'ping') {
      void handlePing(msg.requestId, client);
      sendResponse({ ok: true });
      return false;
    }
    return false;
  });

  chrome.alarms.create('cache-evict', { periodInMinutes: 60 });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'cache-evict') {
      const data = await client.loadAppData();
      if (data.settings.cacheEnabled) {
        await new CacheStore(client, data.settings.cacheTTLDays).evictExpired();
      }
    }
  });
});

async function handleTranslate(
  msg: TranslateRequest,
  sender: chrome.runtime.MessageSender,
  client: StorageClient,
  activeAborts: Map<string, AbortController>,
): Promise<void> {
  const data = await client.loadAppData();
  const tabId = sender.tab?.id;
  const send = (payload: object) => {
    if (tabId !== undefined) chrome.tabs.sendMessage(tabId, payload).catch(() => {});
    else chrome.runtime.sendMessage(payload).catch(() => {});
  };

  try {
    const api = data.api;
    const missingKey = api.providerType === 'cloud' && !api.apiKey;
    if (!api.baseUrl || missingKey || !api.model) {
      const locale = resolveLocale(
        data.settings.uiLanguage,
        typeof navigator !== 'undefined' ? navigator.language : 'en',
      );
      send({
        type: 'translate:error',
        requestId: msg.requestId,
        message: i18nT('noProfileError', locale),
        kind: 'auth',
      });
      return;
    }
    const activeTemplate = data.promptTemplates.find((t) => t.id === api.promptTemplateId);
    if (!activeTemplate) {
      send({
        type: 'translate:error',
        requestId: msg.requestId,
        message: 'Prompt template missing',
        kind: 'unknown',
      });
      return;
    }
    const template = {
      ...activeTemplate,
      systemPrompt: autoSystemPrompt(activeTemplate.systemPrompt),
    };

    const targetLang = msg.targetLang ?? data.settings.targetLanguage;
    const sourceLang = msg.sourceLang ?? detectLanguage(msg.text);

    let cacheKey: string | undefined;
    if (data.settings.cacheEnabled) {
      cacheKey = await computeCacheKey({
        text: msg.text, model: api.model,
        promptTemplateId: template.id, targetLang,
      });
      const cached = await new CacheStore(client, data.settings.cacheTTLDays).get(cacheKey);
      if (cached !== undefined) {
        send({ type: 'translate:chunk', requestId: msg.requestId, delta: cached });
        send({ type: 'translate:done', requestId: msg.requestId, full: cached, cached: true });
        return;
      }
    }

    const provider = new OpenAICompatibleProvider({
      baseUrl: api.baseUrl,
      apiKey: api.apiKey,
      model: api.model,
      customHeaders: api.customHeaders,
    });

    const abortCtl = new AbortController();
    activeAborts.set(msg.requestId, abortCtl);

    let full = '';
    try {
      await withRetry(async () => {
        full = '';
        for await (const chunk of provider.translate({
          text: msg.text,
          targetLang,
          sourceLang: sourceLang === 'unknown' ? undefined : sourceLang,
          template,
          maxTokens: api.maxTokens,
          stream: true,
          signal: abortCtl.signal,
          context: msg.context,
        })) {
          if (chunk.delta) {
            full += chunk.delta;
            send({ type: 'translate:chunk', requestId: msg.requestId, delta: chunk.delta });
          }
        }
      });
    } finally {
      activeAborts.delete(msg.requestId);
    }

    if (cacheKey && full) {
      await new CacheStore(client, data.settings.cacheTTLDays).set(cacheKey, full);
    }
    if (data.settings.historyEnabled && full && !looksLikeDictionary(full)) {
      await new HistoryStore(client, data.settings.historyMaxEntries).add({
        id: msg.requestId,
        sourceText: msg.text,
        translatedText: full,
        model: api.model,
        targetLang,
        url: msg.context?.url,
        title: msg.context?.title,
        createdAt: Date.now(),
      });
    }

    send({ type: 'translate:done', requestId: msg.requestId, full, cached: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const kind = e instanceof TranslationProviderError ? e.info.kind : 'unknown';
    send({ type: 'translate:error', requestId: msg.requestId, message, kind });
  }
}

async function handlePing(requestId: string, client: StorageClient): Promise<void> {
  const data = await client.loadAppData();
  const api = data.api;
  const send = (payload: object) => {
    chrome.runtime.sendMessage(payload).catch(() => {});
  };

  if (!api.baseUrl) {
    send({ type: 'ping:error', requestId, message: 'Base URL is empty' });
    return;
  }
  if (api.providerType === 'cloud' && !api.apiKey) {
    send({ type: 'ping:error', requestId, message: 'API Key is empty' });
    return;
  }

  const endpoint = api.baseUrl.replace(/\/+$/, '') + '/models';
  const ctl = new AbortController();
  const timeout = setTimeout(() => ctl.abort(), 10000);
  const startedAt = Date.now();

  try {
    const headers: Record<string, string> = { ...api.customHeaders };
    if (api.apiKey) {
      headers['Authorization'] = `Bearer ${api.apiKey}`;
    }
    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: ctl.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const j = await response.json();
        if (j?.error?.message) detail = String(j.error.message).slice(0, 200);
      } catch { /* not JSON */ }
      send({ type: 'ping:error', requestId, status: response.status, message: detail });
      return;
    }

    let availableModels: string[] = [];
    try {
      const json = await response.json();
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json?.models) ? json.models : [];
      availableModels = list
        .map((m: { id?: string; name?: string }) => m.id ?? m.name ?? '')
        .filter((s: string) => s.length > 0);
    } catch {
      // response was 200 but not parseable as JSON — still considered ok
    }

    let modelInList: boolean | null = null;
    if (api.model) {
      if (availableModels.length > 0) {
        const wanted = api.model.toLowerCase();
        modelInList = availableModels.some((id) => id.toLowerCase() === wanted);
      }
      // else: list empty / unparseable → null (can't determine)
    }

    send({
      type: 'ping:ok',
      requestId,
      latencyMs,
      availableModels,
      modelInList,
      configuredModel: api.model,
    });
  } catch (e) {
    clearTimeout(timeout);
    const msg = (e as Error).name === 'AbortError' ? 'Timeout' : (e as Error).message || 'Network error';
    send({ type: 'ping:error', requestId, message: msg });
  }
}

async function withRetry<T>(fn: () => Promise<T>, max = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= max; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!(e instanceof TranslationProviderError) || !e.info.retryable) throw e;
      const backoff = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}
