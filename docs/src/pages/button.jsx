import {
  Section,
  When,
  Demo,
  Code,
  Aside,
  Meta,
  Note,
  Anatomy,
  ApiTable,
  c,
} from '../components/primitives.jsx';

export default function ButtonPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'CTA: отправка формы, покупка, сохранение',
            'Триггеры overlay-компонентов: modal, dropdown, off-canvas (<code>type="button"</code>)',
            'Тулбары и группы связанных действий (<code>.button-group</code>)',
          ]}
          bad={[
            'Навигация по сайту — обычная ссылка или пункт меню без класса <code>button</code>',
            'Бинарный on/off — <a href="forms.html">switch</a> или checkbox',
            'Взаимоисключающий выбор из 2–5 вариантов — лучше <a href="segmented.html">Segmented</a>',
          ]}
        />
      </Section>

      <Section title="Анатомия">
        <Anatomy
          rows={[
            {
              part: '.button',
              detail: 'Базовый класс. Работает на <code>&lt;button&gt;</code> и на <code>&lt;a&gt;</code>.',
            },
            {
              part: 'primary | secondary | success | warning | alert',
              detail: 'Семантический цвет заливки (токены <code>--lf-color-*</code>).',
            },
            {
              part: 'hollow | clear',
              detail: 'Контур / текстовая кнопка без плотной заливки.',
            },
            {
              part: 'tiny | small | large',
              detail: 'Размер. Без модификатора — базовый.',
            },
            {
              part: 'expanded',
              detail: 'Ширина 100% контейнера.',
            },
            {
              part: '.button-group',
              detail: 'Обёртка, которая склеивает соседние кнопки в один блок.',
            },
            {
              part: '.is-loading / aria-busy',
              detail: 'Блокирует клики, прячет текст, показывает CSS-spinner.',
            },
            {
              part: '.icon-only / .icon-button',
              detail: 'Квадратная кнопка под SVG/иконку. Нужен <code>aria-label</code>.',
            },
          ]}
        />
      </Section>

      <Section title="Цвета и стили">
        <Meta>Цвет = статус действия; hollow/clear — вторичный акцент.</Meta>
        <Demo label="Палитра">
          <button type="button" class="button primary">
            Primary
          </button>{' '}
          <button type="button" class="button secondary">
            Secondary
          </button>{' '}
          <button type="button" class="button success">
            Success
          </button>{' '}
          <button type="button" class="button warning">
            Warning
          </button>{' '}
          <button type="button" class="button alert">
            Alert
          </button>{' '}
          <button type="button" class="button hollow">
            Hollow
          </button>{' '}
          <button type="button" class="button clear">
            Clear
          </button>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button primary">Primary</button>
<button type="button" class="button hollow">Hollow</button>
<button type="button" class="button clear">Clear</button>`}
        />
      </Section>

      <Section title="Размеры">
        <Demo label="Масштаб">
          <button type="button" class="button tiny">
            Tiny
          </button>{' '}
          <button type="button" class="button small">
            Small
          </button>{' '}
          <button type="button" class="button">
            Default
          </button>{' '}
          <button type="button" class="button large">
            Large
          </button>{' '}
          <button type="button" class="button expanded primary">
            Expanded
          </button>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button tiny">Tiny</button>
<button type="button" class="button large primary">Large</button>
<button type="button" class="button expanded primary">На всю ширину</button>`}
        />
      </Section>

      <Section title="Button group">
        <p>Склейка в один визуальный блок — фильтры, сегменты без radio-семантики.</p>
        <Demo>
          <div class="button-group">
            <a class="button">One</a>
            <a class="button">Two</a>
            <a class="button">Three</a>
          </div>
        </Demo>
        <Code
          title="HTML"
          code={`<div class="button-group">
  <a class="button">One</a>
  <a class="button">Two</a>
  <a class="button">Three</a>
</div>`}
        />
        <Aside>
          Для настоящего взаимоисключающего выбора с клавиатурой и <code>aria</code> используйте{' '}
          <a href="segmented.html">Segmented</a> или radio-группу.
        </Aside>
      </Section>

      <Section title="Формы и type">
        <ApiTable
          columns={['type', 'Когда']}
          rows={[
            [c('submit'), 'Единственная кнопка отправки формы (или явный submit)'],
            [c('button'), 'Все остальные действия: открыть modal, сбросить фильтр, AJAX'],
            [c('reset'), 'Редко: полный сброс полей формы'],
          ]}
        />
        <Note tone="warn">
          <strong>Ссылка ≠ кнопка</strong>
          <code>&lt;a class="button"&gt;</code> только для перехода по URL. Действие без смены
          адреса — всегда <code>&lt;button&gt;</code>.
        </Note>
      </Section>

      <Section title="Состояния" mark="upd">
        <Demo label="disabled">
          <button type="button" class="button primary" disabled>
            Disabled
          </button>{' '}
          <button type="button" class="button hollow" disabled>
            Disabled hollow
          </button>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button primary" disabled>Disabled</button>
<!-- Для ссылок-кнопок: aria-disabled="true" + pointer-events / tabindex="-1" -->`}
        />
        <Demo label="is-loading">
          <button type="button" class="button primary is-loading" aria-busy="true">
            Saving
          </button>{' '}
          <button type="button" class="button hollow is-loading" aria-busy="true">
            Saving
          </button>{' '}
          <button type="button" class="button" aria-busy="true">
            Via aria-busy
          </button>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button primary is-loading" aria-busy="true">Saving</button>
<!-- Эквивалент: .button[aria-busy="true"] — тот же CSS-spinner, без отдельного Spinner -->`}
        />
        <Aside>
          Текст остаётся в DOM (для скринридеров / после снятия состояния), визуально скрыт через{' '}
          <code>color: transparent</code>. Пока идёт запрос — не подменяйте label молча.
        </Aside>
        <Demo label="icon-only">
          <button type="button" class="button icon-only secondary" aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="2.5" fill="currentColor" />
              <path
                d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"
                stroke="currentColor"
                stroke-width="1.25"
                fill="none"
              />
            </svg>
          </button>{' '}
          <button type="button" class="button icon-only tiny primary" aria-label="More">
            <span aria-hidden="true">⋯</span>
          </button>{' '}
          <button type="button" class="icon-button hollow" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button icon-only secondary" aria-label="Settings">
  <svg width="16" height="16" aria-hidden="true" focusable="false">…</svg>
</button>
<!-- Алиас: class="icon-button" — тот же квадратный хост -->`}
        />
      </Section>

      <Section title="Токены">
        <p>
          Размеры и отступы — в <code>scss/settings/button/</code>. Цвета тянутся из палитры{' '}
          <code>--lf-color-primary</code> … <code>--lf-color-alert</code> и их{' '}
          <code>-contrast</code> вариантов. Переопределяйте на странице или в теме, не копируя SCSS
          кнопки.
        </p>
        <Code
          title="CSS"
          code={`:root {
  --lf-color-primary: #1769aa;
}`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Иконка слева/справа — inline SVG внутри кнопки + <code>gap</code> через утилиты flex.
          </li>
          <li>
            Пара «сохранить / отмена»: primary + hollow clear в одной строке.
          </li>
          <li>
            Кастомный размер бренда — новые CSS-переменные в токенах, а не локальный{' '}
            <code>font-size</code> на каждой странице.
          </li>
        </ul>
      </Section>
    </>
  );
}
