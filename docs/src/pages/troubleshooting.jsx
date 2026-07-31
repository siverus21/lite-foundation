import { Section, Code, Aside, Note } from '../components/primitives.jsx';

export default function TroubleshootingPage() {
  return (
    <>
      <Section title="Сборка падает на неизвестном флаге">
        <p>
          Генераторы бросают ошибку, если ключ в <code>config/features.js</code> не найден в{' '}
          <code>STYLE_FOLDERS</code> / <code>SCRIPT_MODULES</code> / <code>KNOWN_VENDORS</code>.
        </p>
        <Code
          code={`Error: Unknown script flag "menus" — no entry in SCRIPT_MODULES (scripts/sync-features.js)`}
        />
        <ul>
          <li>
            Проверь опечатку / старое имя Foundation (<code>menus</code> →{' '}
            <code>menuDropdown</code> и т.п.).
          </li>
          <li>
            Новый компонент: флаг в <code>features.js</code> <strong>и</strong> запись в карте{' '}
            <code>scripts/sync-features.js</code>.
          </li>
          <li>
            Статическая проверка: <code>npm test -- tests/feature-flags-consistency.test.js</code>
          </li>
        </ul>
      </Section>

      <Section title="lint:tokens / build: хардкод цвета или z-index">
        <p>
          В компонентах нельзя писать сырые <code>#hex</code> / <code>z-index: 99</code> — только{' '}
          <code>var(--lf-…)</code>. Dev-сервер предупреждает; <code>npm run build</code> падает.
        </p>
        <ul>
          <li>
            Добавь токен в <code>scss/settings/</code> → эмит в{' '}
            <code>settings/css-variables</code>.
          </li>
          <li>
            Локально: <code>npm run lint:tokens</code>
          </li>
        </ul>
      </Section>

      <Section title="Стили есть в sink, нет в page-бандле">
        <p>
          Page-билд (<code>about</code> и т.д.) включает только то, что перечислено в{' '}
          <code>builds</code>. Full-пресет ≠ каждый named build.
        </p>
        <Code
          code={`// config/features.js — named build
about: {
  styles: { button: true, callout: true, card: true },
  utilities: true,
}`}
        />
        <Aside>
          Проверь флаги на странице docs (бейджи под заголовком) и{' '}
          <a href="builds.html">builds.html</a>.
        </Aside>
      </Section>

      <Section title="Модуль «не оживает» после AJAX / SPA">
        <ul>
          <li>
            После вставки HTML: <code>refreshModules(container)</code> или{' '}
            <code>createLF(container)</code> — см. <a href="lifecycle.html">JS API</a>.
          </li>
          <li>
            <code>destroyModules</code> не удаляет разметку — только listeners.
          </li>
          <li>
            <code>static lazySelector</code>: если в root нет совпадений, инстанс не создаётся
            (это нормально).
          </li>
          <li>
            Не вешай <code>data-lf-lazy</code> на скрытый корень (
            <code>display: none</code> / закрытый dialog) — observer не отложит init полезно.
          </li>
        </ul>
      </Section>

      <Section title="Overlay / dropdown не находит панель">
        <ul>
          <li>
            Id в <code>data-dropdown-open</code> / <code>data-dialog-open</code> должен совпадать с{' '}
            <code>id</code> панели.
          </li>
          <li>
            Панель должна быть в том же document / shadow root, что и триггер (резолв через{' '}
            <code>getRootNode()</code>).
          </li>
          <li>
            Отсутствующий id — no-op, без throw (смотри <code>aria-expanded</code>).
          </li>
        </ul>
      </Section>

      <Section title="Docs без стилей / «ломаный» layout">
        <p>
          Страницы docs линкуют <code>../dist/app.css</code>. Нужен хотя бы один{' '}
          <code>npm run build</code> (или актуальный <code>dist/</code> из CI).
        </p>
        <Code
          code={`npm run build
npm run start
# затем /docs/button.html`}
        />
      </Section>

      <Section title="check:budget падает">
        <p>
          После build размеры <code>dist/*</code> сравниваются с порогами в{' '}
          <code>scripts/check-bundle-budget.js</code>. Рост CSS/JS от нового vendor или полного
          пресета — либо оптимизируй флаги, либо осознанно подними бюджет.
        </p>
      </Section>

      <Section title="Popover «под» модалкой / в старом браузере">
        <Note tone="warn">
          На уровне 3 (нет Popover API) панель не в top-layer. Внутри modal или старого движка
          предпочитай <a href="dropdown.html">Dropdown</a>. Матрица —{' '}
          <a href="support.html">support.html</a> и <a href="popover.html">popover.html</a>.
        </Note>
      </Section>

      <Section title="Куда смотреть дальше">
        <ul>
          <li>
            <a href="testing.html">Тесты</a> — vitest, axe smoke, e2e
          </li>
          <li>
            <a href="faq.html">FAQ</a> — границы продукта и «почему»
          </li>
          <li>
            Консоль браузера: модули логируют через <code>console.error</code> при сбоях setup
          </li>
        </ul>
      </Section>
    </>
  );
}
