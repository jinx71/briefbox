import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const NotFound = () => (
  <EmptyState
    icon="🗺️"
    title="Lost your way?"
    body="We couldn't find the page you were looking for."
    action={
      <Link
        to="/"
        className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white no-underline"
      >
        Back to top stories
      </Link>
    }
  />
);

export default NotFound;
