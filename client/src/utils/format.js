import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const timeAgo = (unixSeconds) => {
  if (!unixSeconds) return '';
  return dayjs.unix(unixSeconds).fromNow();
};

export const formatDate = (unixSeconds) => {
  if (!unixSeconds) return '';
  return dayjs.unix(unixSeconds).format('MMM D, YYYY · HH:mm');
};

export const domainOf = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch (_e) {
    return null;
  }
};

export const pluralize = (n, singular, plural) =>
  `${n} ${n === 1 ? singular : plural || singular + 's'}`;
