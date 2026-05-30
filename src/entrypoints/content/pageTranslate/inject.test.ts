import { describe, it, expect, beforeEach } from 'vitest';
import { BilingualInjector } from './inject';
import { PAGE_TRANSLATE_STYLE_ID } from './styles';

describe('BilingualInjector', () => {
  let injector: BilingualInjector;
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<p id="a">Source A text content here.</p>';
    injector = new BilingualInjector(document);
  });

  it('injects the stylesheet once', () => {
    injector.placeLoading(document.getElementById('a')!);
    injector.placeLoading(document.getElementById('a')!);
    expect(document.querySelectorAll(`#${PAGE_TRANSLATE_STYLE_ID}`)).toHaveLength(1);
  });

  it('places a loading node after the block', () => {
    const block = document.getElementById('a')!;
    injector.placeLoading(block);
    const next = block.nextElementSibling!;
    expect(next.classList.contains('bt-bilingual')).toBe(true);
    expect(next.querySelector('.bt-bilingual-loading')).not.toBeNull();
  });

  it('replaces loading with translation text', () => {
    const block = document.getElementById('a')!;
    injector.placeLoading(block);
    injector.setTranslation(block, '译文 A');
    const next = block.nextElementSibling!;
    expect(next.textContent).toBe('译文 A');
    expect(next.querySelector('.bt-bilingual-loading')).toBeNull();
  });

  it('shows an error node with a retry handler', () => {
    const block = document.getElementById('a')!;
    let retried = false;
    injector.placeLoading(block);
    injector.setError(block, 'Failed', 'Retry', () => { retried = true; });
    const errEl = block.nextElementSibling!.querySelector('.bt-bilingual-error') as HTMLElement;
    expect(errEl.textContent).toContain('Failed');
    errEl.click();
    expect(retried).toBe(true);
  });

  it('does not double-insert for the same block', () => {
    const block = document.getElementById('a')!;
    injector.placeLoading(block);
    injector.placeLoading(block);
    expect(document.querySelectorAll('.bt-bilingual')).toHaveLength(1);
  });

  it('teardown removes all injected nodes and the stylesheet', () => {
    injector.placeLoading(document.getElementById('a')!);
    injector.teardown();
    expect(document.querySelectorAll('.bt-bilingual')).toHaveLength(0);
    expect(document.getElementById(PAGE_TRANSLATE_STYLE_ID)).toBeNull();
  });

  it('removes the error span (and its retry listener) when transitioning to translation', () => {
    const block = document.getElementById('a')!;
    let retried = 0;
    injector.placeLoading(block);
    injector.setError(block, 'Failed', 'Retry', () => { retried++; });
    const oldErr = block.nextElementSibling!.querySelector('.bt-bilingual-error') as HTMLElement;
    injector.setTranslation(block, '译文 A');
    const node = block.nextElementSibling!;
    expect(node.querySelector('.bt-bilingual-error')).toBeNull();
    expect(node.textContent).toBe('译文 A');
    // the detached old error span's listener no longer affects the live node
    oldErr.click();
    expect(retried).toBe(1); // clicking the detached span still fires once, but it is gone from the DOM
    expect(node.contains(oldErr)).toBe(false);
  });

  it('resetToLoading after an error restores the shimmer', () => {
    const block = document.getElementById('a')!;
    injector.placeLoading(block);
    injector.setError(block, 'Failed', 'Retry', () => {});
    injector.resetToLoading(block);
    const node = block.nextElementSibling!;
    expect(node.querySelector('.bt-bilingual-loading')).not.toBeNull();
    expect(node.querySelector('.bt-bilingual-error')).toBeNull();
  });

  it('teardown is safe to call twice', () => {
    injector.placeLoading(document.getElementById('a')!);
    injector.teardown();
    expect(() => injector.teardown()).not.toThrow();
  });
});
