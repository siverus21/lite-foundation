import { mountDocs } from '../mount.jsx';
import PatternsPage from '../pages/patterns.jsx';

mountDocs({
  file: 'patterns.html',
  title: 'Patterns',
  kicker: 'Guide',
  lead: (
    <>
      Готовые композиции из существующих примитивов: login, filter bar, settings. Новых компонентов
      нет — только разметка и флаги.
    </>
  ),
  flags: [
    'styles.button',
    'styles.forms',
    'styles.card',
    'styles.segmented',
    'styles.callout',
    'styles.menu',
    'scripts.inputRecipes',
  ],
  Page: PatternsPage,
});
