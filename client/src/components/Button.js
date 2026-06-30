import React from 'react';

const variants = {
  primary:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-300 dark:disabled:bg-accent-800',
  secondary:
    'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 dark:bg-ink-900 dark:text-ink-100 dark:border-ink-700 dark:hover:bg-ink-800',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
