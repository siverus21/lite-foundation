import { mountDocs } from '../mount.jsx';
import ButtonPage from '../pages/button.jsx';

mountDocs({
  file: 'button.html',
  title: 'Button',
  kicker: 'Component',
  lead: (
    <>
      Базовый контрол действия: отправка формы, открытие modal/off-canvas, вторичные действия. Только
      CSS — JS не требуется.
    </>
  ),
  flags: ['styles.button'],
  Page: ButtonPage,
});
