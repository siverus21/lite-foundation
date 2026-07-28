import { Section, Demo, Code, Aside } from '../components/primitives.jsx';

export default function TestingPage() {
  return (
    <>
      <Section title="Запуск">
        <Code
          code={`npm test              # один прогон
npm run test:watch    # watch-режим
npm run test:coverage # + отчёт покрытия (text + html в coverage/)`}
        />
        <Aside>
          <code>npm run build</code> сам гоняет <code>lint:tokens</code> в строгом режиме (падает
          на хардкод-цветах/z-index в компонентах) — это отдельная проверка, не часть{' '}
          <code>npm test</code>.
        </Aside>
      </Section>

      <Section title="Что покрыто">
        <Demo>
          <ul>
            <li>
              <code>js/core/</code> — <code>Module</code> (lazy mount + <code>data-lf-lazy</code>,
              включая fallback на элементах без бокса), <code>runtime</code> (init/destroy/refresh/unmount),{' '}
              <code>scroll-lock</code>, <code>global-events</code> (общий Escape-диспетчер)
            </li>
            <li>
              <code>js/modules/*</code> — по файлу на модуль (modal, tabs, accordion, dropdown,
              offcanvas, menu-dropdown/accordion/drilldown, form-slider, …)
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
          <code>lint-tokens.js</code>) туда сознательно не входят, это I/O-обвязка, а не логика.
        </Aside>
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
          и билд сообщат об этом явно. См.{' '}
          <a href="lifecycle.html#свой-модуль">Свой модуль</a>.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Новый модуль — тест рядом с файлом в <code>js/modules/</code>, плюс запись в sync-features.
          </li>
          <li>
            CI: <code>npm test</code> + <code>npm run build</code> (lint:tokens внутри build).
          </li>
          <li>
            Coverage HTML в <code>coverage/</code> — смотри пробелы перед рефакторингом runtime.
          </li>
        </ul>
      </Section>
    </>
  );
}
