import { useState } from 'preact/hooks';
import { pingApi } from '~/messaging/client';
import { useT } from '~/i18n';
import { Loader2, Check, AlertCircle } from '~/ui/icons';
import { Button } from './Button';

type State =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | {
      kind: 'ok';
      latencyMs: number;
      availableModels: string[];
      modelInList: boolean | null;
      configuredModel: string;
    }
  | { kind: 'error'; message: string; status?: number };

export function TestConnectionButton() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const t = useT();

  async function run() {
    setState({ kind: 'testing' });
    const r = await pingApi();
    if (r.type === 'ping:ok') {
      setState({
        kind: 'ok',
        latencyMs: r.latencyMs,
        availableModels: r.availableModels,
        modelInList: r.modelInList,
        configuredModel: r.configuredModel,
      });
    } else {
      setState({ kind: 'error', message: r.message, status: r.status });
    }
  }

  return (
    <div class="space-y-2">
      <Button variant="secondary" size="sm" onClick={run} disabled={state.kind === 'testing'}>
        {state.kind === 'testing' ? (
          <>
            <Loader2 size={12} class="animate-spin" /> {t('testing')}
          </>
        ) : (
          t('testConnection')
        )}
      </Button>

      {state.kind === 'ok' && state.modelInList === true && (
        <div class="flex items-start gap-1.5 text-2xs font-mono text-ap-success">
          <Check size={12} class="mt-0.5 shrink-0" />
          <span>{t('testConnected')} · {state.latencyMs}ms</span>
        </div>
      )}

      {state.kind === 'ok' && state.modelInList === null && (
        <div class="flex items-start gap-1.5 text-2xs font-mono text-ap-success">
          <Check size={12} class="mt-0.5 shrink-0" />
          <span>{t('testConnected')} · {state.latencyMs}ms</span>
        </div>
      )}

      {state.kind === 'ok' && state.modelInList === false && (
        <div class="space-y-1">
          <div class="flex items-start gap-1.5 text-2xs font-mono text-amber-600 dark:text-amber-500">
            <AlertCircle size={12} class="mt-0.5 shrink-0" />
            <span>
              {t('modelNotInList').replace('{model}', state.configuredModel)}
            </span>
          </div>
          {state.availableModels.length > 0 && (
            <div class="pl-4 text-2xs font-mono text-ap-muted leading-relaxed">
              {t('availableModels')}: {state.availableModels.slice(0, 6).join(', ')}
              {state.availableModels.length > 6 && ` … +${state.availableModels.length - 6}`}
            </div>
          )}
        </div>
      )}

      {state.kind === 'error' && (
        <div class="flex items-start gap-1.5 text-2xs font-mono text-ap-danger">
          <AlertCircle size={12} class="mt-0.5 shrink-0" />
          <span>
            {state.status ? `${state.status} · ` : ''}{state.message}
          </span>
        </div>
      )}
    </div>
  );
}
