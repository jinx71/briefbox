import React from 'react';

/**
 * Surfaces the server-side caching layer to the UI. Reads from the
 * `X-Cache` and `X-Source` headers the hnController sets.
 *
 *   HIT  = cache returned the result, no upstream call
 *   MISS = cache was empty, we fetched from Hacker News
 *   MOCK = upstream failed, deterministic fallback served
 */
const CacheBadge = ({ cache, source }) => {
  if (!cache && !source) return null;

  const isMock = source === 'mock';
  const isHit = !isMock && cache === 'HIT';

  const tone = isMock
    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/50'
    : isHit
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800/50'
    : 'bg-ink-100 text-ink-700 border-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:border-ink-700';

  const label = isMock ? 'mock' : isHit ? 'cache hit' : 'cache miss';
  const dot = isMock ? '●' : isHit ? '●' : '○';

  return (
    <span
      title={`X-Cache: ${cache || '—'} · X-Source: ${source || '—'}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tone}`}
    >
      <span aria-hidden>{dot}</span>
      {label}
    </span>
  );
};

export default CacheBadge;
