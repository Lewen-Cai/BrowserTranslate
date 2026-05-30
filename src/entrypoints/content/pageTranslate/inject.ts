import { PAGE_TRANSLATE_CSS, PAGE_TRANSLATE_STYLE_ID } from './styles';

/**
 * Inserts and manages the bilingual translation nodes in the page DOM. One node
 * per source block, tracked in a Map for clean teardown.
 */
export class BilingualInjector {
  private nodes = new Map<HTMLElement, HTMLElement>();
  private styleInjected = false;

  constructor(private readonly doc: Document) {}

  private ensureStyles(): void {
    if (this.styleInjected || this.doc.getElementById(PAGE_TRANSLATE_STYLE_ID)) {
      this.styleInjected = true;
      return;
    }
    const style = this.doc.createElement('style');
    style.id = PAGE_TRANSLATE_STYLE_ID;
    style.textContent = PAGE_TRANSLATE_CSS;
    this.doc.head.appendChild(style);
    this.styleInjected = true;
  }

  has(block: HTMLElement): boolean {
    return this.nodes.has(block);
  }

  /** Insert a shimmer placeholder node right after `block`. Idempotent per block. */
  placeLoading(block: HTMLElement): void {
    this.ensureStyles();
    if (this.nodes.has(block)) return;
    const node = this.doc.createElement('div');
    node.className = 'bt-bilingual';
    const shimmer = this.doc.createElement('span');
    shimmer.className = 'bt-bilingual-loading';
    node.appendChild(shimmer);
    block.insertAdjacentElement('afterend', node);
    this.nodes.set(block, node);
  }

  setTranslation(block: HTMLElement, text: string): void {
    const node = this.nodes.get(block);
    if (!node) return;
    node.textContent = text;
  }

  setError(block: HTMLElement, message: string, retryLabel: string, onRetry: () => void): void {
    const node = this.nodes.get(block);
    if (!node) return;
    node.textContent = '';
    const err = this.doc.createElement('span');
    err.className = 'bt-bilingual-error';
    err.textContent = `${message} · ${retryLabel}`;
    err.addEventListener('click', onRetry);
    node.appendChild(err);
  }

  /** Reset a block back to loading (used by retry). */
  resetToLoading(block: HTMLElement): void {
    const node = this.nodes.get(block);
    if (!node) return;
    node.textContent = '';
    const shimmer = this.doc.createElement('span');
    shimmer.className = 'bt-bilingual-loading';
    node.appendChild(shimmer);
  }

  teardown(): void {
    for (const node of this.nodes.values()) node.remove();
    this.nodes.clear();
    this.doc.getElementById(PAGE_TRANSLATE_STYLE_ID)?.remove();
    this.styleInjected = false;
  }
}
