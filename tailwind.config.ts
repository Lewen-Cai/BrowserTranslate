import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  'rgb(239 246 255)',
          100: 'rgb(219 234 254)',
          200: 'rgb(191 219 254)',
          500: 'rgb(59 130 246)',
          600: 'rgb(37 99 235)',
          700: 'rgb(29 78 216)',
          800: 'rgb(30 64 175)',
          900: 'rgb(30 58 138)',
        },
        // Apparatus semantic tokens — usable as bg-ap, text-ap-muted etc.
        ap: {
          DEFAULT: 'rgb(var(--ap-fg) / <alpha-value>)',
          bg:      'rgb(var(--ap-bg) / <alpha-value>)',
          surface: 'rgb(var(--ap-surface) / <alpha-value>)',
          fg:      'rgb(var(--ap-fg) / <alpha-value>)',
          muted:   'rgb(var(--ap-fg-muted) / <alpha-value>)',
          subtle:  'rgb(var(--ap-fg-subtle) / <alpha-value>)',
          border:  'rgb(var(--ap-border) / <alpha-value>)',
          'border-strong': 'rgb(var(--ap-border-strong) / <alpha-value>)',
          brand:   'rgb(var(--ap-brand) / <alpha-value>)',
          'brand-fg': 'rgb(var(--ap-brand-fg) / <alpha-value>)',
          'brand-soft': 'rgb(var(--ap-brand-soft) / <alpha-value>)',
          danger:  'rgb(var(--ap-danger) / <alpha-value>)',
          success: 'rgb(var(--ap-success) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
      },
      letterSpacing: {
        wider: '0.08em',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} satisfies Config;
