import { mountDocs } from '../mount.jsx';
import StartPage from '../pages/start.jsx';

mountDocs({
  file: 'start.html',
  title: 'Быстрый старт',
  kicker: 'Guide',
  lead: (
    <>
      Поднять локально, собрать <code>dist/</code> и подключить бандлы на своей странице. Без
      Vite-сервера абсолютные пути <code>/js/load-build.js</code> не заработают — открывай через{' '}
      <code>npm run start</code>.
    </>
  ),
  Page: StartPage,
});
