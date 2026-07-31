import { mountDocs } from '../mount.jsx';
import AuthoringPage from '../pages/authoring.jsx';

mountDocs({
  file: 'authoring.html',
  title: 'Авторство',
  kicker: 'Guide',
  lead: (
    <>
      Как добавить компонент (CSS / JS), написать тесты и завести страницу в docs. Соглашения по
      именам — <code>scss/settings/_naming.scss</code>; lifecycle API —{' '}
      <a href="lifecycle.html">JS API</a>; запуск тестов — <a href="testing.html">Тесты</a>.
    </>
  ),
  Page: AuthoringPage,
});
