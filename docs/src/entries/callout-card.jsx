import { mountDocs } from '../mount.jsx';
import CalloutCardPage from '../pages/callout-card.jsx';

mountDocs({
  file: 'callout-card.html',
  documentTitle: 'Callout & Card — lite-foundation docs',
  title: 'Callout & Card',
  kicker: 'Component',
  lead: (
    <>
      Статусы/сообщения (callout) и карточки контента (card). Цвета тянут токены{' '}
      <code>--lf-color-*</code>. Закрываемые callout — через <code>scripts.dismiss</code>.
    </>
  ),
  flags: ['styles.callout', 'styles.card', 'scripts.dismiss'],
  Page: CalloutCardPage,
});
