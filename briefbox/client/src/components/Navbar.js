import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const tabClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-accent-500 text-white shadow'
      : 'text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
  }`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const onAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-orange-50/85 backdrop-blur dark:border-ink-800/80 dark:bg-ink-950/85">
      <div className="container-narrow flex h-14 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 text-ink-900 no-underline dark:text-ink-100">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent-500 font-display text-white shadow-soft">
            B
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold">BriefBox</div>
            <div className="-mt-0.5 hidden text-[10px] uppercase tracking-widest text-ink-500 sm:block dark:text-ink-400">
              tech news, cosier
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          <NavLink to="/" end className={tabClass}>Top</NavLink>
          <NavLink to="/best" className={tabClass}>Best</NavLink>
          <NavLink to="/new" className={tabClass}>New</NavLink>
          {isAuthenticated ? (
            <NavLink to="/saved" className={tabClass}>Saved</NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-ink-700 sm:inline dark:text-ink-300">
                @{user?.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-2.5 py-1.5 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                Logout
              </button>
            </div>
          ) : onAuthPage ? null : (
            <Link
              to="/login"
              className="rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-white no-underline shadow-soft transition hover:bg-accent-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      {/* Mobile tabs */}
      <nav className="container-narrow flex items-center gap-1 overflow-x-auto pb-2 sm:hidden" aria-label="Primary mobile">
        <NavLink to="/" end className={tabClass}>Top</NavLink>
        <NavLink to="/best" className={tabClass}>Best</NavLink>
        <NavLink to="/new" className={tabClass}>New</NavLink>
        {isAuthenticated ? (
          <NavLink to="/saved" className={tabClass}>Saved</NavLink>
        ) : null}
      </nav>
    </header>
  );
};

export default Navbar;
