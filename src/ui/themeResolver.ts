import type { GlobalSettings } from '~/storage/schema';

export type ThemeSetting = GlobalSettings['theme'];

/**
 * Pure resolver: given the user's theme preference and whether the system
 * currently prefers dark, returns whether dark mode should be active.
 */
export function resolveEffectiveTheme(theme: ThemeSetting, systemPrefersDark: boolean): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return systemPrefersDark;
}
