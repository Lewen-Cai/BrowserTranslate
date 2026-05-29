/**
 * Typewriter pacing: given the currently revealed length and the target (received)
 * length, return the next revealed length. Eases out — advances a fraction of the
 * remaining gap (at least 2 chars) so it feels live, never lags far behind genuine
 * token streaming, and finishes a burst-delivered translation in roughly half a second.
 */
export function advanceReveal(currentLen: number, targetLen: number): number {
  if (currentLen >= targetLen) return targetLen;
  const step = Math.max(2, Math.ceil((targetLen - currentLen) / 6));
  return Math.min(targetLen, currentLen + step);
}
