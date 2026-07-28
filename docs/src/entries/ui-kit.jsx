import { mountDocs } from '../mount.jsx';
import UiKitPage, { UiKitOffcanvas } from '../pages/ui-kit.jsx';

mountDocs({
  file: 'ui-kit.html',
  title: 'UI Kit',
  kicker: 'UI Kit',
  lead: (
    <>
      Витрина всех компонентов lite-foundation — старых и новых — с основными вариантами в одном месте.
      Разметка, флаги и обоснование «когда использовать» для каждого — на отдельной странице (ссылка в
      сайдбаре слева).
    </>
  ),
  extraBuilds: ['swiper'],
  outsideMain: <UiKitOffcanvas />,
  Page: UiKitPage,
});
