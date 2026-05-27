import { useEffect } from 'preact/hooks';
import { useAppStore } from '~/storage/store';

/**
 * Watches settings.theme and toggles the `dark` class on <html>.
 * 'auto' follows the system color scheme via prefers-color-scheme.
 * Use this hook once per Preact root (popup, options).
 */
export function useApplyTheme(): void {
  const theme = useAppStore((s) => s.data.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (theme === 'dark') {
      apply(true);
      return;
    }
    if (theme === 'light') {
      apply(false);
      return;
    }

    // 'auto' — follow system, watch for changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mql.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, [theme]);
}
