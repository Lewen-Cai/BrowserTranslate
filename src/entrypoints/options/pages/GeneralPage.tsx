import { useAppStore } from '~/storage/store';
import { Input } from '~/ui/components/Input';
import { Select } from '~/ui/components/Select';
import { Switch } from '~/ui/components/Switch';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { useT } from '~/i18n';

const LANGUAGES = [
  { value: 'zh-CN', label: '简体中文 (zh-CN)' },
  { value: 'zh-TW', label: '繁體中文 (zh-TW)' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export function GeneralPage() {
  const settings = useAppStore((s) => s.data.settings);
  const update = useAppStore((s) => s.updateSettings);
  const t = useT();

  return (
    <div class="max-w-lg space-y-8">
      <div>
        <SectionHeader number="01" label={t('sectionTranslation').toUpperCase()} />
        <div class="space-y-4">
          <Select label={t('targetLanguage')}
            value={settings.targetLanguage} options={LANGUAGES}
            onChange={(e) => update({ targetLanguage: (e.target as HTMLSelectElement).value })}
          />
          <Select label={t('triggerMode')}
            value={settings.triggerMode}
            options={[
              { value: 'icon', label: t('iconAfterSelection') },
              { value: 'hotkey', label: t('hotkeyOnly') },
            ]}
            onChange={(e) => update({ triggerMode: (e.target as HTMLSelectElement).value as 'icon' | 'hotkey' })}
          />
          <Input label={t('hotkey')} value={settings.hotkey} placeholder="Alt+T" mono
            hint={t('hotkeyHint')}
            onInput={(e) => update({ hotkey: (e.target as HTMLInputElement).value })}
          />
          <Switch
            checked={settings.streamingEnabled}
            onChange={(v) => update({ streamingEnabled: v })}
            label={t('streamingOutput')}
            description={t('streamingDesc')}
          />
        </div>
      </div>

      <div>
        <SectionHeader number="02" label={t('sectionCacheHistory').toUpperCase()} />
        <div class="space-y-4">
          <Switch
            checked={settings.cacheEnabled}
            onChange={(v) => update({ cacheEnabled: v })}
            label={t('cacheTranslations')}
            description={t('cacheDesc')}
          />
          <Input label={t('cacheTtl')} type="number" min="1" max="365"
            value={String(settings.cacheTTLDays)} disabled={!settings.cacheEnabled} mono
            onInput={(e) => update({ cacheTTLDays: Math.max(1, parseInt((e.target as HTMLInputElement).value) || 30) })}
          />
          <Switch
            checked={settings.historyEnabled}
            onChange={(v) => update({ historyEnabled: v })}
            label={t('saveHistory')}
            description={t('saveHistoryDesc')}
          />
          <Input label={t('historyMax')} type="number" min="10" max="2000"
            value={String(settings.historyMaxEntries)} disabled={!settings.historyEnabled} mono
            onInput={(e) => update({ historyMaxEntries: Math.max(10, parseInt((e.target as HTMLInputElement).value) || 200) })}
          />
        </div>
      </div>

      <div>
        <SectionHeader number="03" label={t('sectionAppearance').toUpperCase()} />
        <div class="space-y-4">
          <Select label={t('theme')}
            value={settings.theme}
            options={[
              { value: 'auto', label: t('themeAuto') },
              { value: 'light', label: t('themeLight') },
              { value: 'dark', label: t('themeDark') },
            ]}
            onChange={(e) => update({ theme: (e.target as HTMLSelectElement).value as 'auto' | 'light' | 'dark' })}
          />
          <Select label={t('uiLanguage')}
            value={settings.uiLanguage}
            options={[
              { value: 'auto', label: t('uiLangAuto') },
              { value: 'en', label: t('uiLangEn') },
              { value: 'zh-CN', label: t('uiLangZhCN') },
            ]}
            onChange={(e) => update({ uiLanguage: (e.target as HTMLSelectElement).value as 'auto' | 'en' | 'zh-CN' })}
          />
        </div>
      </div>
    </div>
  );
}
