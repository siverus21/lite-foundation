import { Section, Code, Aside } from '../components/primitives.jsx';

export default function FaqPage() {
  return (
    <>
      <Section title="Это npm-библиотека / аналог Bootstrap?">
        <p>
          Нет. Репозиторий <code>private: true</code> — UI-стартер (Sass + Vite + vanilla JS) в духе
          Foundation, для копирования/форка в продукт. Нет опубликованного package exports / Storybook
          как обязательного слоя: каноничные демо — kitchen sink и docs Demo-блоки.
        </p>
      </Section>

      <Section title="Как быстро стартовать?">
        <Code
          code={`npm install
npm run start          # http://localhost:5173/
# docs: /docs/  · sink: /`}
        />
        <Aside>
          Подробнее — <a href="start.html">Быстрый старт</a>. Для docs CSS нужен{' '}
          <code>npm run build</code> хотя бы раз.
        </Aside>
      </Section>

      <Section title="Зачем feature flags?">
        <p>
          Один <code>config/features.js</code> режет CSS и JS по билдам: полный sink, тонкая
          marketing-страница, library-addon (Swiper). Опечатка во флаге больше не «тихо» выкидывает
          компонент — падает генератор / consistency-тест.
        </p>
      </Section>

      <Section title="Нужен ли Cash / jQuery?">
        <p>
          Нет. Runtime-модули на vanilla JS. <code>cash-dom</code> — optionalDependency и vendor-флаг
          для своих скриптов, не для ядра.
        </p>
      </Section>

      <Section title="Как темызировать?">
        <p>
          Переопределяй <code>--lf-*</code> (см. <a href="tokens.html">Токены</a>). Тёмная схема —
          <a href="dark-mode.html">dark-mode</a> через <code>prefers-color-scheme</code> /{' '}
          <code>[data-theme]</code>; JS-переключатель — опциональный <code>scripts.theme</code>.
        </p>
      </Section>

      <Section title="createLF vs initModules?">
        <p>
          <code>initModules(root)</code> — глобальный lifecycle билда. <code>createLF(root)</code> —
          тот же список модулей, но сразу bound к поддереву (виджет / AJAX-панель) с{' '}
          <code>destroy</code> / <code>refresh</code> / <code>unmount</code>. Оба реэкспортирует{' '}
          <code>dist/lib.js</code>.
        </p>
      </Section>

      <Section title="Есть ли E2E / визуальные регрессии?">
        <p>
          Smoke Playwright: kitchen sink + несколько docs-страниц (
          <code>npm run test:e2e</code>). Полноценного Chromatic/Percy нет — визуальная витрина
          вручную через sink и <a href="ui-kit.html">ui-kit</a>.
        </p>
      </Section>

      <Section title="Как проверяется a11y?">
        <p>
          Юнит-smoke на axe-core (<code>tests/a11y.test.js</code>, без color-contrast в happy-dom) +
          per-page блок поддержки платформенных API. Это не замена browser a11y CI на реальных
          стилях.
        </p>
      </Section>

      <Section title="Где миграция с Foundation for Sites?">
        <p>
          Отдельного migration guide нет. Ориентиры: классы близки к Foundation 6, JS — свои модули
          и data-атрибуты (<code>data-tip</code>, не <code>data-tooltip</code>), токены{' '}
          <code>--lf-*</code> вместо Sass-only настроек в runtime.
        </p>
      </Section>

      <Section title="Как добавить свой компонент / страницу docs?">
        <p>
          Гайд <a href="authoring.html">Авторство</a>: флаги, Module, тесты, HTML + entry + nav.
        </p>
      </Section>

      <Section title="Что-то сломалось — куда?">
        <p>
          Сначала <a href="troubleshooting.html">Troubleshooting</a>, затем issue в репозитории с
          билдом (<code>full</code> / named), флагами и минимальным HTML.
        </p>
      </Section>
    </>
  );
}
