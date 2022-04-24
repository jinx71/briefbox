import React from 'react';

const ErrorState = ({ title = 'Something went sideways', message, onRetry }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
    <div className="flex items-start gap-3">
      <div className="text-2xl" aria-hidden>⚠️</div>
      <div className="flex-1">
        <h3 className="font-display font-semibold">{title}</h3>
        {message ? <p className="mt-1 text-sm opacity-90">{message}</p> : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100 dark:hover:bg-red-900/60"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  </div>
);

export default ErrorState;
