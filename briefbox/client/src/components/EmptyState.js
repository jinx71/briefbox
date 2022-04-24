import React from 'react';

const EmptyState = ({ icon = '📭', title, body, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white/40 p-10 text-center dark:border-ink-700 dark:bg-ink-900/40">
    <div className="text-4xl">{icon}</div>
    <h3 className="mt-3 font-display text-lg text-ink-900 dark:text-ink-100">{title}</h3>
    {body ? <p className="mt-1 max-w-md text-sm text-ink-600 dark:text-ink-400">{body}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
