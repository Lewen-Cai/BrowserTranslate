import { CLOUD_PRESETS } from './presets';
import type { ApiSettings, ProviderConfig, ProviderSlot } from '~/storage/schema';

export function activeSlot(api: ApiSettings): ProviderSlot {
  return api.providerType === 'local' ? 'local' : api.cloudProvider;
}

export function defaultConfigForSlot(slot: ProviderSlot): ProviderConfig {
  const baseUrl = slot === 'openai' || slot === 'deepseek' ? CLOUD_PRESETS[slot].baseUrl : '';
  return { baseUrl, apiKey: '', model: '' };
}

/** Switch the active provider to `slot`, restoring its remembered config (or defaults). */
export function applySlot(api: ApiSettings, slot: ProviderSlot): ApiSettings {
  const cfg = api.savedConfigs?.[slot] ?? defaultConfigForSlot(slot);
  return {
    ...api,
    providerType: slot === 'local' ? 'local' : 'cloud',
    // Preserve the last cloud provider while in local, so Local -> Cloud returns to it.
    cloudProvider: slot === 'local' ? api.cloudProvider : slot,
    baseUrl: cfg.baseUrl,
    apiKey: cfg.apiKey,
    model: cfg.model,
  };
}

/** Stamp the current active fields into the active slot's remembered config. */
export function rememberActive(api: ApiSettings): ApiSettings {
  const slot = activeSlot(api);
  return {
    ...api,
    savedConfigs: {
      ...api.savedConfigs,
      [slot]: { baseUrl: api.baseUrl, apiKey: api.apiKey, model: api.model },
    },
  };
}
