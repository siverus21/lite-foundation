import { mountDocs } from '../mount.jsx';
import AvatarPage from '../pages/avatar.jsx';

mountDocs({
  file: 'avatar.html',
  title: 'Avatar',
  kicker: 'Component',
  lead: (
    <>
      Круглый/квадратный аватар пользователя: картинка, пустой CSS-фолбэк на инициалы (без
      onerror-скриптов) и индикатор статуса. Чистый CSS, JS не нужен.
    </>
  ),
  flags: ['styles.avatar'],
  Page: AvatarPage,
});
