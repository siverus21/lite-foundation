import { mountDocs } from '../mount.jsx';
import AccordionPage from '../pages/accordion.jsx';

mountDocs({
  file: 'accordion.html',
  title: 'Accordion',
  kicker: 'Component',
  lead: (
    <>
      Раскрывающиеся секции на native <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code>.
      Работает даже без JS; модуль добавляет режим «только одна панель» и единообразие a11y.
    </>
  ),
  flags: ['styles.accordion', 'scripts.accordion'],
  Page: AccordionPage,
});
