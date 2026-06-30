import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import * as hn from '../api/hn';
import StoryCard from '../components/StoryCard';
import { FeedSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Spinner from '../components/Spinner';

const TITLE_BY_FEED = {
  top: 'Top stories',
  best: 'Best stories',
  new: 'New stories',
};

const TAGLINE_BY_FEED = {
  top: 'What the front page looks like right now.',
  best: 'High-signal stories from the last few days.',
  new: 'Freshly submitted — unfiltered firehose.',
};

const PER_PAGE = 20;

const Feed = ({ feed }) => {
  const [showMockNote, setShowMockNote] = useState(false);

  const query = useInfiniteQuery(
    ['feed', feed],
    async ({ pageParam = 1 }) => hn.getFeed(feed, { page: pageParam, perPage: PER_PAGE }),
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;
        const loaded = lastPage.page * lastPage.perPage;
        return loaded < lastPage.total ? lastPage.page + 1 : undefined;
      },
      keepPreviousData: true,
    }
  );

  const { data, error, isLoading, isFetching, fetchNextPage, hasNextPage, refetch } = query;

  const stories = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.stories || []);
  }, [data]);

  useEffect(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    setShowMockNote(Boolean(lastPage?.mock));
  }, [data]);

  return (
    <section aria-labelledby="feed-heading" className="space-y-5">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 id="feed-heading" className="font-display text-2xl font-bold sm:text-3xl">
            {TITLE_BY_FEED[feed] || 'Stories'}
          </h1>
          {showMockNote ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200">
              · mock fallback
            </span>
          ) : null}
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-400">{TAGLINE_BY_FEED[feed]}</p>
      </header>

      {isLoading ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Couldn't load the feed"
          message={error.message || 'Try again in a moment.'}
          onRetry={refetch}
        />
      ) : stories.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Nothing here yet"
          body="The feed came back empty. Check back shortly."
        />
      ) : (
        <ol className="space-y-3">
          {stories.map((story, i) => (
            <li key={story.id}>
              <StoryCard story={story} rank={i + 1} />
            </li>
          ))}
        </ol>
      )}

      {!isLoading && stories.length > 0 ? (
        <div className="flex items-center justify-center pt-2">
          {hasNextPage ? (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetching}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 shadow-soft transition hover:border-accent-300 hover:bg-orange-50 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-700 dark:hover:bg-ink-800"
            >
              {isFetching ? <Spinner size="sm" label="Loading…" /> : 'Load more stories'}
            </button>
          ) : (
            <p className="text-xs text-ink-500 dark:text-ink-500">You've reached the end of the feed.</p>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default Feed;
