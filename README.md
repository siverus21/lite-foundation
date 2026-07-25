# lite-foundation

Стартер UI в духе Foundation for Sites: свои SCSS/JS-модули, без пакета `foundation-sites`.

## Стек

- **Vite** — dev-сервер и сборка в `dist/`
- **Sass** — слои `abstracts` / `settings` / `base` / `layout` / `components` / `utilities` / `critical`
- **jQuery 3.7** — бандлится в `lib.js` (опционально)
- **Swiper** — слайдер
- **Animate.css** — модульные fade-анимации

## Установка

Нужны [Node.js](https://nodejs.org/) 18+ и npm.

```bash
npm install
npm start
```

Kitchen-sink: `index.html` (HMR для SCSS/JS).

Production:

```bash
npm run build
```

Результат:

```text
dist/
  app.css
  lib.js
```

| Команда | Зачем |
|---------|--------|
| `npm start` / `npm run dev` | dev-сервер + HMR |
| `npm run build` | production в `dist/` |
| `npm run sync:features` | пересобрать индексы вручную |
| `npm run lint:tokens` | проверка хардкода цветов / z-index |

## Структура

```text
config/
  features.js          # флаги включения компонентов / vendors / scripts
scss/
  abstracts/           # rem-calc, breakpoint, …
  settings/            # токены (Sass) + css-variables → :root (--lf-*)
  base / layout / components / utilities / vendors/
  critical/            # срочные правки (без token-lint, с напоминанием)
js/
  lib.js               # entry
  vendors.js           # GENERATED (jQuery → window.$)
  modules/             # UI-классы + GENERATED index.js
scripts/
  sync-features.js     # генерация индексов из features.js
  lint-tokens.js       # предупреждения по токенам + critical/
dist/
  app.css
  lib.js
```

Сгенерированные файлы (`GENERATED` в шапке) руками не править:

- `scss/{components,settings,vendors,layout,utilities,critical}/_index.scss`
- `js/modules/index.js`, `js/vendors.js`

---

## Как пользоваться

### Цвета

1. Палитра и нейтрали — `scss/settings/global/_global.scss`:

```scss
$foundation-palette: (
  "primary": #1779ba,
  "secondary": #767676,
  …
);
$light-gray: #e6e6e6;
$black: #0a0a0a;
$white: #fefefe;
```

2. Они эмитятся в `:root` как `--lf-color-primary`, `--lf-color-white`, …  
   (`scss/settings/css-variables/_css-variables.scss`).

3. **В компонентах** только через CSS-переменные:

```scss
color: var(--lf-color-primary);
background: var(--lf-overlay);
```

4. Без пересборки (runtime):

```css
:root { --lf-color-primary: #0a7; }
```

Хардкод `#hex` / `rgba()` / `z-index: 20` в `components` / `layout` / `base` / `utilities` → яркий `TOKEN WARNING` на сборке.

### Z-index

Файл: `scss/settings/z-index/_z-index.scss`

```scss
$z-index: (
  dropdown: 20,
  tooltip: 30,
  my-panel: 40, // новый уровень
);
```

В стилях:

```scss
z-index: var(--lf-z-my-panel);
```

### Новый SCSS-компонент

Пример: `alert-banner`.

1. Settings: `scss/settings/alert-banner/_alert-banner.scss` + `_index.scss`
2. Styles: `scss/components/alert-banner/_alert-banner.scss` + `_index.scss`  
   Цвета / z-index только через `var(--lf-…)`.
3. При необходимости добавь токены в `scss/settings/css-variables/_css-variables.scss`  
   (блок `@if variable-exists(...)`).
4. Зарегистрируй в [`scripts/sync-features.js`](scripts/sync-features.js):
   - `STYLE_FOLDERS.alertBanner = 'alert-banner'`
   - `STYLE_SETTINGS.alertBanner = ['alert-banner']`
5. Включи в [`config/features.js`](config/features.js):

```js
styles: { alertBanner: true, /* … */ }
```

### Новый JS-модуль

1. Класс в `js/modules/my-widget.js`:

```js
export class MyWidget {
  constructor(root = document) {
    // …
  }
}
```

2. В `scripts/sync-features.js` → `SCRIPT_MODULES`:

```js
myWidget: { file: './my-widget.js', className: 'MyWidget' },
```

3. В `config/features.js`:

```js
scripts: { myWidget: true, /* … */ }
```

`initModules()` сам сделает `new MyWidget()`.

### Vendors

В `config/features.js` → `vendors`:

| Флаг | Что делает |
|------|------------|
| `jquery` | бандл в `lib.js`, `window.$` / `window.jQuery` |
| `swiper` | CSS (+ JS, если включён `scripts.slider`) |
| `animate` | CSS в `app.css` |

Отдельные `<script>` из `node_modules` не нужны.

### Выключить ненужное

```js
styles: { accordion: false },
scripts: { accordion: false },
vendors: { swiper: false },
```

Компонент не попадёт ни в `dist/app.css`, ни в `dist/lib.js`.

### Критичные правки (`scss/critical/`)

Срочный hotfix, который нельзя сразу разложить по компонентам:

1. Добавь partial: `scss/critical/_hotfix-modal.scss` (пустой файл не считается и не импортируется)
2. Он подключится **последним** (перебьёт обычные стили)
3. **Не** проходит `lint:tokens` — можно временно писать литералы
4. На `npm start` / `npm run build` будет баннер `CRITICAL STYLES` со списком **непустых** файлов — пока не перенесёшь правила в нормальный компонент + токены и не удалишь файл

Подробнее: [`scss/critical/README.md`](scss/critical/README.md).

---

## Features (флаги)

Один конфиг: [`config/features.js`](config/features.js).

**Обязательный слой** (`export const required`) всегда в сборке:

| Слой | Что тянется |
|------|-------------|
| abstracts | `functions`, `mixins` |
| settings | `global`, `breakpoints`, `grid`, `typography`, `z-index`, `css-variables` |
| base | `reset`, `typography` |
| layout | `containers`, `grid` |

Опционально:

```js
export default {
  vendors: { jquery: true, swiper: true, animate: true },
  layout: { titleBar: true, topBar: true },
  utilities: true,
  styles: { button: true, accordion: false, /* … */ },
  scripts: { accordion: false, tabs: true, /* … */ },
};
```

При `npm start` / `npm run build` из конфига генерируются индексы SCSS/JS (см. структуру выше).  
Ручная синхронизация: `npm run sync:features`.
