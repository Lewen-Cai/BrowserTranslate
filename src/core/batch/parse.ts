/**
 * Leniently extract a JSON array of `expectedCount` strings from a model
 * response. Tolerates surrounding prose / code fences by slicing the first '['
 * to the last ']'. Returns null if it can't parse, isn't an array, or the length
 * doesn't match — the caller falls back to single-segment translation.
 */
export function parseBatchArray(raw: string, expectedCount: number): string[] | null {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  let arr: unknown;
  try {
    arr = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(arr) || arr.length !== expectedCount) return null;
  return arr.map((x) => (typeof x === 'string' ? x : String(x)));
}
