import { Section, Demo, Code, ApiTable, c } from '../components/primitives.jsx';

export default function TimelinePage() {
  return (
    <>
      <Section title="Timeline или Stepper">
        <p>
          Похожи внешне, отвечают на разные вопросы.{' '}
          <a href="stepper.html">Stepper</a> — <em>процесс</em>: есть текущий шаг, по шагам можно
          двигаться, есть JS API. Timeline — <em>история</em>: события уже произошли, переключать
          нечего.
        </p>
      </Section>

      <Section title="Разметка">
        <p>
          Упорядоченный список: семантика «последовательности» достаётся от <code>&lt;ol&gt;</code>
          . Внутри пункта — что угодно; вспомогательные классы <code>.timeline-meta</code> (время)
          и <code>.timeline-title</code> (заголовок).
        </p>
        <Demo>
          <ol class="timeline">
            <li class="timeline-item is-complete">
              <p class="timeline-meta">12 июля, 09:14</p>
              <h4 class="timeline-title">Заказ оформлен</h4>
              <p>Оплата прошла, чек отправлен на почту.</p>
            </li>
            <li class="timeline-item is-complete">
              <p class="timeline-meta">12 июля, 10:24</p>
              <h4 class="timeline-title">Собран на складе</h4>
              <p>Ждёт курьера.</p>
            </li>
            <li class="timeline-item is-current">
              <p class="timeline-meta">13 июля, 08:30</p>
              <h4 class="timeline-title">Передан в доставку</h4>
              <p>Курьер свяжется за час до визита.</p>
            </li>
            <li class="timeline-item">
              <p class="timeline-meta">Ожидается 13 июля</p>
              <h4 class="timeline-title">Доставлен</h4>
            </li>
          </ol>
        </Demo>
        <Code
          code={`<ol class="timeline">
  <li class="timeline-item is-complete">
    <p class="timeline-meta">12 июля, 09:14</p>
    <h4 class="timeline-title">Заказ оформлен</h4>
    <p>Оплата прошла, чек отправлен на почту.</p>
  </li>
  <li class="timeline-item is-current">
    <p class="timeline-meta">13 июля, 08:30</p>
    <h4 class="timeline-title">Передан в доставку</h4>
  </li>
  <li class="timeline-item">
    <h4 class="timeline-title">Доставлен</h4>
  </li>
</ol>`}
        />
      </Section>

      <Section title="Состояния точки">
        <ApiTable
          columns={['Класс', 'Точка', 'Смысл']}
          rows={[
            ['без класса', 'Пустой контур', 'Событие ещё не наступило'],
            [c('is-complete'), 'Залитая', 'Событие произошло'],
            [c('is-current'), 'Кольцо с гало', 'Происходит сейчас'],
            [
              `${c('success')}, ${c('alert')}, ${c('warning')}, ${c('primary')}, ${c('secondary')}`,
              'Залитая цветом палитры',
              'Тип события: отмена, ошибка, предупреждение',
            ],
          ]}
        />
        <Demo>
          <ol class="timeline">
            <li class="timeline-item success">
              <p class="timeline-meta">10:02</p>
              <h4 class="timeline-title">Платёж подтверждён</h4>
            </li>
            <li class="timeline-item warning">
              <p class="timeline-meta">10:40</p>
              <h4 class="timeline-title">Товара меньше, чем в заказе</h4>
              <p>Количество уменьшено до 2 шт.</p>
            </li>
            <li class="timeline-item alert">
              <p class="timeline-meta">11:15</p>
              <h4 class="timeline-title">Позиция отменена</h4>
            </li>
          </ol>
        </Demo>
      </Section>

      <Section title="Плотный вариант и вложенный контент">
        <p>
          Внутри пункта можно верстать что угодно — например, <a href="chip.html">чипы</a> или{' '}
          <a href="avatar.html">аватар</a> автора действия. Отступы регулируются токенами,
          отдельного «compact»-класса нет.
        </p>
        <Demo>
          <ol
            class="timeline"
            style={{
              '--lf-timeline-item-spacing': '0.75rem',
              '--lf-timeline-dot-size': '0.6rem',
              '--lf-timeline-gutter': '1.25rem',
            }}
          >
            <li class="timeline-item is-complete">
              <p class="timeline-meta">2 мин назад</p>
              <p style={{ margin: 0 }}>
                <span class="chip tiny">deploy</span> Версия 2.4.0 в проде
              </p>
            </li>
            <li class="timeline-item is-complete">
              <p class="timeline-meta">18 мин назад</p>
              <p style={{ margin: 0 }}>
                <span class="chip tiny secondary">review</span> PR #482 одобрен
              </p>
            </li>
            <li class="timeline-item is-complete">
              <p class="timeline-meta">час назад</p>
              <p style={{ margin: 0 }}>
                <span class="chip tiny">commit</span> Правка в quantity.js
              </p>
            </li>
          </ol>
        </Demo>
        <Code
          code={`<ol class="timeline" style="
      --lf-timeline-item-spacing: 0.75rem;
      --lf-timeline-dot-size: 0.6rem;
      --lf-timeline-gutter: 1.25rem;">
  …
</ol>`}
        />
      </Section>

      <Section title="Токены">
        <ApiTable
          columns={['Переменная', 'Что задаёт']}
          rows={[
            [c('--lf-timeline-gutter'), 'Отступ контента от линии'],
            [c('--lf-timeline-item-spacing'), 'Расстояние между событиями'],
            [c('--lf-timeline-dot-size'), 'Диаметр точки'],
            [c('--lf-timeline-line-width'), 'Толщина линии и обводки точки'],
            [c('--lf-timeline-line'), 'Цвет линии'],
            [`${c('--lf-timeline-dot-bg')} / ${c('--lf-timeline-dot-color')}`, 'Фон и обводка точки'],
            [c('--lf-timeline-dot-color-complete'), 'Цвет залитой точки (is-complete)'],
            [`${c('--lf-timeline-meta-color')} / ${c('--lf-timeline-meta-font-size')}`, 'Стиль строки времени'],
          ]}
        />
      </Section>

      <Section title="Доступность">
        <ul>
          <li>
            <code>&lt;ol&gt;</code> вместо <code>&lt;div&gt;</code> — скринридер объявит количество
            событий и порядковый номер.
          </li>
          <li>
            Состояние передаётся не только цветом: залитая точка, кольцо и пустой контур различимы
            и в монохроме. Но текст статуса всё равно нужен — цвет точки вспомогательный.
          </li>
          <li>
            Время лучше оборачивать в <code>&lt;time datetime="2026-07-12T09:14"&gt;</code> —
            стили этого не требуют, но машиночитаемость бесплатна.
          </li>
        </ul>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Лента активности: компактные токены на корне <code>ol.timeline</code> +{' '}
            <a href="chip.html">chip</a> внутри пункта.
          </li>
          <li>
            Статус заказа: <code>is-complete</code> / <code>is-current</code> + палитра (
            <code>success</code>, <code>alert</code>) для типа события.
          </li>
          <li>
            <code>&lt;time datetime&gt;</code> в <code>.timeline-meta</code> для локали и
            относительного времени через JS.
          </li>
        </ul>
      </Section>
    </>
  );
}
