import { useEffect, useState } from 'preact/hooks';
import { StorageClient } from '~/storage/client';
import { HistoryStore } from '~/storage/historyStore';
import { useAppStore } from '~/storage/store';
import { Button } from '~/ui/components/Button';
import { Input } from '~/ui/components/Input';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { Search, Trash2 } from '~/ui/icons';
import { useT } from '~/i18n';
import type { HistoryEntry } from '~/storage/schema';

const client = new StorageClient();

export function HistoryPage() {
  const cap = useAppStore((s) => s.data.settings.historyMaxEntries);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState('');
  const t = useT();

  async function reload() {
    const store = new HistoryStore(client, cap);
    setEntries(query ? await store.search(query) : await store.list());
  }

  useEffect(() => { void reload(); }, [query, cap]);

  async function clear() {
    if (!confirm('Clear all history?')) return;
    await new HistoryStore(client, cap).clear();
    await reload();
  }

  return (
    <div class="max-w-2xl">
      <div class="flex items-center justify-between mb-4">
        <SectionHeader number="01" label={`${t('sectionHistory').toUpperCase()} · ${entries.length}`} />
      </div>
      <div class="flex gap-2 mb-4">
        <div class="flex-1 relative">
          <Search size={12} class="absolute left-2.5 top-2.5 text-ap-subtle" />
          <Input
            value={query}
            placeholder={t('searchHistory')}
            class="pl-7"
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={clear}><Trash2 size={12} /> {t('clearAll')}</Button>
      </div>
      {entries.length === 0 ? (
        <div class="border border-dashed border-ap-border p-12 text-center">
          <div class="font-mono text-2xs text-ap-subtle tracking-wider mb-2">{t('noEntries').toUpperCase()}</div>
          <div class="text-sm text-ap-muted">{t('noEntriesHint')}</div>
        </div>
      ) : (
        <ul class="border-t border-ap-border max-h-[60vh] overflow-y-auto">
          {entries.map((e) => (
            <li key={e.id} class="border-b border-ap-border py-3 px-1">
              <div class="flex items-center gap-3 text-2xs font-mono text-ap-subtle tracking-wider mb-1.5">
                <span>{new Date(e.createdAt).toLocaleString()}</span>
                <span>·</span>
                <span>{e.targetLang}</span>
                <span>·</span>
                <span class="truncate">{e.model}</span>
                {e.url && <>
                  <span>·</span>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" class="text-ap-brand hover:underline truncate max-w-[200px]">{e.title || e.url}</a>
                </>}
              </div>
              <div class="text-xs text-ap-muted truncate font-mono">{e.sourceText}</div>
              <div class="text-sm text-ap-fg mt-1">{e.translatedText}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
