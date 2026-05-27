import type { ComponentChildren } from 'preact';
import { ChevronRight, ChevronDown } from '~/ui/icons';

interface Props {
  number: string;
  label: string;
  summary?: string;          // e.g. "deepseek-v4-flash" or "简体中文 · Alt+T"
  statusDot?: 'on' | 'off' | 'warn' | null;
  expanded: boolean;
  onToggle: () => void;
  children: ComponentChildren;
}

export function CollapsibleSection({ number, label, summary, statusDot, expanded, onToggle, children }: Props) {
  return (
    <section class="px-4 border-t border-ap-border first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        class="w-full flex items-center gap-3 py-2.5 text-left hover:bg-ap-surface/50 transition-colors -mx-4 px-4"
      >
        <span class="font-mono text-2xs text-ap-subtle tracking-wider">{number}</span>
        <span class="font-mono text-2xs text-ap-fg uppercase tracking-wider font-medium">{label}</span>
        {!expanded && summary && (
          <>
            {statusDot && (
              <span class={`w-1.5 h-1.5 rounded-full ${
                statusDot === 'on' ? 'bg-ap-success'
                : statusDot === 'warn' ? 'bg-amber-500'
                : 'bg-ap-danger'
              }`} />
            )}
            <span class="text-2xs text-ap-muted truncate flex-1 font-mono">{summary}</span>
          </>
        )}
        <span class="ml-auto text-ap-subtle">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>
      {expanded && (
        <div class="pb-3 space-y-2.5">
          {children}
        </div>
      )}
    </section>
  );
}
