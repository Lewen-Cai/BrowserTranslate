import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheStore } from './cacheStore';
import { StorageClient } from './client';

interface FakeStorage {
  get(keys: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

function fakeChrome() {
  const data: Record<string, unknown> = {};
  const local: FakeStorage = {
    async get(keys) {
      if (keys === null) return { ...data };
      const arr = typeof keys === 'string' ? [keys] : keys;
      const out: Record<string, unknown> = {};
      for (const k of arr) if (k in data) out[k] = data[k];
      return out;
    },
    async set(items) { Object.assign(data, items); },
    async remove(keys) {
      const arr = typeof keys === 'string' ? [keys] : keys;
      for (const k of arr) delete data[k];
    },
  };
  // @ts-expect-error stubbing chrome global
  globalThis.chrome = { storage: { local } };
  return data;
}

describe('CacheStore', () => {
  let store: CacheStore;

  beforeEach(() => {
    fakeChrome();
    store = new CacheStore(new StorageClient(), 30);  // 30-day TTL
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns undefined on miss', async () => {
    expect(await store.get('nope')).toBeUndefined();
  });

  it('round-trips text', async () => {
    await store.set('k1', '你好');
    expect(await store.get('k1')).toBe('你好');
  });

  it('increments hit count on get', async () => {
    await store.set('k1', 'x');
    await store.get('k1');
    await store.get('k1');
    const index = await store.listIndex();
    const entry = index.find((e) => e.key === 'k1');
    expect(entry?.hitCount).toBe(2);
  });

  it('evicts entries older than TTL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    await store.set('old', 'x');
    vi.setSystemTime(new Date('2026-03-15T00:00:00Z')); // > 30 days later
    await store.evictExpired();
    expect(await store.get('old')).toBeUndefined();
  });

  it('clearAll removes everything', async () => {
    await store.set('a', '1');
    await store.set('b', '2');
    await store.clearAll();
    expect(await store.get('a')).toBeUndefined();
    expect(await store.get('b')).toBeUndefined();
    expect(await store.listIndex()).toEqual([]);
  });
});
