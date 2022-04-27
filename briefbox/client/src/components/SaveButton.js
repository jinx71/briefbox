import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import useSaved from '../hooks/useSaved';

const SaveButton = ({ story, compact = false }) => {
  const { isAuthenticated } = useAuth();
  const { isSaved, save, unsave, pending } = useSaved();
  const navigate = useNavigate();

  const hnId = story.id;
  const saved = isSaved(hnId);
  const isPending = pending.has(hnId);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Sign in to save stories');
      navigate('/login');
      return;
    }
    try {
      if (saved) {
        await unsave(hnId);
        toast.success('Removed from saved');
      } else {
        await save({
          hnId,
          title: story.title,
          url: story.url,
          by: story.by,
          score: story.score,
          descendants: story.descendants,
          time: story.time,
          type: story.type || 'story',
        });
        toast.success('Saved for later');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update saved');
    }
  };

  const label = saved ? 'Saved' : 'Save';
  const icon = saved ? '★' : '☆';

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-pressed={saved}
        title={saved ? 'Unsave' : 'Save'}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-base transition disabled:opacity-50 ${
          saved
            ? 'text-accent-600 hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-ink-800'
            : 'text-ink-400 hover:bg-ink-100 hover:text-accent-500 dark:hover:bg-ink-800'
        }`}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        saved
          ? 'bg-accent-100 text-accent-700 hover:bg-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:hover:bg-accent-900/60'
          : 'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700'
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default SaveButton;
