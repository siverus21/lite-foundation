import { Section, Demo, Code, Aside, Meta } from '../components/primitives.jsx';

export default function TokensPage() {
  return (
    <>
      <Section title="Зачем токены">
        <div class="docs-note">
          <strong>Используй, когда</strong>
          <ul>
            <li>Нужна смена бренда / dark mode без отдельного CSS-файла на каждый вариант</li>
            <li>
              Хочешь один источник цвета, радиусов, z-index и оверлеев для всех компонентов
            </li>
            <li>
              Ловишь регрессии хардкода через <code>npm run lint:tokens</code>
            </li>
          </ul>
        </div>
        <Aside>
          Hotfix (критические overrides) — только в <code>scss/critical/</code>. В{' '}
          <code>components/</code> пиши через <code>var(--lf-*)</code>.
        </Aside>
      </Section>

      <Section title="Три способа кастомизации">
        <div class="docs-note">
          <strong>1. Sass (постоянная тема проекта)</strong>
          <ul>
            <li>
              Правишь палитру и body в <code>scss/settings/core/global/_global.scss</code> (
              <code>$foundation-palette</code>, <code>$body-background</code>,{' '}
              <code>$body-font-color</code>
            </li>
            <li>
              Компонентные токены — в своих settings, например <code>scss/settings/button/</code>,{' '}
              <code>title-bar/</code>, <code>modal/</code>
            </li>
            <li>
              После правок: <code>npm run build</code> (в DEV HMR подхватит Sass сам)
            </li>
          </ul>
        </div>
        <Code
          code={`// scss/settings/core/global/_global.scss
$foundation-palette: (
  "primary": #0ea5e9,
  "secondary": #64748b,
  "success": #22c55e,
  "warning": #f59e0b,
  "alert": #ef4444,
);
$body-background: #0b1220;
$body-font-color: #f8fafc;`}
        />

        <div class="docs-note">
          <strong>
            2. CSS на <code>:root</code> (без пересборки)
          </strong>
          <ul>
            <li>
              Подключи свой файл после <code>app.css</code> или вставь блок в страницу
            </li>
            <li>
              Переопределяй только нужные <code>--lf-*</code> — остальное останется из бандла
            </li>
            <li>Удобно для white-label: один CSS-бандл, разные темы на разных сайтах</li>
          </ul>
        </div>
        <Code
          code={`<link rel="stylesheet" href="dist/app.css">
<style>
  :root {
    --lf-color-primary: #0ea5e9;
    --lf-color-primary-contrast: #0b1220;
    --lf-color-primary-hover: #0284c7;
    --lf-color-primary-hollow-hover: #0369a1;
    --lf-button-bg: var(--lf-color-primary);
    --lf-button-bg-hover: var(--lf-color-primary-hover);
    --lf-anchor-color: var(--lf-color-primary);
    --lf-body-bg: #0b1220;
    --lf-body-color: #f8fafc;
  }
  body {
    background: var(--lf-body-bg);
    color: var(--lf-body-color);
  }
</style>`}
        />

        <div class="docs-note">
          <strong>3. Рантайм (переключатель темы / dark mode)</strong>
          <ul>
            <li>
              Вешай токены на <code>document.documentElement</code> или на контейнер с{' '}
              <code>data-theme</code>
            </li>
            <li>
              Лучше скоупить тему на превью/layout-root, а не красить весь chrome документации
            </li>
            <li>
              Для dark mode обычно хватает body + primary + contrast/hover-вариантов
            </li>
          </ul>
        </div>
        <Code
          code={`// JS: тема на весь документ
const root = document.documentElement;
root.style.setProperty('--lf-color-primary', '#0ea5e9');
root.style.setProperty('--lf-body-bg', '#0b1220');
root.style.setProperty('--lf-body-color', '#f8fafc');

// или класс + CSS
document.body.dataset.theme = 'ocean';
/* CSS: [data-theme="ocean"] { --lf-body-bg: … } */`}
        />
      </Section>

      <Section title="Какие токены трогать вместе">
        <Meta>
          Один <code>--lf-color-primary</code> меняет callout/label, но кнопки и ссылки тянут ещё
          связанные переменные. Минимальный набор для бренда:
        </Meta>
        <Demo>
          <ul>
            <li>
              <code>--lf-color-primary</code> + <code>-contrast</code> + <code>-hover</code> +{' '}
              <code>-hollow-hover</code>
            </li>
            <li>
              <code>--lf-button-bg</code> / <code>--lf-button-bg-hover</code> /{' '}
              <code>--lf-button-color</code> (если не хочешь, чтобы кнопки брали primary
              автоматически — они завязаны на <code>--lf-button-bg</code>)
            </li>
            <li>
              <code>--lf-anchor-color</code> / <code>--lf-anchor-color-hover</code>
            </li>
            <li>
              Для dark: <code>--lf-body-bg</code>, <code>--lf-body-color</code>, при необходимости{' '}
              <code>--lf-card-bg</code>, <code>--lf-callout-bg</code>, <code>--lf-input-bg</code>,{' '}
              <code>--lf-titlebar-bg</code>
            </li>
          </ul>
        </Demo>
        <Aside>
          Полный список эмитится в <code>:root</code> из{' '}
          <code>scss/settings/css-variables/_css-variables.scss</code> — смотри скомпилированный{' '}
          <code>dist/app.css</code> в начале файла.
        </Aside>
      </Section>

      <Section title="Живой пример (скоуп на превью)">
        <Meta>
          Токены ставятся на контейнер превью, не на <code>body</code> — сайдбар и top-nav docs не
          ломаются. В своём приложении можешь вешать то же на <code>:root</code>.
        </Meta>
        <p>
          <button type="button" class="button primary" data-theme="default">
            Default
          </button>{' '}
          <button type="button" class="button secondary" data-theme="ocean">
            Ocean
          </button>{' '}
          <button type="button" class="button warning" data-theme="warm">
            Warm
          </button>
        </p>
        <div class="docs-theme-preview" id="token-demo" data-theme="default">
          <p class="callout primary">
            Callout primary следует за <code>--lf-color-primary</code>.
          </p>
          <p>
            <button type="button" class="button primary">
              Primary
            </button>{' '}
            <button type="button" class="button hollow">
              Hollow
            </button>{' '}
            <span class="label primary">Label</span>{' '}
            <span class="badge secondary">Badge</span>
          </p>
          <p>
            <label class="checkbox primary">
              <input class="checkbox-input" type="checkbox" checked />
              <span class="checkbox-control" aria-hidden="true" />
              Checkbox
            </label>{' '}
            <label class="radio primary">
              <input class="radio-input" type="radio" name="token-demo-radio" checked />
              <span class="radio-control" aria-hidden="true" />
              Radio
            </label>
          </p>
          <p style={{ margin: '0.75rem 0 0' }}>
            Текст и фон превью: <code>--lf-body-color</code> / <code>--lf-body-bg</code>.
          </p>
          <div class="docs-theme-swatches" aria-hidden="true">
            <span class="docs-theme-swatch" style={{ background: 'var(--lf-color-primary)' }} />
            <span class="docs-theme-swatch" style={{ background: 'var(--lf-color-secondary)' }} />
            <span class="docs-theme-swatch" style={{ background: 'var(--lf-color-success)' }} />
            <span class="docs-theme-swatch" style={{ background: 'var(--lf-color-warning)' }} />
            <span class="docs-theme-swatch" style={{ background: 'var(--lf-color-alert)' }} />
          </div>
        </div>
        <Code
          code={`const preview = document.getElementById('token-demo');
Object.entries(theme).forEach(([key, value]) => {
  preview.style.setProperty(key, value);
});
// CSS-переменные наследуются потомками → button / callout внутри превью перекрашиваются`}
        />
      </Section>

      <Section title="Частые токены">
        <Demo>
          <ul>
            <li>
              <code>--lf-color-primary</code> / <code>-secondary</code> / <code>-success</code> /{' '}
              <code>-warning</code> / <code>-alert</code> — семантика
            </li>
            <li>
              <code>--lf-color-*-contrast|hover|hollow-hover</code> — пары к палитре
            </li>
            <li>
              <code>--lf-body-bg</code>, <code>--lf-body-color</code> — страница
            </li>
            <li>
              <code>--lf-button-bg</code>, <code>--lf-anchor-color</code> — CTA и ссылки
            </li>
            <li>
              <code>--lf-choice-border</code> / <code>--lf-choice-bg</code> /{' '}
              <code>--lf-choice-mark</code> — custom checkbox/radio
            </li>
            <li>
              <code>--lf-overlay</code>, <code>--lf-shadow-modal</code> — modal / off-canvas
            </li>
            <li>
              <code>--lf-z-*</code> — шкала слоёв
            </li>
          </ul>
        </Demo>
      </Section>

      <Section title="Где править источник">
        <ol>
          <li>
            Sass-переменные в <code>scss/settings/*</code> (цвета, breakpoints, z-index)
          </li>
          <li>
            Эмит в CSS — <code>scss/settings/css-variables/</code>
          </li>
          <li>
            Потребление — <code>scss/components/**</code> через <code>var(--lf-…)</code>
          </li>
          <li>
            Проверка — <code>npm run lint:tokens</code> (хардкод hex в components)
          </li>
        </ol>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            White-label: один <code>app.css</code>, разные <code>theme.css</code> на{' '}
            <code>:root</code> для каждого клиента.
          </li>
          <li>
            Превью темы в админке — скоуп на контейнер, как на этой странице, без перекраски
            chrome.
          </li>
          <li>
            CI: <code>npm run lint:tokens</code> в pipeline, чтобы hex не просочился в components.
          </li>
        </ul>
      </Section>
    </>
  );
}
