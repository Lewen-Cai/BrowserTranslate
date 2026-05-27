import type { StorageClient } from './client';
import type { CacheMeta } from './schema';

export class CacheStore {
  constructor(
    private readonly client: StorageClient,
    private readonly ttlDays: number,
  ) {}

  async get(key: string): Promise<string | undefined> {
    const entry = await this.client.getCacheEntry(key);
    if (!entry) return undefined;
    const index = await this.client.loadCacheIndex();
    const meta = index.find((m) => m.key === key);
    if (meta) {
      meta.hitCount++;
      await this.client.saveCacheIndex(index);
    }
    return entry.translated;
  }

  async set(key: string, translated: string): Promise<void> {
    await this.client.setCacheEntry(key, { translated });
    const index = await this.client.loadCacheIndex();
    const existing = index.find((m) => m.key === key);
    if (existing) {
      existing.createdAt = Date.now();
    } else {
      index.push({
        key,
        storageKey: 'cache:' + key,
        createdAt: Date.now(),
        hitCount: 0,
      });
    }
    await this.client.saveCacheIndex(index);
  }

  async listIndex(): Promise<CacheMeta[]> {
    return this.client.loadCacheIndex();
  }

  async evictExpired(): Promise<number> {
    const index = await this.client.loadCacheIndex();
    const cutoff = Date.now() - this.ttlDays * 24 * 60 * 60 * 1000;
    const keep: CacheMeta[] = [];
    let evicted = 0;
    for (const meta of index) {
      if (meta.createdAt < cutoff) {
        await this.client.deleteCacheEntry(meta.key);
        evicted++;
      } else {
        keep.push(meta);
      }
    }
    await this.client.saveCacheIndex(keep);
    return evicted;
  }

  async clearAll(): Promise<void> {
    await this.client.clearAllCache();
  }
}
