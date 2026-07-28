import { Section, When, Demo, Code, Aside, ApiTable, c, Note } from '../components/primitives.jsx';

export default function DarkModePage() {
  return (
    <>
      <Section title="Как это устроено">
        <p>
          Светлые значения токенов объявлены в <code>:root</code>. Тёмные лежат в{' '}
          <code>scss/settings/css-variables/_dark.scss</code> и применяются в двух случаях:
        </p>
        <ul>
          <li>
            <code>@media (prefers-color-scheme: dark)</code> — системная настройка ОС, если документ
            явно не выбрал светлую (<code>[data-theme='light']</code>);
          </li>
          <li>
            <code>[data-theme='dark']</code> на любом элементе, обычно на <code>&lt;html&gt;</code>.
          </li>
        </ul>
        <p>
          Переопределяются только поверхности, текст и границы. Палитра (
          <code>--lf-color-primary</code> и её <code>-contrast</code>-вариации) остаётся той же,
          поэтому кнопки, бейджи и callout сохраняют брендовые цвета в обеих схемах.
        </p>
        <Code
          code={`/* Ничего подключать не нужно: тёмные токены уже в dist/*.css */

/* Своё переопределение — тем же способом */
[data-theme='dark'] {
  --lf-card-bg: #11161d;
  --lf-anchor-color: #8ecbff;
}`}
        />
        <div class="docs-note">
          <strong>
            <code>color-scheme</code> обязателен
          </strong>{' '}
          Тёмные токены выставляют <code>color-scheme: dark</code>. Без него браузер красит
          скроллбары, чекбоксы и автозаполнение по светлой схеме — самый заметный признак
          «недоделанной» тёмной темы.
        </div>
      </Section>

      <Section title="Переключатель (scripts.theme)">
        <p>
          Модуль пишет атрибут на <code>&lt;html&gt;</code> и запоминает выбор в{' '}
          <code>localStorage</code> под ключом <code>lf-theme</code>. Разметка — обычные кнопки, всё
          остальное модуль делает сам: <code>aria-pressed</code>, подмена подписи, синхронизация при
          смене системной темы в режиме <code>auto</code>.
        </p>
        <Demo>
          <p>
            <button
              class="button"
              type="button"
              data-theme-toggle
              data-theme-label-light="Тёмная тема"
              data-theme-label-dark="Светлая тема"
            >
              Тёмная тема
            </button>
          </p>
          <div class="segmented">
            <label class="segmented-item">
              <input type="radio" name="docsThemeMode" value="light" data-docs-theme-radio />
              <span>Светлая</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsThemeMode" value="dark" data-docs-theme-radio />
              <span>Тёмная</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsThemeMode" value="auto" data-docs-theme-radio checked />
              <span>Авто</span>
            </label>
          </div>
          <p class="docs-aside" id="docsThemeStatus" style={{ marginTop: '0.75rem' }} />
        </Demo>
        <Code
          code={`<!-- Тумблер: подпись меняется сама -->
<button class="button" type="button" data-theme-toggle
        data-theme-label-light="Тёмная тема"
        data-theme-label-dark="Светлая тема">Тёмная тема</button>

<!-- Или три состояния -->
<button type="button" data-theme-set="light">Светлая</button>
<button type="button" data-theme-set="dark">Тёмная</button>
<button type="button" data-theme-set="auto">Авто</button>`}
        />
        <ApiTable
          columns={['Атрибут', 'Что делает']}
          rows={[
            [
              c('data-theme-toggle'),
              'Переключает светлую ⇄ тёмную относительно того, что на экране',
            ],
            [
              c('data-theme-set="light|dark|auto"'),
              'Фиксирует режим; auto снимает атрибут и возвращает управление ОС',
            ],
            [
              c('data-theme-label-light') + ' / ' + c('data-theme-label-dark'),
              'Подписи тумблера для текущей схемы — модуль подставляет нужную',
            ],
          ]}
        />
      </Section>

      <Section title="JS API">
        <p>
          Все методы статические — инстанс не нужен, ссылку на модуль держать не надо. Класс лежит
          в <code>js/modules/theme.js</code>.
        </p>
        <ApiTable
          columns={['Метод', 'Возвращает', 'Зачем']}
          rows={[
            [c('Theme.mode()'), c("'light' | 'dark' | 'auto'"), 'Выбор пользователя. auto, если он ничего не выбирал'],
            [c('Theme.resolved()'), c("'light' | 'dark'"), 'Что реально отрисовано сейчас — с учётом системной настройки'],
            [
              c('Theme.set(mode, options?)'),
              c('mode'),
              'Задать режим. { persist: false } — не писать в localStorage, { silent: true } — не стрелять событием',
            ],
            [c('Theme.toggle()'), c('mode'), 'Инвертировать текущую схему (из auto уходит в явный режим)'],
          ]}
        />
        <Code
          code={`import { Theme } from 'lite-foundation/js/modules/theme.js';

Theme.set('dark');            // включить тёмную и запомнить
Theme.set('auto');            // отдать управление ОС
Theme.toggle();               // инвертировать то, что на экране
Theme.mode();                 // 'dark' | 'light' | 'auto'
Theme.resolved();             // 'dark' | 'light'

// Без импорта — командные события на document
document.dispatchEvent(new CustomEvent('lf:theme:set', { detail: { mode: 'dark' } }));
document.dispatchEvent(new CustomEvent('lf:theme:toggle'));

// Реакция на смену темы: перерисовать canvas, карту, встроенный редактор
document.addEventListener('changed.lf.theme', (event) => {
  const { mode, resolved } = event.detail;   // mode: выбор, resolved: что на экране
  chart.setTheme(resolved);
});`}
        />
      </Section>

      <Section title="Документация и --docs-*">
        <p>
          Chrome документации (сайдбар, карточки, code blocks) живёт на отдельных переменных{' '}
          <code>--docs-*</code> в <code>docs/assets/docs.css</code>. Они переключаются тем же
          правилом, что и кит: <code>[data-theme='dark']</code> и{' '}
          <code>prefers-color-scheme</code> (если нет явного light). Поэтому переключатель в шапке
          docs меняет и компоненты, и оформление справочника — без «белого сайдбара на тёмной
          странице».
        </p>
        <Note tone="warn">
          <strong>Не хардкодьте #fff в docs-chrome</strong>
          Любой новый блок в документации должен брать{' '}
          <code>var(--docs-surface-raised)</code> / <code>var(--docs-ink)</code>, иначе тема снова
          разъедется.
        </Note>
      </Section>

      <Section title="Мигание при загрузке">
        <p>
          Модуль применяет сохранённый выбор вместе с бандлом страницы — то есть на кадр позже
          первой отрисовки. Если выбор расходится с системной темой, пользователь увидит вспышку.
          Лечится инлайн-скриптом в <code>&lt;head&gt;</code> до стилей (эта страница так и делает):
        </p>
        <Code
          code={`<head>
  <script>
    try {
      const mode = localStorage.getItem('lf-theme');
      if (mode === 'dark' || mode === 'light') {
        document.documentElement.setAttribute('data-theme', mode);
      }
    } catch {}
  </script>
  <link rel="stylesheet" href="/dist/app.css">
</head>`}
        />
        <Aside>
          Ключ и значения совпадают с тем, что пишет модуль, поэтому дублирования логики нет: скрипт
          лишь ускоряет применение уже сохранённого выбора.
        </Aside>
      </Section>

      <Section title="Свои компоненты в тёмной теме">
        <div class="docs-note">
          <strong>Правило одно: не хардкодить цвета</strong>
          <ul>
            <li>
              Фон панели — <code>var(--lf-card-bg)</code>, не <code>#fff</code>.
            </li>
            <li>
              Текст — <code>var(--lf-body-color)</code>, границы —{' '}
              <code>var(--lf-color-light-gray)</code>.
            </li>
            <li>
              Полупрозрачные слои — <code>var(--lf-overlay-soft)</code> и соседние токены: они
              разные в двух схемах, потому что чёрный на 6% поверх тёмного фона не виден.
            </li>
          </ul>
        </div>
        <p>
          Проверить, что цвет не потерялся, помогает <code>npm run lint:tokens</code> — он ищет
          литеральные цвета в SCSS компонентов.
        </p>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Слушай <code>changed.lf.theme</code> для canvas/chart/map — перекрась при{' '}
            <code>resolved</code>.
          </li>
          <li>
            Инлайн-скрипт в <code>&lt;head&gt;</code> на production — без мигания при сохранённом
            выборе.
          </li>
          <li>
            Свои поверхности — только через <code>var(--lf-*)</code>, не hex в компонентах.
          </li>
        </ul>
      </Section>
    </>
  );
}
