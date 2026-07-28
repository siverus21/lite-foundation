import { mountDocs } from '../mount.jsx';
import BuildsPage from '../pages/builds.jsx';

mountDocs({
  file: 'builds.html',
  title: 'Named & library builds',
  kicker: 'Architecture',
  lead: (
    <>
      Объект <code>builds</code> в <code>config/features.js</code> описывает отдельные CSS/JS-бандлы.
      Так один репозиторий отдаёт полный kitchen-sink, урезанную «about»-страницу и тяжёлые аддоны
      без раздувания основного <code>app.css</code>.
    </>
  ),
  Page: BuildsPage,
});
