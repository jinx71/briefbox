import React from 'react';
import { Link } from 'react-router-dom';
import { timeAgo, domainOf, pluralize } from '../utils/format';
import SaveButton from './SaveButton';

const StoryCard = ({ story, rank }) => {
  if (!story) return null;
  const domain = domainOf(story.url);
  const isAsk = story.type === 'story' && !story.url;
  const isJob = story.type === 'job';

  return (
    <article className="group rounded-2xl border border-ink-200/60 bg-white p-4 shadow-soft transition hover:border-accent-200 hover:shadow-md dark:border-ink-800 dark:bg-ink-900 dark:hover:border-accent-700/60 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {rank ? (
          <div className="select-none font-display text-2xl font-bold leading-none text-ink-300 dark:text-ink-700 sm:text-3xl">
            {rank}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold leading-snug sm:text-lg">
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
              <Link
                to={`/story/${story.id}`}
                className="text-ink-900 no-underline hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
              >
                {story.title}
              </Link>
            )}
            {domain ? (
              <span className="ml-2 align-middle font-mono text-xs font-normal text-ink-500 dark:text-ink-400">
                ({domain})
              </span>
            ) : null}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600 dark:text-ink-400">
            {isJob ? (
              <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-200">
                hiring
              </span>
            ) : (
              <span className="font-medium text-accent-600 dark:text-accent-300">
                ▲ {story.score ?? 0}
              </span>
            )}
            {story.by ? (
              <span>
                by <span className="font-medium text-ink-700 dark:text-ink-300">{story.by}</span>
              </span>
            ) : null}
            <span>{timeAgo(story.time)}</span>
            <Link
              to={`/story/${story.id}`}
              className="text-ink-600 underline-offset-2 hover:underline dark:text-ink-300"
            >
              {pluralize(story.descendants ?? 0, 'comment')}
            </Link>
            {isAsk ? (
              <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                ask
              </span>
            ) : null}
            <span className="ml-auto">
              <SaveButton story={story} compact />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default StoryCard;
