import { mountDocs } from '../mount.jsx';
import ModalPage from '../pages/modal.jsx';

mountDocs({
  file: 'modal.html',
  title: 'Modal',
  kicker: 'Component',
  lead: (
    <>
      Диалог поверх страницы на native <code>&lt;dialog&gt;</code>: фокус-трап и Esc даёт браузер,
      модуль добавляет открытие по data-атрибутам и scroll-lock.
    </>
  ),
  flags: ['styles.modal', 'scripts.modal'],
  Page: ModalPage,
});
