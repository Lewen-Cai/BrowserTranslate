import type { StorageClient } from './client';
import type { HistoryEntry } from './schema';

export class HistoryStore {
  constructor(
    private readonly client: StorageClient,
    private readonly maxEntries: number,
  ) {}

  async list(): Promise<HistoryEntry[]> {
    const raw = await this.client.loadHistory();
    return [...raw].sort((a, b) => b.createdAt - a.createdAt);
  }

  async add(entry: HistoryEntry): Promise<void> {
    const list = await this.list();
    list.unshift(entry);
    if (list.length > this.maxEntries) list.length = this.maxEntries;
    await this.client.saveHistory(list);
  }

  async search(query: string): Promise<HistoryEntry[]> {
    if (!query) return this.list();
    const q = query.toLowerCase();
    const all = await this.list();
    return all.filter(
      (e) =>
        e.sourceText.toLowerCase().includes(q) ||
        e.translatedText.toLowerCase().includes(q),
    );
  }

  async clear(): Promise<void> {
    await this.client.clearHistory();
  }
}
