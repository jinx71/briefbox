import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as savedApi from '../api/saved';
import StoryCard from '../components/StoryCard';
import { FeedSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import useSaved from '../hooks/useSaved';

const Saved = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { savedIds, refresh } = useSaved();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await savedApi.listSaved();
      setItems(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load saved stories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Re-filter the on-screen list when the user unsaves something via SaveButton.
  useEffect(() => {
    setItems((prev) => prev.filter((it) => savedIds.has(it.hnId)));
  }, [savedIds]);

  const onRetry = async () => {
    await refresh();
    await load();
    toast.info('Refreshed');
  };

  // SavedItem documents → shape the StoryCard expects (uses `id`, not `hnId`).
  const asStory = (it) => ({
    id: it.hnId,
    title: it.title,
    url: it.url,
    by: it.by,
    score: it.score,
    descendants: it.descendants,
    time: it.time,
    type: it.type,
  });

  return (
    <section aria-labelledby="saved-heading" className="space-y-5">
      <header className="space-y-1">
        <h1 id="saved-heading" className="font-display text-2xl font-bold sm:text-3xl">
          Saved for later
        </h1>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Stories you've bookmarked from the feed.
        </p>
      </header>

      {loading ? (
        <FeedSkeleton count={4} />
      ) : error ? (
        <ErrorState title="Couldn't load your saved stories" message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No saved stories yet"
          body="Tap the star on any story in the feed to keep it here for later."
          action={
            <Link
              to="/"
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white no-underline"
            >
              Browse top stories
            </Link>
          }
        />
      ) : (
        <ol className="space-y-3">
          {items.map((it, i) => (
            <li key={it._id || it.hnId}>
              <StoryCard story={asStory(it)} rank={i + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default Saved;
