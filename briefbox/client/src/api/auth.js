import client, { unwrap } from './client';

export const register = async ({ username, email, password }) => {
  const res = await client.post('/auth/register', { username, email, password });
  return unwrap(res);
};

export const login = async ({ email, password }) => {
  const res = await client.post('/auth/login', { email, password });
  return unwrap(res);
};

export const me = async () => {
  const res = await client.get('/auth/me');
  return unwrap(res);
};
