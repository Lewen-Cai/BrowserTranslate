import { useEffect, useState } from 'preact/hooks';
import { useAppStore } from '~/storage/store';
import { Input } from '~/ui/components/Input';
import { Select } from '~/ui/components/Select';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { SegmentedControl } from '~/ui/components/SegmentedControl';
import { ApiStatusIndicator } from '~/ui/components/ApiStatusIndicator';
import { Eye, EyeOff } from '~/ui/icons';
import { useT } from '~/i18n';
import { CLOUD_PRESETS, type CloudProvider } from '~/core/providers/presets';

export function ApiSettingsPage() {
  const api = useAppStore((s) => s.data.api);
  const templates = useAppStore((s) => s.data.promptTemplates);
  const updateApi = useAppStore((s) => s.updateApi);
  const [showKey, setShowKey] = useState(false);
  const t = useT();

  // Debounced re-ping: 1500ms idle after any meaningful API field edit.
  const [pingNonce, setPingNonce] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setPingNonce((n) => n + 1), 1500);
    return () => clearTimeout(id);
  }, [api.baseUrl, api.apiKey, api.model, api.providerType, api.cloudProvider]);

  const isCloud = api.providerType === 'cloud';
  const baseUrlLocked = isCloud && api.cloudProvider !== 'custom';

  function onProviderTypeChange(next: 'cloud' | 'local') {
    // Switching mode is a fresh slate: cloud and local use different
    // endpoints, keys, and model names, so don't carry stale values over.
    if (next === 'local') {
      updateApi({ providerType: 'local', baseUrl: '', apiKey: '', model: '' });
    } else {
      const baseUrl = api.cloudProvider === 'custom' ? '' : CLOUD_PRESETS[api.cloudProvider].baseUrl;
      updateApi({ providerType: 'cloud', baseUrl, apiKey: '', model: '' });
    }
  }

  function onCloudProviderChange(next: CloudProvider) {
    // Switching provider resets the provider-specific key + model and
    // follows the preset baseUrl (or clears it for custom).
    const baseUrl = next === 'custom' ? '' : CLOUD_PRESETS[next].baseUrl;
    updateApi({ cloudProvider: next, baseUrl, apiKey: '', model: '' });
  }

  return (
    <div class="max-w-lg">
      <SectionHeader number="01" label={t('sectionApiEndpoint').toUpperCase()} description={t('openaiCompatible')} />
      <div class="space-y-4 mb-8">
        <SegmentedControl<'cloud' | 'local'>
          label={t('providerType')}
          value={api.providerType}
          options={[
            { value: 'cloud', label: t('providerTypeCloud') },
            { value: 'local', label: t('providerTypeLocal') },
          ]}
          onChange={onProviderTypeChange}
        />

        {isCloud && (
          <Select
            label={t('cloudProvider')}
            value={api.cloudProvider}
            options={(Object.keys(CLOUD_PRESETS) as CloudProvider[]).map((k) => ({
              value: k,
              label: k === 'custom' ? t('cloudProviderCustom') : CLOUD_PRESETS[k].label,
            }))}
            onChange={(e) => onCloudProviderChange((e.target as HTMLSelectElement).value as CloudProvider)}
          />
        )}

        <Input
          label={t('baseUrl')}
          value={api.baseUrl}
          disabled={baseUrlLocked}
          mono
          hint="OpenAI · DeepSeek · Moonshot · Groq · OpenRouter · Ollama"
          onInput={(e) => updateApi({ baseUrl: (e.target as HTMLInputElement).value })}
        />

        {isCloud && (
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <Input
                label={t('apiKey')}
                type={showKey ? 'text' : 'password'}
                value={api.apiKey}
                mono
                onInput={(e) => updateApi({ apiKey: (e.target as HTMLInputElement).value })}
              />
            </div>
            <button
              onClick={() => setShowKey((s) => !s)}
              class="h-8 w-8 flex items-center justify-center rounded-md border border-ap-border bg-ap-surface text-ap-muted hover:text-ap-fg hover:border-ap-border-strong transition-colors"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        )}

        <Input
          label={t('model')}
          value={api.model}
          mono
          onInput={(e) => updateApi({ model: (e.target as HTMLInputElement).value })}
        />

        <div class="pt-1">
          <ApiStatusIndicator pingNonce={pingNonce} />
        </div>
      </div>

      <SectionHeader number="02" label={t('defaultPromptTemplate').toUpperCase()} />
      <div class="space-y-4">
        <Select
          label={t('prompt')}
          value={api.promptTemplateId}
          options={templates.map((tmpl) => ({ value: tmpl.id, label: tmpl.name }))}
          onChange={(e) => updateApi({ promptTemplateId: (e.target as HTMLSelectElement).value })}
        />
      </div>
    </div>
  );
}
