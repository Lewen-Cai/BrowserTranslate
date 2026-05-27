/**
 * Single-pass variable substitution. {{name}} → vars[name] || ''.
 * Single-pass ensures user-provided text with {{ }} is not re-rendered.
 */
export function renderPrompt(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? '');
}
