import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as savedApi from '../api/saved';
import { AuthContext } from './AuthContext';

export const SavedContext = createContext({
  savedIds: new Set(),
  refresh: async () => {},
  save: async () => {},
  unsave: async () => {},
  isSaved: () => false,
  pending: new Set(),
});

export const SavedProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [savedIds, setSavedIds] = useState(new Set());
  const [pending, setPending] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedIds(new Set());
      return;
    }
    try {
      const ids = await savedApi.listSavedIds();
      setSavedIds(new Set(ids || []));
    } catch (_err) {
      // Keep what we had; non-fatal
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setPendingFor = (hnId, on) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (on) next.add(hnId);
      else next.delete(hnId);
      return next;
    });
  };

  const save = useCallback(async (item) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    setPendingFor(item.hnId, true);
    // Optimistic
    setSavedIds((prev) => new Set(prev).add(item.hnId));
    try {
      await savedApi.saveItem(item);
    } catch (err) {
      // Rollback on failure (unless it's a 409 — already saved)
      const status = err.response?.status;
      if (status !== 409) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.hnId);
          return next;
        });
        throw err;
      }
    } finally {
      setPendingFor(item.hnId, false);
    }
  }, [isAuthenticated]);

  const unsave = useCallback(async (hnId) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    setPendingFor(hnId, true);
    // Optimistic
    const prevSet = savedIds;
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(hnId);
      return next;
    });
    try {
      await savedApi.unsaveItem(hnId);
    } catch (err) {
      setSavedIds(prevSet); // rollback
      throw err;
    } finally {
      setPendingFor(hnId, false);
    }
  }, [isAuthenticated, savedIds]);

  const isSaved = useCallback((hnId) => savedIds.has(hnId), [savedIds]);

  const value = useMemo(
    () => ({ savedIds, refresh, save, unsave, isSaved, pending }),
    [savedIds, refresh, save, unsave, isSaved, pending]
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
};
