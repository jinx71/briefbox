import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'briefbox-theme';

// Resolve the *effective* theme (light or dark) for a stored preference.
const resolveEffective = (pref) => {
  if (pref === 'dark' || pref === 'light') return pref;
  // 'system' or unset
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readInitial = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch (_e) {
    /* ignore */
  }
  return 'system';
};

export const ThemeContext = createContext({
  preference: 'system',
  effective: 'light',
  setPreference: () => {},
  toggle: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [preference, setPreferenceState] = useState(readInitial);
  const [effective, setEffective] = useState(() => resolveEffective(readInitial()));

  // Apply effective theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (effective === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [effective]);

  // Persist preference + recompute effective when preference changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch (_e) {
      /* ignore */
    }
    setEffective(resolveEffective(preference));
  }, [preference]);

  // If preference is 'system', listen for OS changes
  useEffect(() => {
    if (preference !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setEffective(e.matches ? 'dark' : 'light');
    // Older Safari uses addListener
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [preference]);

  const setPreference = useCallback((value) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setPreferenceState(value);
    }
  }, []);

  const toggle = useCallback(() => {
    setPreferenceState((curr) => {
      const current = resolveEffective(curr);
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ preference, effective, setPreference, toggle }),
    [preference, effective, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
