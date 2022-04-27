import React from 'react';

export const SkeletonLine = ({ className = '' }) => (
  <div className={`h-3 animate-pulse rounded bg-ink-200 dark:bg-ink-800 ${className}`} />
);

export const StoryCardSkeleton = () => (
  <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
    <SkeletonLine className="w-2/3" />
    <SkeletonLine className="mt-3 w-full" />
    <SkeletonLine className="mt-2 w-5/6" />
    <div className="mt-4 flex gap-3">
      <SkeletonLine className="w-16" />
      <SkeletonLine className="w-12" />
      <SkeletonLine className="w-20" />
    </div>
  </div>
);

export const FeedSkeleton = ({ count = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <StoryCardSkeleton key={i} />
    ))}
  </div>
);
