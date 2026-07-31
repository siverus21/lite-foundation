import { mountDocs } from '../mount.jsx';
import TroubleshootingPage from '../pages/troubleshooting.jsx';

mountDocs({
  file: 'troubleshooting.html',
  title: 'Troubleshooting',
  kicker: 'Guide',
  lead: (
    <>
      Типичные сбои сборки и рантайма и что проверить первым. Короткие ответы «почему так сделано»
      — на <a href="faq.html">FAQ</a>.
    </>
  ),
  Page: TroubleshootingPage,
});
