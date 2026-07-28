import { mountDocs } from '../mount.jsx';
import RatingPage from '../pages/rating.jsx';

mountDocs({
  file: 'rating.html',
  title: 'Rating',
  kicker: 'Component',
  lead: (
    <>
      Звёздный рейтинг. Интерактивный режим модуль сам строит из{' '}
      <code>&lt;div data-rating&gt;</code> — <code>role="radiogroup"</code> из кнопок-звёзд и
      скрытый input. Режим только для чтения (<code>data-readonly</code>) — чистый CSS, без JS
      вообще.
    </>
  ),
  flags: ['styles.rating', 'scripts.rating'],
  Page: RatingPage,
  onReady() {
    const form = document.getElementById('docsRatingForm');
    const result = document.getElementById('docsRatingFormResult');
    if (!form || !result) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      result.textContent = `Отправлено: score = ${data.get('score')}`;
    });
  },
});
