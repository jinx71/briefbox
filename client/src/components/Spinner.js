import React from 'react';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

const Spinner = ({ size = 'md', label }) => (
  <div
    role="status"
    aria-label={label || 'Loading'}
    className="inline-flex items-center gap-3 text-ink-500 dark:text-ink-400"
  >
    <span
      className={`${sizes[size] || sizes.md} animate-spin rounded-full border-ink-300 border-t-accent-500 dark:border-ink-700 dark:border-t-accent-400`}
    />
    {label ? <span className="text-sm">{label}</span> : null}
  </div>
);

export default Spinner;
