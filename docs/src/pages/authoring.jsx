import { Section, Code, Aside, Note, Meta } from '../components/primitives.jsx';

export default function AuthoringPage() {
  return (
    <>
      <Section title="Чеклист">
        <ol>
          <li>
            Стили: <code>scss/settings/…</code> + <code>scss/components/…</code> + флаг{' '}
            <code>styles.*</code>
          </li>
          <li>
            (Опционально) JS: <code>js/modules/….js</code> + флаг <code>scripts.*</code>
          </li>
          <li>
            Карты в <code>scripts/sync-features.js</code> (
            <code>STYLE_FOLDERS</code> / <code>SCRIPT_MODULES</code>)
          </li>
          <li>
            Тесты в <code>tests/</code> (+ axe smoke при интерактивной a11y)
          </li>
          <li>
            Docs: HTML + entry + page + пункт в <code>nav.js</code> (+ карточка на обзоре)
          </li>
          <li>
            Проверка: <code>npm test</code> · <code>npm run build</code> · демо в sink / docs
          </li>
        </ol>
        <Aside>
          Ключи <code>styles.*</code> / <code>scripts.*</code> держи в алфавитном порядке — и в{' '}
          <code>config/features.js</code>, и в картах sync-features.
        </Aside>
      </Section>

      <Section title="1. CSS-компонент">
        <Meta>
          Имена: один корневой класс на папку (<code>.chip</code>), элементы плоско (
          <code>.chip-close</code>), состояния <code>.is-*</code>, поведение на <code>data-*</code>.
          Подробно — <code>_naming.scss</code>.
        </Meta>
        <p>Минимальный набор файлов (пример <code>status-pill</code>):</p>
        <Code
          title="Дерево"
          code={`scss/settings/status-pill/_status-pill.scss   # Sass-токены / maps
scss/settings/status-pill/_index.scss         # @forward 'status-pill';
scss/components/status-pill/_status-pill.scss # стили на var(--lf-…)
scss/components/status-pill/_index.scss       # @forward 'status-pill';`}
        />
        <Code
          title="scss/components/status-pill/_status-pill.scss"
          code={`@use '../../settings/vars' as *;

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--lf-radius-small, 0.35rem);
  background: var(--lf-color-primary);
  color: var(--lf-color-primary-contrast);
}

.status-pill.is-muted {
  background: var(--lf-color-secondary);
}`}
        />
        <Note tone="warn">
          В компонентах — только <code>var(--lf-…)</code> для цвета / z-index / теней. Сырой{' '}
          <code>#hex</code> валит <code>lint:tokens</code> на <code>npm run build</code>. Токен
          заводи в settings и эмить в <code>settings/css-variables</code>.
        </Note>
        <p>Регистрация:</p>
        <Code
          code={`// scripts/sync-features.js — STYLE_FOLDERS (алфавит)
statusPill: 'status-pill',

// config/features.js — styles (алфавит) + при необходимости builds.*
styles: {
  …,
  statusPill: true,
},`}
        />
        <Aside>
          Папка на диске — kebab (<code>status-pill</code>), ключ флага — camelCase (
          <code>statusPill</code>), как у <code>mediaObject</code> / <code>tagInput</code>.
        </Aside>
      </Section>

      <Section title="2. JS-модуль">
        <p>
          База — <code>js/core/Module.js</code>. Публичный контракт: события{' '}
          <code>name.lf.&lt;id&gt;</code>, команды <code>lf:&lt;id&gt;:action</code>. См.{' '}
          <a href="lifecycle.html#свой-модуль">Свой модуль</a>.
        </p>
        <Code
          title="js/modules/status-pill.js"
          code={`import { Module } from '../core/Module.js';

export class StatusPill extends Module {
  static id = 'status-pill';
  /** Skip-init, если в root нет хостов (не code-split) */
  static lazySelector = '[data-status-pill]';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-status-pill]', (el) => {
      this.on(el, 'click', () => this.emit(el, 'clicked'));
      this.commands(el, {
        dismiss: () => {
          el.remove();
          this.emit(el, 'dismissed');
        },
      });
    });
  }
}`}
        />
        <Code
          title="Регистрация"
          code={`// scripts/sync-features.js — SCRIPT_MODULES
statusPill: {
  file: __modulesPath + '/status-pill.js',
  className: 'StatusPill',
},

// config/features.js — scripts
scripts: {
  …,
  statusPill: true,
},`}
        />
        <ul>
          <li>
            Слушатели только через <code>this.on</code> / <code>onEscape</code> — уйдут в{' '}
            <code>destroy()</code>
          </li>
          <li>
            Не инжектируй <code>tabindex="0"</code> без нужды (см. Tooltip)
          </li>
          <li>
            Строки chrome UI — через <code>t()</code> из <code>js/core/i18n.js</code>
          </li>
          <li>
            Overlays: резолви цели через <code>getRootNode()</code>, null-guard на отсутствующий id
          </li>
        </ul>
      </Section>

      <Section title="3. Тесты">
        <p>
          Vitest + happy-dom. Файл рядом по теме: <code>tests/status-pill.test.js</code>. Запуск:{' '}
          <code>npm test -- tests/status-pill.test.js</code>.
        </p>
        <Code
          title="tests/status-pill.test.js"
          code={`import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StatusPill } from '../js/modules/status-pill.js';

describe('StatusPill', () => {
  beforeEach(() => {
    document.body.innerHTML = \`
      <button type="button" class="status-pill" data-status-pill>New</button>
    \`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('emits clicked.lf.status-pill', () => {
    const mod = new StatusPill(document);
    const el = document.querySelector('[data-status-pill]');
    const hits = [];
    el.addEventListener('clicked.lf.status-pill', () => hits.push(1));

    el.click();
    expect(hits).toEqual([1]);
    expect(el.hasAttribute('data-status-pill-ready')).toBe(true);

    mod.destroy();
  });

  it('dismiss command removes the host', () => {
    const mod = new StatusPill(document);
    const el = document.querySelector('[data-status-pill]');
    el.dispatchEvent(new CustomEvent('lf:status-pill:dismiss'));
    expect(document.querySelector('[data-status-pill]')).toBeNull();
    mod.destroy();
  });
});`}
        />
        <p>
          <strong>Правила</strong>
        </p>
        <ul>
          <li>
            В <code>afterEach</code> — <code>destroy()</code> и очистка <code>body</code>
          </li>
          <li>
            Ассерты на публичные сигналы: DOM-атрибуты, классы, события — не на приватные{' '}
            <code>_foo</code>
          </li>
          <li>
            Интерактивный виджет с ролями — добавь кейс в <code>tests/a11y.test.js</code> (axe
            smoke; color-contrast там выключен)
          </li>
          <li>
            Новый флаг — попадёт под <code>feature-flags-consistency.test.js</code> автоматически
          </li>
        </ul>
        <Aside>
          Подробнее про покрытие, budget и e2e — <a href="testing.html">testing.html</a>.
        </Aside>
      </Section>

      <Section title="4. Страница документации">
        <p>Четыре артефакта + навигация.</p>

        <h3>4.1 HTML-оболочка</h3>
        <p>
          Скопируй соседний файл (например <code>docs/toast.html</code>) →{' '}
          <code>docs/status-pill.html</code>. Поменяй <code>&lt;title&gt;</code> и путь к entry:
        </p>
        <Code
          code={`<script type="module" src="./src/entries/status-pill.jsx"></script>`}
        />

        <h3>4.2 Entry</h3>
        <Code
          title="docs/src/entries/status-pill.jsx"
          code={`import { mountDocs } from '../mount.jsx';
import StatusPillPage from '../pages/status-pill.jsx';

mountDocs({
  file: 'status-pill.html',       // = пункт nav + PAGE_FEATURES
  title: 'Status pill',
  kicker: 'Component',            // Component | Guide | UI Kit …
  lead: (
    <>
      Короткий статус-бейдж. Только CSS; опционально <code>scripts.statusPill</code>.
    </>
  ),
  flags: ['styles.statusPill', 'scripts.statusPill'], // бейджи под заголовком
  Page: StatusPillPage,
  // build: 'full',              // по умолчанию
  // extraBuilds: ['swiper'],    // library-аддоны
  // onReady() { … }             // демо-хуки после initModules
});`}
        />

        <h3>4.3 Содержимое страницы</h3>
        <p>
          Компоненты из <code>docs/src/components/primitives.jsx</code>. Рекомендуемый каркас:
        </p>
        <Code
          title="docs/src/pages/status-pill.jsx"
          code={`import {
  Section, When, Demo, Code, Aside, Meta, Anatomy, ApiTable, c,
} from '../components/primitives.jsx';

export default function StatusPillPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={['Короткий статус рядом с сущностью']}
          bad={['Длинный текст — <a href="callout-card.html">Callout</a>']}
        />
      </Section>

      <Section title="Анатомия">
        <Anatomy rows={[
          { part: '.status-pill', detail: 'Корень' },
          { part: '.is-muted', detail: 'Приглушённый вид' },
        ]} />
      </Section>

      <Section title="Разметка">
        <Meta>Флаги: <code>styles.statusPill</code>.</Meta>
        <Demo>
          <span class="status-pill">New</span>{' '}
          <span class="status-pill is-muted">Draft</span>
        </Demo>
        <Code
          code={\`<span class="status-pill">New</span>
<span class="status-pill is-muted">Draft</span>\`}
        />
      </Section>

      <Section title="События и команды">
        <ApiTable
          columns={['Имя', 'Где', 'detail']}
          rows={[
            [c('clicked.lf.status-pill'), 'на хосте', '—'],
            [c('lf:status-pill:dismiss'), 'на хосте', 'удаляет элемент'],
          ]}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>Связка с chip / badge — не плодить третий похожий примитив.</li>
        </ul>
      </Section>
    </>
  );
}`}
        />
        <div class="docs-note">
          <strong>Примитивы</strong>
          <ul>
            <li>
              <code>Section</code> — <code>h2</code> + якорь (slug из title)
            </li>
            <li>
              <code>When</code> — good/bad; внутри строк допускается HTML (
              <code>&lt;code&gt;</code>, <code>&lt;a&gt;</code>), но не JSX внутри кавычек (
              строка должна быть цельной)
            </li>
            <li>
              <code>Demo</code> — живая разметка для модулей билда
            </li>
            <li>
              <code>Code</code> — копируемый сниппет; опционально <code>title</code>
            </li>
            <li>
              <code>ApiTable</code> + <code>c()</code> — события/атрибуты моноширинно
            </li>
            <li>
              <code>Aside</code> / <code>Note</code> / <code>Meta</code> — пояснения
            </li>
          </ul>
        </div>

        <h3>4.4 Навигация и обзор</h3>
        <Code
          code={`// docs/src/nav.js — группа «Компоненты» (или «Формы и ввод» / «Начать»)
{ href: 'status-pill.html', title: 'Status pill' },

// docs/src/pages/index.jsx — карточка в нужной секции
<a class="docs-card" href="status-pill.html">
  <h3>Status pill</h3>
  <p>Короткий статус-бейдж.</p>
</a>`}
        />
        <p>
          Опционально: deep-link секция в <a href="ui-kit.html">ui-kit.html</a>, пример в{' '}
          <code>index.html</code> (kitchen sink), строка в{' '}
          <code>docs/assets/support-data.js</code> → <code>PAGE_FEATURES</code>, если страница
          зависит от конкретного platform API.
        </p>
        <Aside>
          Новый build-name? Добавь <code>case</code> в <code>loadBuild()</code> внутри{' '}
          <code>docs/src/mount.jsx</code> (статический <code>import</code>, как в{' '}
          <code>js/load-build.js</code>).
        </Aside>
      </Section>

      <Section title="5. Проверка перед merge">
        <Code
          code={`npm test
npm run build
npm run check:budget   # после заметного роста бандла
npm run start          # docs/status-pill.html + sink`}
        />
        <ul>
          <li>Demo на docs-странице реально инициализируется (флаги в full-билде)</li>
          <li>
            Нет хардкод-цветов; consistency-тест зелёный
          </li>
          <li>
            Текст страницы: зачем / когда / разметка / API / ограничения — без копипасты из README
          </li>
        </ul>
      </Section>
    </>
  );
}
