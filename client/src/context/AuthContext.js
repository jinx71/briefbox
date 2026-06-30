import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const TOKEN_KEY = 'briefbox-token';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (_e) {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount + whenever token changes, try to load /me
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch (_err) {
        if (!cancelled) {
          setUser(null);
          // Token is invalid — clear it
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch (_e) {
            /* ignore */
          }
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    probe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistToken = (t) => {
    try {
      // NOTE: localStorage chosen for portfolio simplicity. httpOnly cookies
      // are the more secure production choice (immune to XSS exfiltration).
      localStorage.setItem(TOKEN_KEY, t);
    } catch (_e) {
      /* ignore */
    }
    setToken(t);
  };

  const login = useCallback(async ({ email, password }) => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    persistToken(result.token);
    return result.user;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const result = await authApi.register({ username, email, password });
    setUser(result.user);
    persistToken(result.token);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (_e) {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
