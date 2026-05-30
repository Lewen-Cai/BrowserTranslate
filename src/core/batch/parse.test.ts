import { describe, it, expect } from 'vitest';
import { parseBatchArray } from './parse';

describe('parseBatchArray', () => {
  it('parses a clean JSON array of the expected length', () => {
    expect(parseBatchArray('["a","b","c"]', 3)).toEqual(['a', 'b', 'c']);
  });
  it('extracts the array when wrapped in prose / code fences', () => {
    const raw = 'Sure:\n```json\n["x", "y"]\n```';
    expect(parseBatchArray(raw, 2)).toEqual(['x', 'y']);
  });
  it('returns null on length mismatch', () => {
    expect(parseBatchArray('["only one"]', 2)).toBeNull();
  });
  it('returns null when not an array', () => {
    expect(parseBatchArray('{"a":1}', 1)).toBeNull();
  });
  it('returns null on unparseable input', () => {
    expect(parseBatchArray('not json at all', 1)).toBeNull();
  });
  it('coerces non-string elements to strings', () => {
    expect(parseBatchArray('["a", 2]', 2)).toEqual(['a', '2']);
  });
  it('trims trailing prose after the array', () => {
    expect(parseBatchArray('["a","b"] done!', 2)).toEqual(['a', 'b']);
  });
  it('returns null when trailing prose contains a stray bracket', () => {
    expect(parseBatchArray('["a","b"]\nNote: see item [2]', 2)).toBeNull();
  });
});
