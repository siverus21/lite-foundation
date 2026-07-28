import { mountDocs } from '../mount.jsx';
import FormsPage from '../pages/forms.jsx';

mountDocs({
  file: 'forms.html',
  title: 'Forms',
  kicker: 'Component',
  lead: (
    <>
      Стили полей ввода и контролов. Большинство работает без JS; кастомный range (
      <code>data-slider</code>) требует модуль FormSlider. Кастомные <code>.checkbox</code> /{' '}
      <code>.radio</code> — opt-in внутри <code>styles.forms</code>.
    </>
  ),
  flags: ['styles.forms', 'scripts.formSlider'],
  Page: FormsPage,
});
