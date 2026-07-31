import { mountDocs } from '../mount.jsx';
import DropdownPage from '../pages/dropdown.jsx';

mountDocs({
  file: 'dropdown.html',
  documentTitle: 'Dropdown — lite-foundation docs',
  title: 'Dropdown',
  kicker: 'Component',
  lead: (
    <>
      Лёгкая всплывающая панель у триггера по клику. Не блокирует страницу (в отличие от modal).
      Hover-подсказка — отдельно: <a href="tooltip.html">Tooltip</a>.
    </>
  ),
  flags: ['styles.dropdown', 'scripts.dropdown'],
  Page: DropdownPage,
});
