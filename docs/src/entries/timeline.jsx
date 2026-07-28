import { mountDocs } from '../mount.jsx';
import TimelinePage from '../pages/timeline.jsx';

mountDocs({
  file: 'timeline.html',
  title: 'Timeline',
  kicker: 'Component',
  lead: (
    <>
      Хронология событий: статусы заказа, история изменений, лог действий, changelog. Чистый CSS,
      без JS. Линия-коннектор — это <code>border</code> самого элемента списка, поэтому она всегда
      точно по высоте пункта, без магических чисел.
    </>
  ),
  flags: ['styles.timeline'],
  Page: TimelinePage,
});
