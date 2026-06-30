import React from 'react';
import useTheme from '../hooks/useTheme';

const options = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'Auto', icon: '🖥️' },
];

const ThemeToggle = () => {
  const { preference, setPreference } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1 text-xs shadow-soft dark:border-ink-700 dark:bg-ink-900"
    >
      {options.map((opt) => {
        const active = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(opt.value)}
            title={opt.label}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${
              active
                ? 'bg-accent-500 text-white shadow'
                : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
            }`}
          >
            <span aria-hidden>{opt.icon}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
