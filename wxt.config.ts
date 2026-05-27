import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';

export default defineConfig({
  srcDir: 'src',
  vite: () => ({
    plugins: [preact()],
  }),
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['storage', 'activeTab', 'contextMenus', 'alarms'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
    action: {
      default_title: 'BrowserTranslate',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
        48: 'icon/48.png',
      },
    },
    commands: {
      'translate-selection': {
        suggested_key: { default: 'Alt+T' },
        description: 'Translate the current selection',
      },
    },
    web_accessible_resources: [
      {
        resources: ['fonts/*'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
