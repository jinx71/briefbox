import React, { useState } from 'react';
import { timeAgo, pluralize } from '../utils/format';
import { sanitizeHnHtml } from '../utils/sanitize';

/**
 * The headline engineering lesson for BriefBox lives here: a recursive
 * comment-tree renderer.
 *
 * Each Comment renders itself and then maps over `comment.replies`, returning
 * another <Comment depth={depth + 1}>. The server returns the tree already
 * structured (depth-bounded in hnService.js), so the client just walks it.
 *
 * Per-node UX:
 *   - Collapse/expand toggle (default expanded; auto-collapses deleted nodes)
 *   - Depth-based left border + indent gives the conversational shape
 *   - Author + timestamp metadata above the body
 *   - HN HTML is sanitized before injection (see utils/sanitize.js)
 */

// Cycle through six accent shades so deeply nested threads stay legible.
const DEPTH_BORDERS = [
  'border-accent-400 dark:border-accent-500',
  'border-amber-400 dark:border-amber-500',
  'border-sky-400 dark:border-sky-500',
  'border-emerald-400 dark:border-emerald-500',
  'border-violet-400 dark:border-violet-500',
  'border-rose-400 dark:border-rose-500',
];

const countDescendants = (node) => {
  if (!node || !Array.isArray(node.replies)) return 0;
  return node.replies.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
};

const Comment = ({ comment, depth = 0, autoCollapseDeep = false }) => {
  const initiallyCollapsed = autoCollapseDeep && depth >= 4;
  const [collapsed, setCollapsed] = useState(Boolean(initiallyCollapsed));

  if (!comment) return null;
  if (comment.deleted || comment.dead) {
    return (
      <div
        className={`pl-3 italic text-ink-400 dark:text-ink-500`}
        style={{ marginLeft: depth > 0 ? 0 : undefined }}
      >
        [comment removed]
      </div>
    );
  }

  const replyCount = countDescendants(comment);
  const borderClass = DEPTH_BORDERS[depth % DEPTH_BORDERS.length];

  return (
    <div
      className={`border-l-2 pl-3 sm:pl-4 ${borderClass}`}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-600 dark:text-ink-400">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="inline-flex h-5 w-5 items-center justify-center rounded border border-ink-200 bg-white text-ink-600 transition hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span aria-hidden className="text-[10px] leading-none">
            {collapsed ? '+' : '−'}
          </span>
        </button>
        <span className="font-medium text-ink-800 dark:text-ink-200">{comment.by || 'unknown'}</span>
        <span>· {timeAgo(comment.time)}</span>
        {collapsed && replyCount > 0 ? (
          <span className="text-ink-500 dark:text-ink-500">· {pluralize(replyCount, 'reply', 'replies')} hidden</span>
        ) : null}
      </header>

      {!collapsed ? (
        <>
          {comment.text ? (
            <div
              className="hn-content mt-1.5 text-sm leading-relaxed text-ink-800 dark:text-ink-200"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitizeHnHtml(comment.text) }}
            />
          ) : null}

          {Array.isArray(comment.replies) && comment.replies.length > 0 ? (
            <div className="mt-3 space-y-3">
              {comment.replies.map((child) => (
                <Comment
                  key={child.id}
                  comment={child}
                  depth={depth + 1}
                  autoCollapseDeep={autoCollapseDeep}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default Comment;
