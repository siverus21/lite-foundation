# lite-foundation

Лёгкий UI-стартер в духе [Foundation for Sites](https://get.foundation/): Sass + Vite, feature-флаги, CSS-токены `--lf-*`, без npm-пакета `foundation-sites`.

## Быстрый старт

```bash
npm install
npm run start          # http://localhost:5173/ — kitchen sink
npm test
npm run build          # → dist/
```

| Скрипт | Назначение |
|--------|------------|
| `npm run start` | Vite + HMR |
| `npm run build` | CSS/JS бандлы из `config/features.js` (+ строгий `lint:tokens`) |
| `npm run sync:features` | Пересобрать GENERATED-индексы |
| `npm run lint:tokens` | Хардкод цвета/z-index в компонентах |
| `npm run check:budget` | Бюджет размера бандлов `dist/` |
| `npm test` | Vitest (юнит + a11y smoke + `feature-flags-consistency`) |
| `npm run test:coverage` | Vitest + отчёт покрытия (`coverage/`, в gitignore) |
| `npm run test:e2e` | `build` + Playwright smoke (sink + 3 docs; нужен Chromium) |

## Архитектура

Один источник правды — [`config/features.js`](config/features.js): `export default` (full), `required`, `builds`.

**SCSS**

| Слой | Путь |
|------|------|
| Abstracts | `scss/abstracts/` |
| Settings | `scss/settings/` (`core/` + компоненты; `@use 'settings/vars'`) |
| Core CSS | `scss/core/` — reset, typography, containers, grid |
| Components | `scss/components/` — по флагам `styles.*` |
| Utilities / vendors / critical | по флагам |

Page-бандл собирается in-memory (`sass.compileString` / `virtual:lf-scss/{name}`) через `@use` + `meta.load-css`.

**JavaScript**

- Модули: `js/modules/*` на базе [`Module`](js/core/Module.js)
- Entry: `/js/load-build.js?build=full` → `virtual:lf-entry/{name}` (папки `js/builds/` нет)
- Lifecycle: `initModules` / `destroyModules` / `refreshModules` / `unmountModules` / `createLF`
  (реэкспорт из `virtual:lf-modules/*` и из `dist/lib.js`)

Ленивый mount: атрибут `data-lf-lazy` на корне компонента — init при появлении во viewport (`IntersectionObserver`).
Не вешай его на корень, скрытый по умолчанию (`<dialog>`, `.offcanvas`, что-то внутри неактивной вкладки/аккордеона) —
`IntersectionObserver` не сработает для `display: none`, поэтому `Module.mount()` в этом случае просто инициализирует сразу, без отсрочки.

Skip-init: если у класса модуля есть `static lazySelector` и в `root` нет совпадений, runtime не создаёт инстанс
(бандл при этом всё равно содержит модуль — это не code-split).

Строки chrome UI — [`js/core/i18n.js`](js/core/i18n.js) (`t` / `setMessages`).

Escape для «закрывающихся» компонентов (`Offcanvas`, `Dropdown`, `MenuDropdown`, JS-фолбэк `Popover`) — через общий
диспетчер [`js/core/global-events.js`](js/core/global-events.js) (`onEscape`), один `document`-листенер на всех,
а не по одному на модуль.

## Тема и поддержка браузеров

Тёмная схема — переопределение тех же `--lf-*` токенов (`scss/settings/css-variables/_dark.scss`) по
`prefers-color-scheme: dark` и по `[data-theme='dark']`. Без JS. Модуль `scripts.theme` нужен только для ручного
переключателя: пишет атрибут на `<html>`, помнит выбор в `localStorage`, шлёт `changed.lf.theme`.

Минимальные версии браузеров для каждой используемой возможности платформы лежат в одном файле —
[`docs/assets/support-data.js`](docs/assets/support-data.js). Из него собираются и блок «Поддержка браузерами» на
страницах компонентов, и сводная таблица [`docs/support.html`](docs/support.html). Фолбэк нужен трём вещам:
`popover` и anchor positioning (берёт на себя `scripts.popover`), `animation-timeline: scroll()` (полоса
`.scroll-progress` просто не видна) и `navigator.clipboard` (нужен https, иначе `scripts.copy` уходит в
`execCommand`).

## Feature flags

```js
export default {
  vendors: { cash: false, swiper: false, animate: true },
  utilities: true,
  styles: { /* titleBar, topBar, button, … */ },
  scripts: { /* modal, tabs, menuDropdown, … */ },
};

export const builds = {
  full: {},
  about: { styles: { button: true, callout: true, card: true }, utilities: true },
  swiper: { kind: 'library', vendors: { swiper: true }, styles: { slider: true }, scripts: { slider: true } },
};
```

- `page` → `app.css` / `app-{name}.css` + `lib.js` / `lib-{name}.js`
- `library` → `lib-{name}.css` + `lib-{name}.js` (addon без core/critical)

Подключение:

```html
<link rel="stylesheet" href="/dist/app.css">
<script type="module" src="/js/load-build.js?build=full"></script>
```

## Токены

1. Sass в `scss/settings/**`
2. Эмит `:root { --lf-* }` — `settings/css-variables`
3. В компонентах — `var(--lf-…)`, не сырые цвета/z-index

Lint: `npm run lint:tokens` (dev-сервер — предупреждение; `npm run build` — строгий, падает при нарушениях).

## Тесты

Vitest + `happy-dom`. Юнит-тесты лежат рядом по темам (`js/core/*`, `js/modules/*`, `js/boot.js`),
плюс `tests/a11y.test.js` (axe-core smoke) и `tests/feature-flags-consistency.test.js`: проверяет,
что каждый включённый флаг `styles`/`scripts`/`vendors` в `config/features.js` резолвится в
`STYLE_FOLDERS` / `SCRIPT_MODULES` / `KNOWN_VENDORS` (`scripts/sync-features.js`). Опечатка или
переименование ключа без второй половины раньше молча выкидывала CSS/JS из бандла — теперь генераторы
бросают исключение на неизвестном флаге, и тест ловит это на уровне конфигурации. После build — `npm run check:budget`. Browser smoke — `npm run test:e2e` (Playwright /
Chromium). Подробнее — [`docs/testing.html`](docs/testing.html).

## Документация

- Kitchen sink: [`index.html`](index.html)
- Docs: [`docs/`](docs/) (`start`, `builds`, `tokens`, `lifecycle`, `authoring`, `testing`, `troubleshooting`, `faq`, компоненты)
- CSS-only каталог: [`docs/css-only.html`](docs/css-only.html) · витрина: [`docs/ui-kit.html`](docs/ui-kit.html)
- Demo: [`about.html`](about.html)

## Структура

```text
config/features.js      # флаги + builds
js/core/                # Module, runtime, scroll-lock, global-events
js/modules/             # UI-классы
js/load-build.js        # GENERATED: ?build=name → virtual entry (static switch)
scss/abstracts|settings|core|components|utilities|vendors|critical/
scripts/{build,sync-features,lint-tokens}.js
tests/
```

GENERATED (gitignore): `scss/critical/_index.scss`, `js/load-build.js` (статический `switch` со списком билдов — Vite не может проанализировать `import()` с шаблонной строкой, такой импорт падает в браузере). Остальное (settings/core/components/utilities/vendors, JS-модули) резолвится напрямую по имени или отдаётся как Vite virtual modules (`virtual:lf-*`).

## Соглашения

1. Цвета / z-index / тени в компонентах — только `var(--lf-…)`.
2. Новые компоненты: `settings/{name}/` + `components/{name}/` + флаги в `features.js` + `STYLE_FOLDERS` / `SCRIPT_MODULES`.
3. Hotfix → `scss/critical/`, потом перенести в компонент.
4. Не коммитить `dist/`.
5. `_index.scss` внутри `settings/{name}/` и `components/{name}/` — фасад из `@forward '...';` (не `@import`).
