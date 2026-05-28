import type { ApiSettings } from '~/storage/schema';
import type { PingResponse } from '~/messaging/types';

export type StatusState =
  | { kind: 'not-configured' }
  | { kind: 'checking' }
  | { kind: 'ready'; latencyMs: number }
  | { kind: 'model-missing'; availableModels: string[]; configuredModel: string }
  | { kind: 'offline'; message: string; status?: number };

export type PingValue = PingResponse | 'pending' | null;

/**
 * Required fields depend on providerType:
 *  - cloud: baseUrl + apiKey + model
 *  - local: baseUrl + model (key not required)
 */
function hasRequiredFields(api: ApiSettings): boolean {
  if (!api.baseUrl || !api.model) return false;
  if (api.providerType === 'cloud' && !api.apiKey) return false;
  return true;
}

export function deriveStatus(api: ApiSettings, ping: PingValue): StatusState {
  if (!hasRequiredFields(api)) return { kind: 'not-configured' };
  if (ping === null || ping === 'pending') return { kind: 'checking' };
  if (ping.type === 'ping:error') {
    return { kind: 'offline', message: ping.message, status: ping.status };
  }
  if (ping.modelInList === false) {
    return {
      kind: 'model-missing',
      availableModels: ping.availableModels,
      configuredModel: ping.configuredModel,
    };
  }
  return { kind: 'ready', latencyMs: ping.latencyMs };
}
