import { mountDocs } from '../mount.jsx';
import TestingPage from '../pages/testing.jsx';

mountDocs({
  file: 'testing.html',
  title: 'Тесты',
  kicker: 'Quality',
  lead: (
    <>
      <a href="https://vitest.dev/">Vitest</a> + <code>happy-dom</code>: юнит-тесты на JS-модули и
      отдельный набор, который проверяет, что <code>config/features.js</code> не разошёлся с{' '}
      <code>scripts/sync-features.js</code>.
    </>
  ),
  Page: TestingPage,
});
