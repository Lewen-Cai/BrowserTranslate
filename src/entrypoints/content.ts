import { h } from 'preact';
import { createShadowMount } from './content/mount';
import { createSelectionWatcher, getCurrentParagraphText, type SelectionInfo } from './content/selectionWatcher';
import { createHotkeyWatcher, type HotkeyWatcher } from './content/hotkeyWatcher';
import { TriggerIcon } from './content/TriggerIcon';
import { TranslationCard } from './content/TranslationCard';
import { StorageClient } from '~/storage/client';
import { resolveEffectiveTheme } from '~/ui/themeResolver';
import { resolveLocale } from '~/i18n';
import type { Locale } from '~/i18n/strings';
import type { GlobalSettings } from '~/storage/schema';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    const mount = createShadowMount();
    const client = new StorageClient();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    let themeSetting: GlobalSettings['theme'] = 'auto';
    let locale: Locale = 'en';

    const applyTheme = () => {
      mount.setTheme(resolveEffectiveTheme(themeSetting, mql.matches));
    };

    mql.addEventListener('change', applyTheme);

    let state: 'idle' | 'icon' | 'card' = 'idle';
    let selectionWatcher: { stop: () => void } | null = null;
    let hotkey: HotkeyWatcher | null = null;

    const showIcon = (info: SelectionInfo) => {
      state = 'icon';
      mount.render(
        h(TriggerIcon, {
          rect: info.rect,
          onClick: () => showCard(info),
        }),
      );
    };

    const showCard = (info: SelectionInfo) => {
      state = 'card';
      mount.render(
        h(TranslationCard, {
          text: info.text,
          rect: info.rect,
          locale,
          onClose: () => {
            state = 'idle';
            mount.unmount();
          },
        }),
      );
    };

    const hide = () => {
      state = 'idle';
      mount.unmount();
    };

    /** Tear down then re-create watchers based on the current settings. */
    async function reattach() {
      selectionWatcher?.stop();
      hotkey?.stop();
      selectionWatcher = null;
      hotkey = null;
      if (state !== 'idle') hide();

      const data = await client.loadAppData();
      themeSetting = data.settings.theme;
      locale = resolveLocale(data.settings.uiLanguage);
      applyTheme();

      if (data.settings.triggerMode === 'icon') {
        const w = createSelectionWatcher((info) => {
          if (info) {
            if (state !== 'card') showIcon(info);
          } else if (state === 'icon') {
            hide();
          }
        });
        w.start();
        selectionWatcher = w;
      }

      const hk = createHotkeyWatcher(data.settings.hotkey, () => {
        const info = getSelectionInfo() ?? paragraphFallback();
        if (info) showCard(info);
      });
      hk.start();
      hotkey = hk;
    }

    await reattach();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (!('app:data' in changes)) return;
      void reattach();
    });

    document.addEventListener('mousedown', (e) => {
      if (state === 'idle') return;
      const target = e.target as Node;
      if (mount.root.contains(target)) return;
      if (state === 'icon') return;
      hide();
    }, true);
  },
});

function getSelectionInfo(): SelectionInfo | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const text = sel.toString().trim();
  if (!text) return null;
  return { text, rect: sel.getRangeAt(0).getBoundingClientRect() };
}

function paragraphFallback(): SelectionInfo | null {
  return getCurrentParagraphText();
}
