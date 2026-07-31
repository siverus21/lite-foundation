import { mountDocs } from '../mount.jsx';
import CssOnlyPage from '../pages/css-only.jsx';

mountDocs({
  file: 'css-only.html',
  title: 'CSS-only',
  kicker: 'UI Kit',
  lead: (
    <>
      Компоненты без JS-модуля: только разметка + <code>styles.*</code>. Полная витрина —{' '}
      <a href="ui-kit.html">ui-kit.html</a>; здесь — каталог с копируемыми сниппетами и якорными
      ссылками.
    </>
  ),
  flags: [
    'styles.badge',
    'styles.breadcrumbs',
    'styles.pagination',
    'styles.progress',
    'styles.meter',
    'styles.label',
    'styles.titleBar',
    'styles.topBar',
    'styles.mediaObject',
    'styles.thumbnail',
    'styles.responsiveEmbed',
    'styles.sticky',
  ],
  Page: CssOnlyPage,
});
