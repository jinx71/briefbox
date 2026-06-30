import client, { unwrap } from './client';

export const listSaved = async () => {
  const res = await client.get('/saved');
  return unwrap(res);
};

export const listSavedIds = async () => {
  const res = await client.get('/saved/ids');
  return unwrap(res);
};

export const saveItem = async (item) => {
  const res = await client.post('/saved', item);
  return unwrap(res);
};

export const unsaveItem = async (hnId) => {
  const res = await client.delete(`/saved/${hnId}`);
  return unwrap(res);
};
