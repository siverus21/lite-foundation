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

      <Section title="Состояния">
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
        <p>
          Загрузка: не подменяйте текст молча — добавьте <code>aria-busy="true"</code> и видимый
          индикатор (<a href="spinner.html">Spinner</a>).
        </p>
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
