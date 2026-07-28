import { Section } from '../components/primitives.jsx';

export default function IndexPage() {
  return (
    <>
      <Section title="Зачем этот репозиторий">
        <p>
          Нужен лёгкий Foundation-подобный стек без тяжёлого <code>foundation-sites</code>: сетка,
          формы, модалки, меню — и возможность вырезать неиспользуемое из бандла.
        </p>
        <div class="docs-note">
          <strong>Типичный сценарий</strong>
          <ul>
            <li>Лендинг / корпоративный сайт на статике или CMS</li>
            <li>Несколько шаблонов с разным набором компонентов (page builds)</li>
            <li>Тяжёлые vendor-аддоны (Swiper) отдельным library-бандлом</li>
          </ul>
        </div>
        <p class="docs-meta">
          Документация на JSX (Preact только в <code>docs/</code>): шрифты Syne + Outfit, teal-акцент,
          тема светлая/тёмная синхронизирована с китом. В шапке — переключатель темы.
        </p>
      </Section>

      <Section title="Начать">
        <div class="docs-grid">
          <a class="docs-card" href="start.html">
            <span class="docs-card-eyebrow">Старт</span>
            <h3>Быстрый старт</h3>
            <p>
              Установка, <code>npm run start</code> / <code>npm run build</code>, подключение CSS/JS.
            </p>
          </a>
          <a class="docs-card" href="builds.html">
            <span class="docs-card-eyebrow">Сборка</span>
            <h3>Named &amp; library builds</h3>
            <p>
              Как устроены <code>app.css</code>, <code>app-about</code>, <code>lib-swiper</code>.
            </p>
          </a>
          <a class="docs-card" href="tokens.html">
            <span class="docs-card-eyebrow">Дизайн</span>
            <h3>Дизайн-токены</h3>
            <p>
              Переменные <code>--lf-*</code>, тема без пересборки.
            </p>
          </a>
          <a class="docs-card" href="dark-mode.html">
            <span class="docs-card-eyebrow">Тема</span>
            <h3>Тёмная тема</h3>
            <p>
              Переключатель в шапке docs, <code>--docs-*</code> + <code>--lf-*</code>, anti-flash.
            </p>
          </a>
          <a class="docs-card" href="support.html">
            <h3>Поддержка браузерами</h3>
            <p>Что и с какой версии работает, где нужен фолбэк.</p>
          </a>
          <a class="docs-card" href="lifecycle.html">
            <h3>JS lifecycle</h3>
            <p>
              <code>init</code> / <code>destroy</code> / <code>refresh</code> после AJAX.
            </p>
          </a>
          <a class="docs-card" href="testing.html">
            <h3>Тесты</h3>
            <p>Vitest, покрытие, guard от «тихих» опечаток в feature-флагах.</p>
          </a>
        </div>
      </Section>

      <Section title="Компоненты">
        <p class="docs-meta">
          Каждая страница: зачем нужен, когда ставить, флаги, разметка, ограничения.
        </p>
        <div class="docs-grid">
          <a class="docs-card" href="button.html">
            <h3>Button</h3>
            <p>CTA, действия в формах и тулбарах.</p>
          </a>
          <a class="docs-card" href="forms.html">
            <h3>Forms</h3>
            <p>Поля, custom checkbox/radio, switch, range-slider.</p>
          </a>
          <a class="docs-card" href="modal.html">
            <h3>Modal</h3>
            <p>Диалоги подтверждения и формы поверх страницы.</p>
          </a>
          <a class="docs-card" href="popover.html">
            <h3>Popover</h3>
            <p>Панель у кнопки на нативном <code>popover</code>.</p>
          </a>
          <a class="docs-card" href="tabs.html">
            <h3>Tabs</h3>
            <p>Переключение панелей без смены URL.</p>
          </a>
          <a class="docs-card" href="segmented.html">
            <h3>Segmented</h3>
            <p>Выбор значения одним контролом, без JS.</p>
          </a>
          <a class="docs-card" href="accordion.html">
            <h3>Accordion</h3>
            <p>FAQ, длинные блоки «показать ещё».</p>
          </a>
          <a class="docs-card" href="dropdown.html">
            <h3>Dropdown</h3>
            <p>Всплывающие панели и tooltip.</p>
          </a>
          <a class="docs-card" href="offcanvas.html">
            <h3>Off-canvas</h3>
            <p>Мобильное меню / боковой drawer.</p>
          </a>
          <a class="docs-card" href="menus.html">
            <h3>Menus</h3>
            <p>Навигация: dropdown, accordion, drilldown.</p>
          </a>
          <a class="docs-card" href="slider.html">
            <h3>Slider</h3>
            <p>Карусель через library-бандл Swiper.</p>
          </a>
          <a class="docs-card" href="callout-card.html">
            <h3>Callout &amp; Card</h3>
            <p>Статусы, карточки контента.</p>
          </a>
          <a class="docs-card" href="table.html">
            <h3>Table</h3>
            <p>Сортировка, липкий заголовок, стек на мобильных.</p>
          </a>
          <a class="docs-card" href="avatar.html">
            <h3>Avatar</h3>
            <p>Профиль пользователя, инициалы, статус.</p>
          </a>
          <a class="docs-card" href="chip.html">
            <h3>Chip / Tag</h3>
            <p>Фильтры, теги, выбранные значения.</p>
          </a>
          <a class="docs-card" href="spinner.html">
            <h3>Spinner &amp; Skeleton</h3>
            <p>Индикаторы загрузки.</p>
          </a>
          <a class="docs-card" href="toast.html">
            <h3>Toast</h3>
            <p>Всплывающие уведомления в углу экрана.</p>
          </a>
          <a class="docs-card" href="stepper.html">
            <h3>Stepper</h3>
            <p>Прогресс многошагового процесса.</p>
          </a>
          <a class="docs-card" href="timeline.html">
            <h3>Timeline</h3>
            <p>Хронология: статусы заказа, история изменений.</p>
          </a>
          <a class="docs-card" href="rating.html">
            <h3>Rating</h3>
            <p>Звёздный рейтинг, интерактивный и read-only.</p>
          </a>
        </div>
      </Section>

      <Section title="Формы и ввод">
        <p class="docs-meta">
          Поля со своим поведением: настройки атрибутами, события для подписки, методы инстанса.
        </p>
        <div class="docs-grid">
          <a class="docs-card" href="quantity.html">
            <h3>Quantity (+/−)</h3>
            <p>Количество товара: границы, шаг, удержание, дебаунс запросов.</p>
          </a>
          <a class="docs-card" href="combobox.html">
            <h3>Combobox</h3>
            <p>Поиск по списку поверх обычного <code>&lt;select&gt;</code>.</p>
          </a>
          <a class="docs-card" href="tag-input.html">
            <h3>Tag input</h3>
            <p>Мультиселект на чипах, массив в форме.</p>
          </a>
          <a class="docs-card" href="field-extras.html">
            <h3>OTP, счётчик, пароль, copy</h3>
            <p>Четыре мелких модуля поверх нативных элементов.</p>
          </a>
        </div>
      </Section>

      <Section title="UI Kit">
        <div class="docs-grid">
          <a class="docs-card" href="ui-kit.html">
            <h3>Витрина компонентов</h3>
            <p>Все компоненты (старые и новые) с вариантами на одной странице.</p>
          </a>
          <a class="docs-card" href="modern-css.html">
            <h3>Современный CSS</h3>
            <p>Container queries и прогресс чтения на CSS-таймлайне.</p>
          </a>
        </div>
      </Section>

      <footer class="docs-footer">
        <p>
          Песочница: <a href="../index.html">index.html</a> · минимальный бандл:{' '}
          <a href="../about.html">about.html</a>
        </p>
      </footer>
    </>
  );
}
