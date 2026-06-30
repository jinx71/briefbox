import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';
import './index.css';

// React Query 3 client — feeds and stories are good caching candidates.
// We disable refetchOnWindowFocus so the cache-headers story stays legible
// (the server-side cache is the star, not the client query cache).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SavedProvider>
            <BrowserRouter>
              <App />
              <ToastContainer
                position="bottom-right"
                autoClose={2500}
                hideProgressBar
                newestOnTop
                closeOnClick
                theme="colored"
              />
            </BrowserRouter>
          </SavedProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
