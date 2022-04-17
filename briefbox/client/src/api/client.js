import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('briefbox-token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on 401 — token expired or invalid
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      // Don't bounce if we're already on login page or hitting /me probe
      if (!path.startsWith('/login') && !err.config?.url?.endsWith('/auth/me')) {
        localStorage.removeItem('briefbox-token');
      }
    }
    return Promise.reject(err);
  }
);

export const unwrap = (res) => res.data?.data;
export const extractMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export default client;
