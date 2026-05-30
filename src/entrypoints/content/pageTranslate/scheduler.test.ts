import { describe, it, expect } from 'vitest';
import { groupIntoBatches } from './scheduler';

describe('groupIntoBatches', () => {
  it('groups by max segment count', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const batches = groupIntoBatches(items, (s) => s.length, { maxSegments: 2, maxChars: 1000 });
    expect(batches).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
  });

  it('starts a new batch when the char budget is exceeded', () => {
    const items = ['aaaa', 'bbbb', 'cc'];
    const batches = groupIntoBatches(items, (s) => s.length, { maxSegments: 10, maxChars: 8 });
    expect(batches).toEqual([['aaaa', 'bbbb'], ['cc']]);
  });

  it('keeps a single oversized item in its own batch', () => {
    const items = ['x'.repeat(50), 'y'];
    const batches = groupIntoBatches(items, (s) => s.length, { maxSegments: 10, maxChars: 8 });
    expect(batches).toEqual([['x'.repeat(50)], ['y']]);
  });

  it('returns no batches for an empty list', () => {
    expect(groupIntoBatches([], () => 1, { maxSegments: 5, maxChars: 100 })).toEqual([]);
  });
});
