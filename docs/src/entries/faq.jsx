import { mountDocs } from '../mount.jsx';
import FaqPage from '../pages/faq.jsx';

mountDocs({
  file: 'faq.html',
  title: 'FAQ',
  kicker: 'Guide',
  lead: (
    <>
      Коротко о границах проекта, feature flags, бандлах и a11y. Пошаговый разбор ошибок —{' '}
      <a href="troubleshooting.html">Troubleshooting</a>.
    </>
  ),
  Page: FaqPage,
});
