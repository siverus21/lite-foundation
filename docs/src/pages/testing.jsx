import { Section, Demo, Code, Aside } from '../components/primitives.jsx';

export default function TestingPage() {
  return (
    <>
      <Section title="Запуск">
        <Code
          code={`npm test              # один прогон
npm run test:watch    # watch-режим
npm run test:coverage # + отчёт покрытия (text + html в coverage/)
npm run test:e2e      # build + Playwright smoke (sink + docs)
npm run lint:tokens   # хардкод цвета/z-index в компонентах
npm run check:budget  # размер бандлов dist/ vs бюджет
npm run build         # lint:tokens (strict) + сборка`}
        />
        <Aside>
          <code>npm run build</code> сам гоняет <code>lint:tokens</code> в строгом режиме.{' '}
          <code>check:budget</code> и <code>test:e2e</code> — отдельные шаги (не внутри{' '}
          <code>npm test</code>). E2E поднимает Vite и ждёт <code>dist/*.css</code>.
        </Aside>
      </Section>

      <Section title="Playwright smoke">
        <p>
          Файл <code>e2e/smoke.spec.js</code>: kitchen sink + docs (<code>button</code>,{' '}
          <code>lifecycle</code>, <code>tooltip</code>). Chromium only. Первый раз:{' '}
          <code>npx playwright install chromium</code>.
        </p>
        <Code
          code={`npm run test:e2e
# отчёт/trace при падении — см. playwright-report / trace в конфиге`}
        />
        <Aside>
          Это не визуальная регрессия и не полный a11y CI — только «страница жива, ключевые демо на
          месте». Storybook не используем: канон демо — sink + docs.
        </Aside>
      </Section>

      <Section title="Что покрыто">
        <Demo>
          <ul>
            <li>
              <code>js/core/</code> — <code>Module</code> (lazy mount + <code>data-lf-lazy</code>,
              включая fallback на элементах без бокса), <code>runtime</code> (
              init/destroy/refresh/unmount, <code>createLF</code>, <code>lazySelector</code>),{' '}
              <code>scroll-lock</code>, <code>global-events</code> (общий Escape-диспетчер),{' '}
              <code>i18n</code> (<code>t</code> / <code>setMessages</code>)
            </li>
            <li>
              <code>js/modules/*</code> — по файлу на модуль (modal, tabs, accordion, dropdown,
              offcanvas, menu-*, form-slider, input-recipes, …)
            </li>
            <li>
              <code>tests/a11y.test.js</code> — smoke axe-core: tabs (в т.ч. vertical), accordion,
              rating, modal, otp, tooltip, dropdown, form-control + password/search, breadcrumbs /
              pagination
            </li>
            <li>
              <code>js/boot.js</code> — dev vs prod путь, ожидание stylesheet (
              <code>link.sheet</code> / событие <code>load</code> / <code>error</code> / 2s таймаут),{' '}
              <code>DOMContentLoaded</code> gate
            </li>
            <li>
              <code>config/features.js</code> + <code>scripts/sync-features.js</code> — билд-конфиг и
              генераторы CSS/JS-entry
            </li>
          </ul>
        </Demo>
        <Aside>
          Покрытие настроено только на этот список (<code>vitest.config.js</code> →{' '}
          <code>coverage.include</code>) — CLI-скрипты (<code>scripts/build.js</code>,{' '}
          <code>lint-tokens.js</code>, <code>check-bundle-budget.js</code>) туда сознательно не
          входят, это I/O-обвязка, а не логика.
        </Aside>
      </Section>

      <Section title="i18n">
        <p>
          Каталог строк для chrome UI: <code>js/core/i18n.js</code>. Модули (combobox, copy, …)
          берут лейблы через <code>t('close')</code>. Переопределение — один раз при старте
          приложения.
        </p>
        <Code
          code={`import { t, setMessages } from '/js/core/i18n.js';

setMessages({
  close: 'Закрыть',
  clear: 'Очистить',
  empty: 'Ничего не найдено',
});

closeBtn.setAttribute('aria-label', t('close'));`}
        />
      </Section>

      <Section title="feature-flags-consistency.test.js">
        <p>
          Флаги в <code>styles</code> / <code>scripts</code> / <code>vendors</code> резолвятся в
          конкретные файлы только через карты <code>STYLE_FOLDERS</code> / <code>SCRIPT_MODULES</code>{' '}
          / <code>KNOWN_VENDORS</code> в <code>scripts/sync-features.js</code>. Опечатка или
          переименование ключа в одном месте без другого раньше означало, что CSS/JS компонента
          молча выпадал из бандла — без ошибки где-либо.
        </p>
        <div class="docs-note">
          <strong>Теперь это невозможно тихо</strong>
          <ul>
            <li>
              Генераторы (<code>componentLoads</code>, <code>generateModulesIndex</code>,{' '}
              <code>vendorLoads</code>) бросают ошибку на неизвестном включённом флаге — она свалит{' '}
              <code>npm run dev</code> / <code>npm run build</code> сразу
            </li>
            <li>
              Тест проверяет то же самое статически для <code>full</code>-пресета и каждого билда в{' '}
              <code>builds</code>, плюс что перечисленные файлы модулей существуют на диске
            </li>
          </ul>
        </div>
        <Code
          code={`// Пример ошибки при опечатке во флаге
Error: Unknown script flag "menus" — no entry in SCRIPT_MODULES (scripts/sync-features.js)`}
        />
        <Aside>
          Добавляешь новый компонент? Флаг в <code>config/features.js</code> + запись в{' '}
          <code>STYLE_FOLDERS</code>/<code>SCRIPT_MODULES</code> — обязательно оба сразу, иначе тест
          и билд сообщат об этом явно. Полный гайд — <a href="authoring.html">Авторство</a>; API
          модуля — <a href="lifecycle.html#свой-модуль">Свой модуль</a>.
        </Aside>
      </Section>

      <Section title="a11y.test.js">
        <p>
          Фикстуры намеренно узкие (happy-dom без полного CSS): отключены color-contrast, region,
          document-title и т.п. Цель — ловить сломанные роли/имена/связи после init модуля, не
          заменять browser a11y CI.
        </p>
        <Code
          code={`// Новый виджет → добавь it('…') с разметкой как в docs Demo,
// вызови new Module(document), затем assertNoAxeViolations().`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Новый модуль — тест рядом с файлом в <code>js/modules/</code>, плюс запись в sync-features.
          </li>
          <li>
            CI: <code>npm test</code> + <code>npm run build</code> + <code>npm run check:budget</code>{' '}
            + <code>npm run test:e2e</code>.
          </li>
          <li>
            Coverage HTML в <code>coverage/</code> — смотри пробелы перед рефакторингом runtime.
          </li>
          <li>
            Новая aria-строка в модуле — ключ в <code>i18n.js</code> defaults + кейс в{' '}
            <code>a11y.test.js</code>.
          </li>
        </ul>
      </Section>
    </>
  );
}
