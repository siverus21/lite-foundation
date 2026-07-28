import { Section, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function ModernCssPage() {
  return (
    <>
      <Section title="Container queries">
        <p>
          Медиазапрос знает только ширину окна. Из-за этого один и тот же компонент нельзя
          переиспользовать в сайдбаре и в широкой колонке — приходится либо плодить варианты классов,
          либо мерить контейнер в JS. Container query спрашивает <em>контейнер</em>, поэтому разметка
          остаётся одна.
        </p>
        <Code
          code={`<!-- .query-container объявляет элемент контейнером для запросов -->
<div class="query-container">
  <div class="card adaptive">
    <img class="card-image" src="/cover.jpg" alt="">
    <div class="card-section">
      <h4>Заголовок</h4>
      <p>Описание.</p>
    </div>
  </div>
</div>`}
        />
        <p>
          Ниже — одна и та же карточка в двух контейнерах разной ширины. Правый можно потянуть за
          уголок: на 26&nbsp;rem карточка сама станет горизонтальной.
        </p>
        <Demo>
          <div class="grid-x grid-margin-x">
            <div class="cell small-12 medium-4">
              <p class="docs-aside">Узкий контейнер</p>
              <div class="query-container">
                <div class="card adaptive">
                  <div class="card-section">
                    <h5 style={{ margin: '0 0 0.25rem' }}>Кофемолка Wilfa</h5>
                    <p style={{ margin: 0 }}>Жернова, 41 степень помола.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="cell small-12 medium-8">
              <p class="docs-aside">Тяните за правый нижний угол →</p>
              <div
                class="query-container"
                style={{
                  resize: 'horizontal',
                  overflow: 'auto',
                  minWidth: '12rem',
                  maxWidth: '100%',
                  paddingBottom: '0.5rem',
                }}
              >
                <div class="card adaptive">
                  <div class="card-section">
                    <h5 style={{ margin: '0 0 0.25rem' }}>Кофемолка Wilfa</h5>
                    <p style={{ margin: 0 }}>Жернова, 41 степень помола.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Demo>
        <ApiTable
          columns={['Класс', 'Поведение']}
          rows={[
            [
              c('.query-container'),
              <>Делает элемент контейнером запросов по ширине (<code>container-type: inline-size</code>)</>,
            ],
            [c('.query-container-size'), 'То же, но и по высоте. Требует явного размера элемента'],
            [c('.card.adaptive'), 'Стек по умолчанию, горизонтально от 26 rem ширины контейнера'],
            [c('.media-object.stack-narrow'), 'Складывается в столбик, когда контейнер уже 26 rem'],
          ]}
        />
        <Demo>
          <div class="query-container" style={{ maxWidth: '20rem' }}>
            <div class="media-object stack-narrow">
              <div class="media-object-section">
                <div class="avatar">АИ</div>
              </div>
              <div class="media-object-section">
                <h5 style={{ margin: '0 0 0.2rem' }}>Анна Иванова</h5>
                <p style={{ margin: 0 }}>В узком контейнере аватар встаёт над текстом.</p>
              </div>
            </div>
          </div>
        </Demo>
        <div class="docs-note">
          <strong>
            Про <code>.query-container</code>
          </strong>
          <code>container-type: inline-size</code> создаёт containment по размеру: элемент перестаёт
          зависеть от размеров содержимого по inline-оси. Это ровно то, что нужно для запросов, но не
          ставьте его на <code>body</code> и на элементы, которые должны растягиваться под контент.
          Оборачивайте конкретную ячейку сетки или панель.
        </div>
      </Section>

      <Section title="Прогресс чтения">
        <p>
          Полоса сверху этой страницы — <code>.scroll-progress</code>. Ширина берётся из{' '}
          <code>animation-timeline: scroll()</code>: анимация привязана не ко времени, а к позиции
          прокрутки, и считается вне главного потока — никакого{' '}
          <code>addEventListener('scroll')</code>.
        </p>
        <Code
          code={`<body>
  <div class="scroll-progress primary"></div>
  …
</body>`}
        />
        <p>
          Класс палитры (<code>primary</code>, <code>success</code> и т.д.) задаёт цвет,{' '}
          <code>--lf-scroll-progress-height</code> — толщину.
        </p>
        <div class="docs-note">
          <strong>Где не поддерживается</strong>
          Полоса стоит на нуле — то есть её просто не видно, ничего не ломается. Если прогресс нужен
          всем браузерам, задайте <code>--lf-scroll-progress</code> (0…1) из обработчика скролла: там,
          где CSS-таймлайн есть, приоритет остаётся у анимации, поэтому оба механизма можно включить
          одновременно и без ветвлений.
        </div>
        <Code
          code={`// Необязательный фолбэк для браузеров без animation-timeline
if (!CSS.supports('animation-timeline: scroll()')) {
  const bar = document.querySelector('.scroll-progress');

  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--lf-scroll-progress', max > 0 ? scrollY / max : 0);
  }, { passive: true });
}`}
        />
        <Aside>
          <span id="docsScrollSupport"></span>
        </Aside>
      </Section>

      <Section title="Что уже используется в ките">
        <p>
          Эти возможности не требуют отдельного класса — они внутри компонентов, и знать о них нужно
          только при отладке.
        </p>
        <ApiTable
          columns={['Возможность', 'Где', 'Что даёт']}
          rows={[
            [
              'Логические свойства',
              'Все компоненты',
              <>
                <code>inset-inline-start</code> вместо <code>left</code> — RTL работает без второй
                таблицы стилей
              </>,
            ],
            [
              c('@layer'),
              'Сборка CSS',
              'Порядок слоёв фиксирован: утилиты всегда перебивают компоненты, независимо от специфичности',
            ],
            [
              c(':focus-visible'),
              'Кнопки, segmented, quantity',
              'Кольцо фокуса — только при клавиатурной навигации',
            ],
            [
              c('prefers-reduced-motion'),
              'Toast, spinner, stepper, OTP, copy',
              'Анимации отключаются по системной настройке',
            ],
            [
              c('color-scheme'),
              <a href="dark-mode.html">Тёмная тема</a>,
              'Нативные контролы и скроллбары в тон теме',
            ],
            [
              'Топ-слой (dialog, popover)',
              <>
                <a href="modal.html">Modal</a>, <a href="popover.html">Popover</a>
              </>,
              <>
                Ничего не перекрывает всплывающий слой — <code>z-index</code> больше не нужен
              </>,
            ],
          ]}
        />
        <p>
          Минимальные версии браузеров для каждой строки — на странице{' '}
          <a href="support.html">поддержка браузерами</a>.
        </p>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            <code>.query-container</code> на ячейке сетки, а не на <code>body</code> — один компонент
            в сайдбаре и в main.
          </li>
          <li>
            Scroll-progress + JS-fallback через <code>--lf-scroll-progress</code> — один бар для всех
            браузеров.
          </li>
          <li>
            Container queries для карточек в модалках и off-canvas — ширина контейнера, не вьюпорт.
          </li>
        </ul>
      </Section>
    </>
  );
}
