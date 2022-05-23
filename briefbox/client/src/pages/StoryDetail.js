import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import * as hn from '../api/hn';
import Comment from '../components/Comment';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SaveButton from '../components/SaveButton';
import CacheBadge from '../components/CacheBadge';
import { timeAgo, formatDate, domainOf, pluralize } from '../utils/format';
import { sanitizeHnHtml } from '../utils/sanitize';

const StoryDetail = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery(['story', id], () => hn.getStory(id), {
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" label="Loading story…" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load this story"
        message={error.message || 'Try again in a moment.'}
        onRetry={refetch}
      />
    );
  }

  const story = data?.story;
  if (!story) {
    return (
      <EmptyState
        icon="🔎"
        title="Story not found"
        body="It may have been removed by Hacker News."
        action={
          <Link
            to="/"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white no-underline"
          >
            Back to top stories
          </Link>
        }
      />
    );
  }

  const replies = Array.isArray(story.replies) ? story.replies : [];
  const domain = domainOf(story.url);

  return (
    <article className="space-y-6">
      <header className="space-y-3 rounded-2xl border border-ink-200/60 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="text-xs font-medium text-ink-600 no-underline hover:text-accent-600 dark:text-ink-400"
          >
            ← Back to feed
          </Link>
          <div className="flex items-center gap-2">
            <CacheBadge cache={data?.cache} source={data?.source} />
            {isFetching ? <Spinner size="sm" /> : null}
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
          {story.url ? (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-900 no-underline hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
            >
              {story.title}
            </a>
          ) : (
            <span className="text-ink-900 dark:text-ink-100">{story.title}</span>
          )}
        </h1>

        {domain ? (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs text-ink-500 hover:underline dark:text-ink-400"
          >
            {domain}
          </a>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600 dark:text-ink-400">
          <span className="font-medium text-accent-600 dark:text-accent-300">
            ▲ {story.score ?? 0}
          </span>
          {story.by ? (
            <span>
              by <span className="font-medium text-ink-800 dark:text-ink-200">{story.by}</span>
            </span>
          ) : null}
          <span title={formatDate(story.time)}>{timeAgo(story.time)}</span>
          <span>· {pluralize(story.descendants ?? 0, 'comment')}</span>
          <span className="ml-auto">
            <SaveButton story={story} />
          </span>
        </div>

        {story.text ? (
          <div
            className="hn-content border-t border-ink-200/60 pt-4 text-[15px] leading-relaxed text-ink-800 dark:border-ink-800 dark:text-ink-200"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizeHnHtml(story.text) }}
          />
        ) : null}
      </header>

      <section aria-labelledby="comments-heading" className="space-y-4">
        <h2 id="comments-heading" className="font-display text-lg font-semibold">
          {replies.length > 0
            ? `Discussion · ${pluralize(replies.length, 'top-level reply', 'top-level replies')}`
            : 'Discussion'}
        </h2>

        {replies.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No comments yet"
            body="Be the first thought is, sadly, not a feature here."
          />
        ) : (
          <div className="space-y-4">
            {replies.map((c) => (
              <Comment key={c.id} comment={c} depth={0} autoCollapseDeep />
            ))}
          </div>
        )}
      </section>
    </article>
  );
};

export default StoryDetail;
