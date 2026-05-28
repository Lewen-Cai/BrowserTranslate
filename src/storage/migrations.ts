import { APP_DATA_VERSION, type AppData } from './schema';
import { BUILTIN_TEMPLATES } from '~/core/prompt/builtin';
import { inferCloudProvider } from '~/core/providers/presets';

/**
 * Integrity repairs applied to AppData on every load.
 * No version migration in v1 (this is the initial shape).
 */
export function migrateAppData(input: AppData): AppData {
  if (typeof input.version !== 'number' || input.version > APP_DATA_VERSION) {
    throw new Error(`Unsupported AppData version: ${input.version}`);
  }

  let data = input;
  data = ensureBuiltinTemplates(data);
  data = repairOrphanedApiTemplateRef(data);
  data = fillApiProviderDefaults(data);
  return data;
}

function fillApiProviderDefaults(data: AppData): AppData {
  const api = data.api;
  const providerTypeValid = api.providerType === 'cloud' || api.providerType === 'local';
  const cloudProviderValid =
    api.cloudProvider === 'openai' ||
    api.cloudProvider === 'deepseek' ||
    api.cloudProvider === 'custom';
  if (providerTypeValid && cloudProviderValid) return data;
  return {
    ...data,
    api: {
      ...api,
      providerType: api.providerType === 'local' ? 'local' : 'cloud',
      cloudProvider:
        api.cloudProvider === 'openai' || api.cloudProvider === 'deepseek' || api.cloudProvider === 'custom'
          ? api.cloudProvider
          : inferCloudProvider(api.baseUrl),
    },
  };
}

function ensureBuiltinTemplates(data: AppData): AppData {
  const have = new Set(data.promptTemplates.map((t) => t.id));
  const missing = BUILTIN_TEMPLATES.filter((b) => !have.has(b.id));
  if (missing.length === 0) return data;
  return {
    ...data,
    promptTemplates: [...missing.map((t) => ({ ...t })), ...data.promptTemplates],
  };
}

function repairOrphanedApiTemplateRef(data: AppData): AppData {
  const validIds = new Set(data.promptTemplates.map((t) => t.id));
  if (validIds.has(data.api.promptTemplateId)) return data;
  return { ...data, api: { ...data.api, promptTemplateId: 'builtin-general' } };
}
