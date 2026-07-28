import { mountDocs } from '../mount.jsx';
import DropdownPage from '../pages/dropdown.jsx';

mountDocs({
  file: 'dropdown.html',
  documentTitle: 'Dropdown — lite-foundation docs',
  title: 'Dropdown & Tooltip',
  kicker: 'Component',
  lead: (
    <>
      Лёгкие всплывающие панели у триггера. Dropdown — по клику; tooltip — по hover/focus. Не
      блокируют страницу (в отличие от modal).
    </>
  ),
  flags: ['styles.dropdown', 'scripts.dropdown', 'styles.tooltip', 'scripts.tooltip'],
  Page: DropdownPage,
});
