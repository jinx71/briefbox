import client, { unwrap } from './client';

export const getFeed = async (feed, { page = 1, perPage = 20 } = {}) => {
  const res = await client.get(`/hn/feed/${feed}`, { params: { page, perPage } });
  return unwrap(res);
};

export const getStory = async (id) => {
  const res = await client.get(`/hn/story/${id}`);
  return {
    story: unwrap(res),
    cache: res.headers['x-cache'] || null,
    source: res.headers['x-source'] || null,
  };
};

export const getItem = async (id) => {
  const res = await client.get(`/hn/item/${id}`);
  return unwrap(res);
};

export const getUser = async (username) => {
  const res = await client.get(`/hn/user/${username}`);
  return unwrap(res);
};
