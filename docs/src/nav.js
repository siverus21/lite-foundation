/**
 * Docs navigation — shared by JSX DocsPage and legacy assets/docs.js.
 */

export const NAV = [
  {
    group: 'Начать',
    items: [
      { href: 'index.html', title: 'Обзор' },
      { href: 'start.html', title: 'Быстрый старт' },
      { href: 'builds.html', title: 'Builds' },
      { href: 'tokens.html', title: 'Токены' },
      { href: 'dark-mode.html', title: 'Тёмная тема' },
      { href: 'lifecycle.html', title: 'JS API' },
      { href: 'support.html', title: 'Поддержка браузеров' },
      { href: 'testing.html', title: 'Тесты' },
    ],
  },
  {
    group: 'Компоненты',
    items: [
      { href: 'button.html', title: 'Button' },
      { href: 'forms.html', title: 'Forms' },
      { href: 'modal.html', title: 'Modal' },
      { href: 'popover.html', title: 'Popover' },
      { href: 'tabs.html', title: 'Tabs' },
      { href: 'segmented.html', title: 'Segmented' },
      { href: 'accordion.html', title: 'Accordion' },
      { href: 'dropdown.html', title: 'Dropdown' },
      { href: 'offcanvas.html', title: 'Off-canvas' },
      { href: 'menus.html', title: 'Menus' },
      { href: 'slider.html', title: 'Slider' },
      { href: 'callout-card.html', title: 'Callout & Card' },
      { href: 'table.html', title: 'Table' },
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
      { href: 'field-extras.html', title: 'OTP, счётчик, пароль, copy' },
    ],
  },
  {
    group: 'UI Kit',
    items: [
      { href: 'modern-css.html', title: 'Современный CSS' },
      { href: 'ui-kit.html', title: 'UI Kit' },
    ],
  },
];

export const FLAT = NAV.flatMap((g) => g.items);

export const TOP_NAV = [
  'start.html',
  'builds.html',
  'tokens.html',
  'lifecycle.html',
  'support.html',
  'testing.html',
  'ui-kit.html',
];
