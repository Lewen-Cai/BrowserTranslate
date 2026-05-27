import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryStore } from './historyStore';
import { StorageClient } from './client';
import type { HistoryEntry } from './schema';

interface FakeStorage {
  get(keys: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

function fakeChrome() {
  const data: Record<string, unknown> = {};
  const local: FakeStorage = {
    async get(k) {
      if (k === null) return { ...data };
      const arr = typeof k === 'string' ? [k] : k;
      const out: Record<string, unknown> = {};
      for (const x of arr) if (x in data) out[x] = data[x];
      return out;
    },
    async set(items) { Object.assign(data, items); },
    async remove(k) {
      const arr = typeof k === 'string' ? [k] : k;
      for (const x of arr) delete data[x];
    },
  };
  // @ts-expect-error stubbing chrome global
  globalThis.chrome = { storage: { local } };
}

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: Math.random().toString(36),
    sourceText: 'src',
    translatedText: 'dst',
    model: 'm',
    targetLang: 'en',
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('HistoryStore', () => {
  let store: HistoryStore;

  beforeEach(() => {
    fakeChrome();
    store = new HistoryStore(new StorageClient(), 5);  // cap = 5
  });

  it('starts empty', async () => {
    expect(await store.list()).toEqual([]);
  });

  it('newest entries first', async () => {
    await store.add(makeEntry({ sourceText: 'a', createdAt: 1 }));
    await store.add(makeEntry({ sourceText: 'b', createdAt: 2 }));
    const list = await store.list();
    expect(list[0]?.sourceText).toBe('b');
    expect(list[1]?.sourceText).toBe('a');
  });

  it('caps at maxEntries (drops oldest)', async () => {
    for (let i = 0; i < 7; i++) {
      await store.add(makeEntry({ sourceText: `t${i}`, createdAt: i }));
    }
    const list = await store.list();
    expect(list).toHaveLength(5);
    expect(list[0]?.sourceText).toBe('t6');
    expect(list[4]?.sourceText).toBe('t2');  // t0, t1 evicted
  });

  it('search finds by source or translated', async () => {
    await store.add(makeEntry({ sourceText: 'hello world', translatedText: '你好' }));
    await store.add(makeEntry({ sourceText: 'foo', translatedText: 'bar' }));
    expect((await store.search('hello')).length).toBe(1);
    expect((await store.search('你好')).length).toBe(1);
    expect((await store.search('zzz')).length).toBe(0);
  });

  it('clear empties', async () => {
    await store.add(makeEntry());
    await store.clear();
    expect(await store.list()).toEqual([]);
  });
});
