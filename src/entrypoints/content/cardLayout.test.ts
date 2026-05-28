import { describe, it, expect, afterEach } from 'vitest';
import { computeCardVerticalLayout } from './cardLayout';

function rect(top: number, right: number): DOMRect {
  return { top, right, left: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
}

function setViewport({ scrollY = 0, innerHeight = 800, innerWidth = 1024 }: { scrollY?: number; innerHeight?: number; innerWidth?: number }) {
  Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true });
}

afterEach(() => setViewport({}));

describe('computeCardVerticalLayout', () => {
  it('drops below the icon and caps height to the viewport for a mid-page selection', () => {
    setViewport({ innerHeight: 800 });
    const { top, maxHeight } = computeCardVerticalLayout(rect(200, 400));
    expect(top).toBe(198); // iconBottom(196) + 2
    expect(maxHeight).toBe(594); // 800 - 198 - 8 margin
  });

  it('pulls the card up so it stays on-screen when the selection is near the bottom', () => {
    setViewport({ innerHeight: 800 });
    const { top, maxHeight } = computeCardVerticalLayout(rect(770, 400));
    expect(top).toBe(672); // clamped to innerHeight - MIN_HEIGHT(120) - MARGIN(8)
    expect(maxHeight).toBe(120); // never smaller than MIN_HEIGHT
  });

  it('returns a DOCUMENT-space top (scroll included) while bounding height to the viewport', () => {
    setViewport({ innerHeight: 800, scrollY: 1000 });
    const { top, maxHeight } = computeCardVerticalLayout(rect(200, 400));
    expect(top).toBe(1198); // 198 viewport + 1000 scroll
    expect(maxHeight).toBe(594); // height stays viewport-bounded regardless of scroll
  });
});
