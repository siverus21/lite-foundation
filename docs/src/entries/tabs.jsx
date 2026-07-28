import { mountDocs } from '../mount.jsx';
import TabsPage from '../pages/tabs.jsx';

mountDocs({
  file: 'tabs.html',
  title: 'Tabs',
  kicker: 'Component',
  lead: (
    <>
      Переключение панелей на одной странице с ролями WAI-ARIA и навигацией стрелками. URL не
      меняется — для deep-link лучше отдельные якоря или роутер.
    </>
  ),
  flags: ['styles.tabs', 'scripts.tabs'],
  Page: TabsPage,
});
