import type { JSX } from 'preact';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  /** Stretch the control to fill its container, dividing width equally. */
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({ label, value, options, onChange, fullWidth = false }: Props<T>): JSX.Element {
  return (
    <div>
      {label && (
        <div class="font-mono text-2xs uppercase tracking-wider text-ap-muted mb-1">{label}</div>
      )}
      <div class={`${fullWidth ? 'flex w-full' : 'inline-flex'} rounded-md border border-ap-border bg-ap-surface p-0.5`}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              class={`${fullWidth ? 'flex-1 py-1.5' : 'py-1'} px-2.5 text-2xs font-mono uppercase tracking-wider rounded transition-colors ${
                active
                  ? 'bg-ap-brand text-ap-brand-fg'
                  : 'text-ap-muted hover:text-ap-fg'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
