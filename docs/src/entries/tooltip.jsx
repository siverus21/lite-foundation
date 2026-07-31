import { mountDocs } from '../mount.jsx';
import TooltipPage from '../pages/tooltip.jsx';

mountDocs({
  file: 'tooltip.html',
  title: 'Tooltip',
  kicker: 'Component',
  lead: (
    <>
      Подсказка по hover/focus на <code>.has-tip[data-tip]</code>. Визуал — чистый CSS; модуль только
      копирует текст в <code>aria-label</code>, если его ещё нет. Не путать с{' '}
      <a href="dropdown.html">Dropdown</a> (клик) и <a href="popover.html">Popover</a> (панель с
      контентом).
    </>
  ),
  flags: ['styles.tooltip', 'scripts.tooltip'],
  Page: TooltipPage,
});
