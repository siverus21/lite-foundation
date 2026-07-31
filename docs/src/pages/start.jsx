import { Section, Code, Aside } from '../components/primitives.jsx';

export default function StartPage() {
  return (
    <>
      <Section title="Установка">
        <p>
          Нужны Node.js 18+ и npm. Индексы SCSS появляются при старте / sync / build. CSS/JS entry —
          virtual (<code>virtual:lf-scss/…</code>, <code>virtual:lf-entry/…</code>) через{' '}
          <code>/js/load-build.js?build=…</code>. Добавляешь компонент или страницу docs — см.{' '}
          <a href="authoring.html">Авторство</a>.
        </p>
        <Code
          code={`git clone https://github.com/siverus21/lite-foundation.git
cd lite-foundation
npm install
npm run start`}
        />
        <div class="docs-note">
          <strong>Что откроется</strong>
          <ul>
            <li>
              Kitchen-sink: <code>http://localhost:5173/</code> (<code>index.html</code>)
            </li>
            <li>
              Документация: <code>/docs/</code>
            </li>
            <li>
              Production-артефакты: <code>npm run build</code> → плоский <code>dist/</code>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Подключение (production)">
        <p>
          После <code>npm run build</code> копируй нужные файлы из <code>dist/</code> в свой проект
          (или ссылайся на них с CDN/static-сервера). Page-бандл обязателен; library — по
          необходимости.
        </p>
        <Code
          code={`<link rel="stylesheet" href="path/to/dist/app.css">
<script type="module" src="path/to/dist/lib.js"></script>

<!-- опционально: Swiper (library build) -->
<link rel="stylesheet" href="path/to/dist/lib-swiper.css">
<script type="module" src="path/to/dist/lib-swiper.js"></script>`}
        />
        <Aside>
          Порядок: сначала page CSS/JS, потом library. Иначе addon-слой может перекрыть базовый
          неправильно или модули инициализируются до DOM, который они ждут.
        </Aside>
      </Section>

      <Section title="Подключение (dev / Vite)">
        <p>
          В HTML оставляй <code>&lt;link&gt;</code> на собранный <code>dist/*.css</code> — он
          render-blocking и даёт стили с первого кадра. Entry дополнительно импортирует Sass только
          для HMR и <strong>не</strong> отключает dist-link.
        </p>
        <Code
          code={`<link rel="stylesheet" href="dist/app.css">
<script type="module" src="/js/load-build.js?build=full"></script>`}
        />
        <Aside>
          После правок SCSS в DEV сработает HMR; для production снова <code>npm run build</code>,
          чтобы обновить <code>dist/</code>.
        </Aside>
      </Section>

      <Section title="Feature-флаги">
        <p>
          Единый источник правды — <code>config/features.js</code>. Выключенный флаг не попадает в
          SCSS/JS entry соответствующего билда. Меняешь флаги → <code>npm run sync:features</code> или
          просто <code>npm run start</code> (плагин синхронизирует сам).
        </p>
        <Code
          code={`export default {
  vendors: { cash: false, swiper: false, animate: true },
  styles: { modal: true, button: true /* … */ },
  scripts: { modal: true, tabs: true /* … */ },
};`}
        />
        <div class="docs-note">
          <strong>Правило</strong>
          <ul>
            <li>
              Стили и скрипты включай парами, если компоненту нужен JS (modal, tabs, offcanvas…)
            </li>
            <li>
              Чисто презентационные (button, callout, card) — только <code>styles.*</code>
            </li>
            <li>
              Тяжёлые vendors лучше выносить в <code>builds.*.kind: 'library'</code> — см.{' '}
              <a href="builds.html">Builds</a>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Добавь свой page-билд в <code>builds</code> для шаблона CMS — см.{' '}
            <a href="builds.html">Builds</a>.
          </li>
          <li>
            Переопредели токены на <code>:root</code> без пересборки — см.{' '}
            <a href="tokens.html">Токены</a>.
          </li>
          <li>
            После AJAX-вставки HTML вызывай <code>refreshModules</code> — см.{' '}
            <a href="lifecycle.html">JS API</a>.
          </li>
        </ul>
      </Section>
    </>
  );
}
