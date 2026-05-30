import { describe, it, expect, vi } from 'vitest';
import { runBatch, type BatchDeps } from './runBatch';

function deps(over: Partial<BatchDeps>): BatchDeps {
  return {
    cacheGet: async () => undefined,
    cacheSet: async () => {},
    translateOnce: async (segs) => ({ parsed: segs.map((s) => `T(${s})`), raw: '' }),
    ...over,
  };
}

describe('runBatch', () => {
  it('translates all segments when nothing is cached', async () => {
    const out = await runBatch(['a', 'b'], deps({}));
    expect(out).toEqual(['T(a)', 'T(b)']);
  });

  it('returns an empty array and never calls the provider for no segments', async () => {
    const translateOnce = vi.fn(async (segs: string[]) => ({
      parsed: segs.map((s) => `T(${s})`), raw: '',
    }));
    const out = await runBatch([], deps({ translateOnce }));
    expect(out).toEqual([]);
    expect(translateOnce).not.toHaveBeenCalled();
  });

  it('never calls the provider when every segment is cached', async () => {
    const translateOnce = vi.fn(async (segs: string[]) => ({
      parsed: segs.map((s) => `T(${s})`), raw: '',
    }));
    const out = await runBatch(['a', 'b'], deps({
      cacheGet: async (s) => `HIT(${s})`,
      translateOnce,
    }));
    expect(out).toEqual(['HIT(a)', 'HIT(b)']);
    expect(translateOnce).not.toHaveBeenCalled();
  });

  it('returns cached values and only translates misses', async () => {
    const translateOnce = vi.fn(async (segs: string[]) => ({
      parsed: segs.map((s) => `T(${s})`), raw: '',
    }));
    const out = await runBatch(['a', 'b', 'c'], deps({
      cacheGet: async (s) => (s === 'b' ? 'CACHED' : undefined),
      translateOnce,
    }));
    expect(out).toEqual(['T(a)', 'CACHED', 'T(c)']);
    expect(translateOnce).toHaveBeenCalledWith(['a', 'c']);
  });

  it('writes fresh translations to cache', async () => {
    const cacheSet = vi.fn(async () => {});
    await runBatch(['a'], deps({ cacheSet }));
    expect(cacheSet).toHaveBeenCalledWith('a', 'T(a)');
  });

  it('falls back to single-segment when the batch misaligns', async () => {
    const translateOnce = vi.fn(async (segs: string[]) => {
      if (segs.length > 1) return { parsed: null, raw: '' };
      return { parsed: [`S(${segs[0]})`], raw: '' };
    });
    const out = await runBatch(['a', 'b'], deps({ translateOnce }));
    expect(out).toEqual(['S(a)', 'S(b)']);
  });

  it('uses raw content when a single segment cannot be parsed', async () => {
    const translateOnce = vi.fn(async (segs: string[]) => {
      if (segs.length > 1) return { parsed: null, raw: '' };
      return { parsed: null, raw: `  RAW(${segs[0]})  ` };
    });
    const out = await runBatch(['a', 'b'], deps({ translateOnce }));
    expect(out).toEqual(['RAW(a)', 'RAW(b)']);
  });
});
