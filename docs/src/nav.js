/**
 * Docs navigation — shared by JSX DocsPage and legacy assets/docs.js.
 *
 * Optional `mark` on an item highlights recent work in the sidebar and page h1:
 *   - `new` — новая страница / фича
 *   - `upd` — заметная правка существующей
 *   - `fix` — багфикс / a11y / поведение
 * Секции: `<Section mark="new">` — бейдж у h2 и в TOC.
 * Снимай метку, когда она уже не нужна в обзоре изменений.
 */

/** @typedef {'new' | 'upd' | 'fix'} NavMark */

/** @type {Record<NavMark, string>} */
export const MARK_LABELS = {
  new: 'new',
  upd: 'upd',
  fix: 'fix',
};

export const NAV = [
  {
    group: 'Начать',
    items: [
      { href: 'index.html', title: 'Обзор' },
      { href: 'start.html', title: 'Быстрый старт' },
      { href: 'builds.html', title: 'Builds' },
      { href: 'tokens.html', title: 'Токены' },
      { href: 'dark-mode.html', title: 'Тёмная тема' },
      { href: 'lifecycle.html', title: 'JS API', mark: 'upd' },
      { href: 'authoring.html', title: 'Авторство', mark: 'new' },
      { href: 'support.html', title: 'Поддержка браузеров' },
      { href: 'testing.html', title: 'Тесты', mark: 'upd' },
      { href: 'troubleshooting.html', title: 'Troubleshooting', mark: 'new' },
      { href: 'faq.html', title: 'FAQ', mark: 'new' },
    ],
  },
  {
    group: 'Компоненты',
    items: [
      { href: 'button.html', title: 'Button', mark: 'upd' },
      { href: 'forms.html', title: 'Forms', mark: 'upd' },
      { href: 'modal.html', title: 'Modal', mark: 'upd' },
      { href: 'popover.html', title: 'Popover' },
      { href: 'tabs.html', title: 'Tabs', mark: 'upd' },
      { href: 'segmented.html', title: 'Segmented' },
      { href: 'accordion.html', title: 'Accordion' },
      { href: 'dropdown.html', title: 'Dropdown' },
      { href: 'tooltip.html', title: 'Tooltip', mark: 'new' },
      { href: 'offcanvas.html', title: 'Off-canvas' },
      { href: 'menus.html', title: 'Menus' },
      { href: 'slider.html', title: 'Slider' },
      { href: 'callout-card.html', title: 'Callout & Card', mark: 'upd' },
      { href: 'empty-state.html', title: 'Empty state', mark: 'new' },
      { href: 'table.html', title: 'Table', mark: 'upd' },
      { href: 'avatar.html', title: 'Avatar' },
      { href: 'chip.html', title: 'Chip / Tag' },
      { href: 'spinner.html', title: 'Spinner & Skeleton' },
      { href: 'toast.html', title: 'Toast' },
      { href: 'stepper.html', title: 'Stepper' },
      { href: 'timeline.html', title: 'Timeline' },
      { href: 'rating.html', title: 'Rating' },
    ],
  },
  {
    group: 'Формы и ввод',
    items: [
      { href: 'quantity.html', title: 'Quantity (+/−)' },
      { href: 'combobox.html', title: 'Combobox' },
      { href: 'tag-input.html', title: 'Tag input' },
      { href: 'file-upload.html', title: 'File upload', mark: 'new' },
      { href: 'field-extras.html', title: 'OTP, счётчик, пароль, copy' },
    ],
  },
  {
    group: 'UI Kit',
    items: [
      { href: 'modern-css.html', title: 'Современный CSS' },
      { href: 'css-only.html', title: 'CSS-only', mark: 'new' },
      { href: 'ui-kit.html', title: 'UI Kit', mark: 'upd' },
      { href: 'patterns.html', title: 'Patterns', mark: 'new' },
    ],
  },
];

export const FLAT = NAV.flatMap((g) => g.items);

export const TOP_NAV = [
  'start.html',
  'builds.html',
  'tokens.html',
  'lifecycle.html',
  'authoring.html',
  'support.html',
  'testing.html',
  'faq.html',
  'ui-kit.html',
];
