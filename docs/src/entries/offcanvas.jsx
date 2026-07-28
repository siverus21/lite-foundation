import { mountDocs } from '../mount.jsx';
import OffcanvasPage from '../pages/offcanvas.jsx';

mountDocs({
  file: 'offcanvas.html',
  documentTitle: 'Off-canvas — lite-foundation docs',
  title: 'Off-canvas',
  kicker: 'Component',
  lead: (
    <>
      Боковой drawer: мобильное меню, фильтры, вспомогательная панель. Блокирует скролл страницы
      через общий <code>scroll-lock</code> (как modal).
    </>
  ),
  flags: ['styles.offcanvas', 'scripts.offcanvas'],
  Page: OffcanvasPage,
});
