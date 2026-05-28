import { describe, it, expect, vi, afterEach } from 'vitest';

// theme.css?inline is a Vite-only import; stub it so the module loads in jsdom.
vi.mock('~/ui/theme.css?inline', () => ({ default: '' }));

import { createShadowMount } from './mount';

afterEach(() => {
  document.getElementById('browsertranslate-host')?.remove();
});

describe('createShadowMount host', () => {
  it('anchors the host to the DOCUMENT (position:absolute), not the viewport', () => {
    // The icon/card coordinates (computeIconPosition, card clamps) are computed
    // in document space — they add window.scrollX/scrollY. For those coordinates
    // to land correctly, the host that contains them must scroll WITH the page.
    // position:fixed anchors to the viewport, so on a scrolled page every child
    // renders `scrollY` px too low and disappears off-screen. Must be absolute.
    const mount = createShadowMount();
    const host = mount.root.host as HTMLElement;
    expect(host.style.position).toBe('absolute');
  });
});
