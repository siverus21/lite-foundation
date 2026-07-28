import { Section, When, Demo, Code, ApiTable, c } from '../components/primitives.jsx';

export default function RatingPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Оценка товара/отзыва пользователем — интерактивный режим',
            'Отображение среднего рейтинга в карточке товара — <code>data-readonly</code>',
          ]}
        />
      </Section>

      <Section title="Интерактивный (для формы)">
        <ul>
          <li>
            Разметка:{' '}
            <code>
              &lt;div class="rating" data-rating data-rating-value="3" data-rating-max="5"
              data-rating-name="score"&gt;&lt;/div&gt;
            </code>
          </li>
          <li>
            Клик по звезде, стрелки ← → / ↑ ↓, <code>Home</code>/<code>End</code> — меняют значение
          </li>
          <li>
            Модуль сам добавляет <code>role="radiogroup"</code>, кнопки-звёзды и скрытый{' '}
            <code>&lt;input type="hidden"&gt;</code> для отправки в форме
          </li>
          <li>
            Событие: <code>changed.lf.rating</code> на корне, <code>detail.value</code>
          </li>
        </ul>
        <Demo>
          <div
            class="rating"
            data-rating
            data-rating-value="3"
            data-rating-max="5"
            data-rating-name="score"
          ></div>
        </Demo>
        <Code
          code={`<div class="rating" data-rating
  data-rating-value="3"
  data-rating-max="5"
  data-rating-name="score"></div>`}
        />
      </Section>

      <Section title="JS API: атрибуты, клавиатура, событие">
        <p>
          Rating, как и остальные интерактивные компоненты, не требует прямого вызова методов — вся
          настройка идёт через <code>data-*</code>-атрибуты при монтаже и через одно событие для
          чтения результата. Инстанс модуля не нужен.
        </p>
        <ApiTable
          columns={['Атрибут / клавиша', 'Описание']}
          rows={[
            [c('data-rating-value'), 'Начальное значение (0 — ни одна звезда не выбрана)'],
            [c('data-rating-max'), 'Количество звёзд, по умолчанию 5'],
            [
              c('data-rating-name'),
              'Имя скрытого input type="hidden" — участвует в отправке формы как обычное поле',
            ],
            ['Клик по звезде', 'Ставит значение = номеру звезды'],
            [`${c('→')} / ${c('↑')}, ${c('←')} / ${c('↓')}`, '+1 / −1 к значению (с фокусом на активной звезде)'],
            [`${c('Home')} / ${c('End')}`, `Минимум (1) / максимум (${c('data-rating-max')})`],
          ]}
        />
        <p>
          Событие <code>changed.lf.rating</code> всплывает на корневом <code>[data-rating]</code>:
        </p>
        <Code
          code={`document.querySelector('[data-rating]').addEventListener('changed.lf.rating', (event) => {
  console.log('Новая оценка:', event.detail.value);
  fetch('/api/reviews/rating', {
    method: 'POST',
    body: JSON.stringify({ value: event.detail.value }),
  });
});`}
        />
        <p>
          Живой пример — скрытый <code>&lt;input&gt;</code> реально участвует в{' '}
          <code>FormData</code> при отправке формы, без единой дополнительной строчки кода:
        </p>
        <Demo>
          <form id="docsRatingForm">
            <label>
              Оцените товар
              <div
                class="rating"
                data-rating
                data-rating-value="0"
                data-rating-max="5"
                data-rating-name="score"
                style={{ marginTop: '0.35rem' }}
              ></div>
            </label>
            <button class="button primary" type="submit" style={{ marginTop: '0.75rem' }}>
              Отправить отзыв
            </button>
          </form>
          <p class="docs-aside" id="docsRatingFormResult"></p>
        </Demo>
        <Code
          code={`<form id="reviewForm">
  <div class="rating" data-rating data-rating-name="score"></div>
  <button type="submit">Отправить</button>
</form>

<script>
  document.getElementById('reviewForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log('score =', data.get('score'));
  });
</script>`}
        />
      </Section>

      <Section title="Только для чтения">
        <p>
          <code>data-readonly</code> отключает JS полностью — заливка через CSS custom property{' '}
          <code>--lf-rating-value</code> (проценты) поверх <code>content: attr(data-stars)</code>.
        </p>
        <Demo>
          <div
            class="rating"
            data-rating
            data-readonly
            data-stars="★★★★★"
            style={{ '--lf-rating-value': '84%' }}
            aria-label="4.2 из 5"
          ></div>
          <div
            class="rating"
            data-rating
            data-readonly
            data-stars="★★★★★"
            style={{ '--lf-rating-value': '40%' }}
            aria-label="2 из 5"
          ></div>
        </Demo>
        <Code
          code={`<div class="rating" data-rating data-readonly
  data-stars="★★★★★"
  style="--lf-rating-value: 84%;"
  aria-label="4.2 из 5"></div>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Карточка товара: <code>data-readonly</code> + <code>--lf-rating-value</code> из среднего
            рейтинга API.
          </li>
          <li>
            Форма отзыва: <code>changed.lf.rating</code> для превью текста «Вы поставили N
            звёзд».
          </li>
          <li>
            <code>data-rating-max</code> для 10-балльной шкалы — модуль масштабирует звёзды.
          </li>
        </ul>
      </Section>
    </>
  );
}
