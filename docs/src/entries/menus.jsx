import { mountDocs } from '../mount.jsx';
import MenusPage from '../pages/menus.jsx';

mountDocs({
  file: 'menus.html',
  title: 'Menus',
  kicker: 'Component',
  lead: (
    <>
      Навигационные списки с вложенностью. Тип задаётся{' '}
      <code>data-menu="dropdown|accordion|drilldown"</code> — отдельные JS-флаги на каждый паттерн.
    </>
  ),
  flags: [
    'styles.menu',
    'scripts.menuDropdown',
    'scripts.menuAccordion',
    'scripts.menuDrilldown',
  ],
  Page: MenusPage,
});
