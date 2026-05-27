import type { JSX } from 'preact';
import { cn } from '~/lib/cn';

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  mono?: boolean;
}

export function Input({ label, error, hint, mono, class: cls, className, ...rest }: Props) {
  return (
    <label class="block">
      {label && (
        <span class="block text-2xs font-mono uppercase tracking-wider text-ap-muted mb-1">{label}</span>
      )}
      <input
        class={cn(
          'w-full h-8 rounded-md border border-ap-border bg-ap-surface px-2.5 text-sm text-ap-fg',
          'placeholder:text-ap-subtle',
          'focus:border-ap-brand focus:outline-none transition-colors',
          error && 'border-ap-danger',
          mono && 'font-mono',
          cls as string, className as string,
        )}
        {...rest}
      />
      {error && <span class="block text-2xs text-ap-danger mt-1">{error}</span>}
      {!error && hint && <span class="block text-2xs text-ap-muted mt-1">{hint}</span>}
    </label>
  );
}
