/**
 * Tiny sanitizer for Hacker News comment HTML.
 *
 * HN emits a constrained subset (<p>, <i>, <a>, <pre>, <code>), but we still
 * defensively strip:
 *   - <script> blocks
 *   - on*= event-handler attributes
 *   - javascript:/data: URLs on href
 *
 * For a production app, swap in DOMPurify. We avoid it here to stay inside
 * the locked dependency set.
 */
export const sanitizeHnHtml = (html) => {
  if (!html || typeof html !== 'string') return '';

  let out = html;

  // Strip <script>...</script>
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Strip <iframe>, <object>, <embed>
  out = out.replace(/<(iframe|object|embed)[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<(iframe|object|embed)[^>]*\/?>/gi, '');
  // Strip on*= handlers (with optional spaces, single/double/no quotes)
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  // Strip javascript: and data: hrefs
  out = out.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
  out = out.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
  out = out.replace(/href\s*=\s*"data:[^"]*"/gi, 'href="#"');

  // Ensure links open safely in a new tab
  out = out.replace(/<a\s+([^>]*?)href=/gi, '<a target="_blank" rel="noopener noreferrer" $1href=');

  return out;
};
