import { APP_DATA_VERSION, type AppData } from './schema';
import type { ProviderConfig, ProviderSlot } from './schema';
import { BUILTIN_TEMPLATES } from '~/core/prompt/builtin';
import { inferCloudProvider } from '~/core/providers/presets';
import { activeSlot } from '~/core/providers/providerSlots';

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
  data = seedSavedConfigs(data);
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

function seedSavedConfigs(data: AppData): AppData {
  const api = data.api;
  const raw = api.savedConfigs && typeof api.savedConfigs === 'object' ? api.savedConfigs : {};
  const clean: Partial<Record<ProviderSlot, ProviderConfig>> = {};
  for (const [slot, cfg] of Object.entries(raw)) {
    if (cfg && typeof cfg.baseUrl === 'string' && typeof cfg.apiKey === 'string' && typeof cfg.model === 'string') {
      clean[slot as ProviderSlot] = { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, model: cfg.model };
    }
  }
  const slot = activeSlot(api);
  if (!(slot in clean)) {
    clean[slot] = { baseUrl: api.baseUrl, apiKey: api.apiKey, model: api.model };
  }
  if (JSON.stringify(api.savedConfigs ?? null) === JSON.stringify(clean)) return data;
  return { ...data, api: { ...api, savedConfigs: clean } };
}
