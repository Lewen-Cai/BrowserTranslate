import { useState } from 'preact/hooks';
import { useAppStore } from '~/storage/store';
import { Input } from '~/ui/components/Input';
import { Select } from '~/ui/components/Select';
import { SectionHeader } from '~/ui/components/SectionHeader';
import { TestConnectionButton } from '~/ui/components/TestConnectionButton';
import { Eye, EyeOff } from '~/ui/icons';
import { useT } from '~/i18n';

export function ApiSettingsPage() {
  const api = useAppStore((s) => s.data.api);
  const templates = useAppStore((s) => s.data.promptTemplates);
  const updateApi = useAppStore((s) => s.updateApi);
  const [showKey, setShowKey] = useState(false);
  const t = useT();

  return (
    <div class="max-w-lg">
      <SectionHeader number="01" label={t('sectionApiEndpoint').toUpperCase()} description={t('openaiCompatible')} />
      <div class="space-y-4 mb-8">
        <Input
          label={t('baseUrl')}
          value={api.baseUrl}
          placeholder="https://api.openai.com/v1"
          mono
          hint="OpenAI · DeepSeek · Moonshot · Groq · OpenRouter · Ollama"
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
        <div class="pt-1">
          <TestConnectionButton />
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
