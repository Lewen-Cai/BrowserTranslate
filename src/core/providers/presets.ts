import type { ApiSettings } from '~/storage/schema';

export type CloudProvider = ApiSettings['cloudProvider'];

export interface CloudPreset {
  /** Label shown in the provider dropdown. */
  label: string;
  /** Base URL written to storage when this preset is chosen. Empty for 'custom'. */
  baseUrl: string;
}

export const CLOUD_PRESETS: Record<CloudProvider, CloudPreset> = {
  openai:   { label: 'OpenAI',   baseUrl: 'https://api.openai.com/v1' },
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
  custom:   { label: 'Custom',   baseUrl: '' },
};

/**
 * Return the CloudProvider key whose baseUrl matches the given URL.
 * Falls back to 'custom' if nothing matches.
 */
export function inferCloudProvider(baseUrl: string): CloudProvider {
  for (const key of Object.keys(CLOUD_PRESETS) as CloudProvider[]) {
    if (key === 'custom') continue;
    if (CLOUD_PRESETS[key].baseUrl === baseUrl) return key;
  }
  return 'custom';
}
