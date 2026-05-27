import { useEffect, useState } from 'preact/hooks';
import { useAppStore } from '~/storage/store';
import { Input } from '~/ui/components/Input';
import { Select } from '~/ui/components/Select';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { TestConnectionButton } from '~/ui/components/TestConnectionButton';
import { Settings, Eye, EyeOff } from '~/ui/icons';
import { useT } from '~/i18n';
import { useApplyTheme } from '~/ui/useApplyTheme';

const LANGUAGES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export function App() {
  const load = useAppStore((s) => s.load);
  const loaded = useAppStore((s) => s.loaded);
  const api = useAppStore((s) => s.data.api);
  const settings = useAppStore((s) => s.data.settings);
  const templates = useAppStore((s) => s.data.promptTemplates);
  const updateApi = useAppStore((s) => s.updateApi);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const t = useT();
  useApplyTheme();

  const [showKey, setShowKey] = useState(false);

  useEffect(() => { void load(); }, [load]);

  function openOptions() { chrome.runtime.openOptionsPage(); window.close(); }

  if (!loaded) {
    return <div class="p-4 text-2xs font-mono text-ap-subtle">{t('loading').toUpperCase()}</div>;
  }

  const apiConfigured = !!(api.baseUrl && api.apiKey && api.model);

  return (
    <div class="bg-ap-bg text-ap-fg">
      {/* Hero header */}
      <header class="relative">
        <div class="ap-grid-bg absolute inset-0 opacity-50 pointer-events-none" />
        <div class="relative flex items-stretch">
          <div class="w-1 bg-ap-brand" />
          <div class="flex-1 px-4 py-3 flex items-center justify-between">
            <div>
              <div class="font-mono text-2xs text-ap-subtle tracking-wider">BROWSERTRANSLATE</div>
              <div class="font-semibold text-sm">v0.1.0</div>
            </div>
            <button
              onClick={openOptions}
              class="text-ap-muted hover:text-ap-fg transition-colors"
              title={t('openFullSettings')}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
        <div class="border-t border-ap-border" />
      </header>

      {/* Status strip */}
      <div class="px-4 py-2 flex items-center gap-2 border-b border-ap-border bg-ap-surface">
        <span class={`w-1.5 h-1.5 rounded-full ${apiConfigured ? 'bg-ap-success' : 'bg-ap-danger'}`} />
        <span class="text-2xs font-mono uppercase tracking-wider text-ap-muted">
          {apiConfigured ? t('ready').toUpperCase() : t('notConfigured').toUpperCase()}
        </span>
        {apiConfigured && (
          <span class="ml-auto text-2xs font-mono text-ap-subtle truncate max-w-[160px]">
            {api.model}
          </span>
        )}
      </div>

      {/* 01 API */}
      <section class="px-4 pt-3 pb-3 border-b border-ap-border">
        <SectionHeader number="01" label={t('sectionApi').toUpperCase()} />
        <div class="space-y-2.5">
          <Input
            label={t('baseUrl')}
            value={api.baseUrl}
            placeholder="https://api.openai.com/v1"
            mono
            onInput={(e) => updateApi({ baseUrl: (e.target as HTMLInputElement).value })}
          />
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <Input
                label={t('apiKey')}
                type={showKey ? 'text' : 'password'}
                value={api.apiKey}
                placeholder="sk-..."
                mono
                onInput={(e) => updateApi({ apiKey: (e.target as HTMLInputElement).value })}
              />
            </div>
            <button
              onClick={() => setShowKey((s) => !s)}
              class="h-8 w-8 flex items-center justify-center rounded-md border border-ap-border bg-ap-surface text-ap-muted hover:text-ap-fg hover:border-ap-border-strong transition-colors"
            >
              {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          <Input
            label={t('model')}
            value={api.model}
            placeholder="gpt-4o-mini"
            mono
            onInput={(e) => updateApi({ model: (e.target as HTMLInputElement).value })}
          />
          <Select
            label={t('prompt')}
            value={api.promptTemplateId}
            options={templates.map((tmpl) => ({ value: tmpl.id, label: tmpl.name }))}
            onChange={(e) => updateApi({ promptTemplateId: (e.target as HTMLSelectElement).value })}
          />
          <div class="pt-1">
            <TestConnectionButton />
          </div>
        </div>
      </section>

      {/* 02 Translation */}
      <section class="px-4 pt-3 pb-4">
        <SectionHeader number="02" label={t('sectionTranslation').toUpperCase()} />
        <div class="space-y-2.5">
          <Select
            label={t('targetLanguage')}
            value={settings.targetLanguage}
            options={LANGUAGES}
            onChange={(e) => updateSettings({ targetLanguage: (e.target as HTMLSelectElement).value })}
          />
          <Select
            label={t('triggerMode')}
            value={settings.triggerMode}
            options={[
              { value: 'icon', label: t('iconAfterSelection') },
              { value: 'hotkey', label: t('hotkeyOnly') },
            ]}
            onChange={(e) => updateSettings({ triggerMode: (e.target as HTMLSelectElement).value as 'icon' | 'hotkey' })}
          />
          <Input
            label={t('hotkey')}
            value={settings.hotkey}
            placeholder="Alt+T"
            mono
            onInput={(e) => updateSettings({ hotkey: (e.target as HTMLInputElement).value })}
          />
        </div>
      </section>
    </div>
  );
}
