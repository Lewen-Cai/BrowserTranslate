import { describe, it, expect, afterEach } from 'vitest';
import { computeIconPosition, ICON_SIZE } from './TriggerIcon';

/** Build a minimal DOMRect — computeIconPosition only reads top/right. */
function rect(top: number, right: number): DOMRect {
  return { top, right, left: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
}

function setViewport({ scrollX = 0, scrollY = 0, innerWidth = 1024 }: { scrollX?: number; scrollY?: number; innerWidth?: number }) {
  Object.defineProperty(window, 'scrollX', { value: scrollX, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true });
}

afterEach(() => setViewport({ scrollX: 0, scrollY: 0, innerWidth: 1024 }));

describe('computeIconPosition', () => {
  it('hangs above the selection top-right corner when there is room', () => {
    setViewport({});
    const { top, left } = computeIconPosition(rect(300, 400));
    expect(top).toBe(300 - ICON_SIZE - 4); // 274
    expect(left).toBe(400 - ICON_SIZE); // 378
  });

  it('returns DOCUMENT-space coordinates — scroll offset is included', () => {
    // Same on-screen selection (viewport top=300) but the page is scrolled 500px.
    // The returned coords must include the scroll, i.e. be document-relative.
    // This is the contract the shadow host must honour: it has to be anchored to
    // the document (position:absolute), NOT the viewport (position:fixed), or the
    // icon renders `scrollY` px too low and falls off-screen. See mount.test.ts.
    setViewport({ scrollY: 500, scrollX: 0 });
    const { top } = computeIconPosition(rect(300, 400));
    expect(top).toBe(300 + 500 - ICON_SIZE - 4); // 774, not 274
  });

  it('drops to the right when the icon would clip above the viewport top', () => {
    setViewport({});
    const { top, left } = computeIconPosition(rect(10, 400));
    expect(top).toBe(10); // sits at selection top instead of above it
    expect(left).toBe(400 + 4); // GAP to the right
  });

  it('clamps within the viewport horizontally', () => {
    setViewport({ innerWidth: 1024 });
    const { left } = computeIconPosition(rect(300, 1024));
    expect(left).toBe(1024 - ICON_SIZE - 4); // maxLeft = 998
  });
});
