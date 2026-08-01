import { mountDocs } from '../mount.jsx';
import EmptyStatePage from '../pages/empty-state.jsx';

mountDocs({
  file: 'empty-state.html',
  title: 'Empty state',
  kicker: 'Component',
  lead: (
    <>
      Плейсхолдер «нет данных» для списков, таблиц и карточек. Только CSS (
      <code>styles.emptyState</code>).
    </>
  ),
  flags: ['styles.emptyState'],
  Page: EmptyStatePage,
});
