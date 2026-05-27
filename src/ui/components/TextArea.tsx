import type { JSX } from 'preact';
import { cn } from '~/lib/cn';

interface Props extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function TextArea({ label, hint, class: cls, className, rows = 4, ...rest }: Props) {
  return (
    <label class="block">
      {label && (
        <span class="block text-2xs font-mono uppercase tracking-wider text-ap-muted mb-1">{label}</span>
      )}
      <textarea
        rows={rows}
        class={cn(
          'w-full rounded-md border border-ap-border bg-ap-surface px-2.5 py-2 text-sm text-ap-fg font-mono',
          'placeholder:text-ap-subtle',
          'focus:border-ap-brand focus:outline-none transition-colors resize-y',
          cls as string, className as string,
        )}
        {...rest}
      />
      {hint && <span class="block text-2xs text-ap-muted mt-1">{hint}</span>}
    </label>
  );
}
