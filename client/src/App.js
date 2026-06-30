import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Feed from './pages/Feed';
import StoryDetail from './pages/StoryDetail';
import Saved from './pages/Saved';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const App = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="container-narrow py-6">
      <Routes>
        <Route path="/" element={<Feed feed="top" />} />
        <Route path="/best" element={<Feed feed="best" />} />
        <Route path="/new" element={<Feed feed="new" />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </main>
    <footer className="container-narrow border-t border-ink-200/60 py-6 text-center text-xs text-ink-500 dark:border-ink-800 dark:text-ink-500">
      Data from Hacker News · Cached server-side · Built on the MERN stack
    </footer>
  </div>
);

export default App;
