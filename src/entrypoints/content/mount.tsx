import { render, type ComponentChild } from 'preact';
import themeCss from '~/ui/theme.css?inline';

const HOST_ID = 'browsertranslate-host';

export interface MountedShadow {
  root: ShadowRoot;
  unmount: () => void;
  render: (node: ComponentChild) => void;
}

export function createShadowMount(): MountedShadow {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.cssText = 'all:initial;position:fixed;top:0;left:0;z-index:2147483647;';
    document.documentElement.appendChild(host);
  }
  let root = host.shadowRoot;
  if (!root) {
    root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = themeCss;
    root.appendChild(style);
    const container = document.createElement('div');
    container.id = 'bt-root';
    root.appendChild(container);
  }
  const container = root.querySelector('#bt-root') as HTMLElement;
  return {
    root,
    unmount: () => render(null, container),
    render: (node: ComponentChild) => render(node, container),
  };
}
