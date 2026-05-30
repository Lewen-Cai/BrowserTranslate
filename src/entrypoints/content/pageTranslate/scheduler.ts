export interface BatchLimits {
  maxSegments: number;
  maxChars: number;
}

/**
 * Greedily group items into batches bounded by segment count and total size.
 * An item larger than `maxChars` on its own gets its own batch.
 */
export function groupIntoBatches<T>(
  items: T[],
  sizeOf: (item: T) => number,
  limits: BatchLimits,
): T[][] {
  const batches: T[][] = [];
  let current: T[] = [];
  let currentChars = 0;
  for (const item of items) {
    const size = sizeOf(item);
    const wouldExceed =
      current.length >= limits.maxSegments ||
      (current.length > 0 && currentChars + size > limits.maxChars);
    if (wouldExceed) {
      batches.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(item);
    currentChars += size;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}
