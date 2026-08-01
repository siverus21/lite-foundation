import { MARK_LABELS } from '../nav.js';

const TITLES = {
  new: 'Новая страница или фича',
  upd: 'Обновлено',
  fix: 'Исправление',
};

/**
 * Badge for recent docs changes — page title, section heading, or sidebar.
 * @param {{ mark?: 'new' | 'upd' | 'fix', class?: string }} props
 */
export function DocsMark({ mark, class: className }) {
  if (!mark || !MARK_LABELS[mark]) return null;
  const classes = ['docs-nav-mark', `docs-nav-mark--${mark}`, className].filter(Boolean).join(' ');
  return (
    <span class={classes} title={TITLES[mark] || ''} aria-label={TITLES[mark]}>
      {MARK_LABELS[mark]}
    </span>
  );
}
