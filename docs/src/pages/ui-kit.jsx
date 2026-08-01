import { Section, Demo, Aside } from '../components/primitives.jsx';

export function UiKitOffcanvas() {
  return (
    <div class="offcanvas position-left" id="uiKitOffcanvas" aria-hidden="true">
      <button class="close-button" aria-label="Close" type="button" data-offcanvas-close>
        <span aria-hidden="true">&times;</span>
      </button>
      <ul class="vertical menu">
        <li>
          <a href="#top">UI Kit</a>
        </li>
        <li>
          <a href="index.html">Docs</a>
        </li>
      </ul>
    </div>
  );
}

export default function UiKitPage() {
  return (
    <>
      <span id="top" class="show-for-sr">
        UI Kit
      </span>

      <Section title="Button" id="button" mark="upd">
        <p class="docs-meta">
          Docs: <a href="button.html">button.html</a>
        </p>
        <Demo>
          <button type="button" class="button primary">
            Primary
          </button>{' '}
          <button type="button" class="button secondary">
            Secondary
          </button>{' '}
          <button type="button" class="button success">
            Success
          </button>{' '}
          <button type="button" class="button warning">
            Warning
          </button>{' '}
          <button type="button" class="button alert">
            Alert
          </button>{' '}
          <button type="button" class="button hollow">
            Hollow
          </button>{' '}
          <button type="button" class="button clear">
            Clear
          </button>{' '}
          <button type="button" class="button tiny">
            Tiny
          </button>{' '}
          <button type="button" class="button small">
            Small
          </button>{' '}
          <button type="button" class="button large">
            Large
          </button>
          <div class="button-group">
            <a class="button">One</a>
            <a class="button">Two</a>
            <a class="button">Three</a>
          </div>
          <p style={{ marginTop: '0.75rem' }}>
            <button type="button" class="button primary is-loading" aria-busy="true">
              Saving
            </button>{' '}
            <button type="button" class="button hollow is-loading" aria-busy="true">
              Saving
            </button>{' '}
            <button type="button" class="button icon-only secondary" aria-label="Settings">
              <span aria-hidden="true">⚙</span>
            </button>{' '}
            <button type="button" class="button icon-only tiny primary" aria-label="More">
              <span aria-hidden="true">⋯</span>
            </button>
          </p>
        </Demo>
      </Section>

      <Section title="Forms" id="forms" mark="upd">
        <p class="docs-meta">
          Docs: <a href="forms.html">forms.html</a>
        </p>
        <Demo>
          <div class="grid-x grid-padding-x">
            <div class="large-6 cell">
              <div class="form-control">
                <label class="form-control-label" for="uiKitEmail">
                  Email
                </label>
                <input id="uiKitEmail" type="email" class="input" placeholder="you@example.com" />
                <p class="form-control-hint">Form-control shell</p>
              </div>
              <div class="form-control is-invalid">
                <label class="form-control-label" for="uiKitView">
                  View
                </label>
                <select id="uiKitView" class="input">
                  <option value="">Pick…</option>
                  <option>List</option>
                </select>
                <p class="form-control-error">Pick a view.</p>
              </div>
              <label for="uiKitPassword">Password</label>
              <div class="input-group password-input">
                <input
                  id="uiKitPassword"
                  class="input-group-field"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="button secondary password-input-toggle"
                  data-password-toggle
                  data-text-show="Show"
                  data-text-hide="Hide"
                  data-label-show="Show password"
                  data-label-hide="Hide password"
                  aria-pressed="false"
                  aria-label="Show password"
                >
                  Show
                </button>
              </div>
              <label for="uiKitSearch" style={{ marginTop: '0.75rem', display: 'block' }}>
                Search
              </label>
              <div class="input-group search-input">
                <span class="input-group-label search-input-icon" aria-hidden="true"></span>
                <input
                  id="uiKitSearch"
                  class="input-group-field"
                  type="search"
                  placeholder="Search…"
                />
                <button
                  type="button"
                  class="button clear search-input-clear"
                  data-search-clear
                  aria-label="Clear search"
                >
                  ×
                </button>
              </div>
            </div>
            <div class="large-6 cell">
              <label class="checkbox primary">
                <input class="checkbox-input" type="checkbox" checked />
                <span class="checkbox-control" aria-hidden="true"></span>
                Custom checkbox
              </label>
              <label class="radio primary">
                <input class="radio-input" type="radio" name="uikit-radio" checked />
                <span class="radio-control" aria-hidden="true"></span>
                Custom radio
              </label>
              <div class="switch">
                <input class="switch-input" id="uiKitSwitch" type="checkbox" />
                <label class="switch-paddle" for="uiKitSwitch">
                  <span class="show-for-sr">Switch</span>
                </label>
              </div>
              <div class="slider" data-slider data-initial-start="60" data-end="100">
                <span class="slider-handle" data-slider-handle role="slider" tabindex="0"></span>
                <span class="slider-fill" data-slider-fill></span>
                <input type="hidden" />
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Modal & Confirm" id="modal" mark="upd">
        <p class="docs-meta">
          Docs: <a href="modal.html">modal.html</a>
        </p>
        <Demo>
          <button class="button primary" type="button" data-dialog-open="uiKitModal">
            Open dialog
          </button>{' '}
          <button class="button alert hollow" type="button" data-dialog-open="uiKitConfirm">
            Confirm delete
          </button>
          <dialog class="modal" id="uiKitModal">
            <button class="close-button" type="button" data-dialog-close aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h3 class="modal__title">Native dialog</h3>
            <p>Закрытие: крестик, Esc или клик по backdrop.</p>
            <button type="button" class="button" data-dialog-close>
              Close
            </button>
          </dialog>
          <dialog class="modal confirm" id="uiKitConfirm" aria-labelledby="uiKitConfirmTitle">
            <h3 class="modal__title" id="uiKitConfirmTitle">
              Удалить заказ?
            </h3>
            <p>Действие нельзя отменить.</p>
            <div class="modal-actions">
              <button type="button" class="button hollow" data-dialog-close>
                Отмена
              </button>
              <button
                type="button"
                class="button alert"
                data-dialog-close
                data-dialog-return="confirm"
              >
                Удалить
              </button>
            </div>
          </dialog>
        </Demo>
      </Section>

      <Section title="Tabs" id="tabs" mark="upd">
        <p class="docs-meta">
          Docs: <a href="tabs.html">tabs.html</a> · vertical → ↑/↓
        </p>
        <Demo>
          <ul class="tabs" data-tabs id="uikit-tabs" role="tablist">
            <li class="tabs-title is-active" role="presentation">
              <button
                type="button"
                role="tab"
                id="uikit-tab-1"
                aria-controls="uikit-panel-1"
                aria-selected="true"
                tabindex="0"
              >
                Tab 1
              </button>
            </li>
            <li class="tabs-title" role="presentation">
              <button
                type="button"
                role="tab"
                id="uikit-tab-2"
                aria-controls="uikit-panel-2"
                aria-selected="false"
                tabindex="-1"
              >
                Tab 2
              </button>
            </li>
          </ul>
          <div class="tabs-content" data-tabs-content="uikit-tabs">
            <div class="tabs-panel is-active" id="uikit-panel-1" role="tabpanel" aria-labelledby="uikit-tab-1">
              <p>Panel 1.</p>
            </div>
            <div class="tabs-panel" id="uikit-panel-2" role="tabpanel" aria-labelledby="uikit-tab-2" hidden>
              <p>Panel 2.</p>
            </div>
          </div>
          <div class="tabs-vertical" style={{ marginTop: '1.25rem' }}>
            <ul class="tabs vertical" data-tabs id="uikit-tabs-v" role="tablist">
              <li class="tabs-title is-active" role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="uikit-vtab-1"
                  aria-controls="uikit-vpanel-1"
                  aria-selected="true"
                  tabindex="0"
                >
                  Overview
                </button>
              </li>
              <li class="tabs-title" role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="uikit-vtab-2"
                  aria-controls="uikit-vpanel-2"
                  aria-selected="false"
                  tabindex="-1"
                >
                  Specs
                </button>
              </li>
            </ul>
            <div class="tabs-content" data-tabs-content="uikit-tabs-v">
              <div
                class="tabs-panel is-active"
                id="uikit-vpanel-1"
                role="tabpanel"
                aria-labelledby="uikit-vtab-1"
              >
                <p>Vertical panel 1.</p>
              </div>
              <div
                class="tabs-panel"
                id="uikit-vpanel-2"
                role="tabpanel"
                aria-labelledby="uikit-vtab-2"
                hidden
              >
                <p>Vertical panel 2.</p>
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Accordion" id="accordion">
        <Demo>
          <div class="accordion" data-accordion>
            <details class="accordion-item" open>
              <summary class="accordion-title">Item 1</summary>
              <div class="accordion-content">
                <p>Panel 1 content.</p>
              </div>
            </details>
            <details class="accordion-item">
              <summary class="accordion-title">Item 2</summary>
              <div class="accordion-content">
                <p>Panel 2 content.</p>
              </div>
            </details>
          </div>
        </Demo>
      </Section>

      <Section title="Dropdown" id="dropdown">
        <Demo>
          <div class="dropdown">
            <button
              class="button"
              type="button"
              data-dropdown-open="uikit-dropdown"
              aria-expanded="false"
              aria-controls="uikit-dropdown"
            >
              Toggle
            </button>
            <div class="dropdown-pane" id="uikit-dropdown" aria-hidden="true">
              Dropdown pane content.
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Off-canvas" id="offcanvas">
        <Demo>
          <button type="button" class="button" data-offcanvas-open="uiKitOffcanvas">
            Open off-canvas
          </button>
        </Demo>
      </Section>

      <Section title="Menus" id="menus">
        <Demo>
          <ul class="dropdown menu" data-menu="dropdown">
            <li>
              <a href="#">Item 1</a>
            </li>
            <li>
              <a href="#">Item 2</a>
              <ul class="menu">
                <li>
                  <a href="#">Item 2A</a>
                </li>
              </ul>
            </li>
          </ul>
        </Demo>
        <Demo>
          <div style={{ maxWidth: '16rem' }}>
          <ul class="vertical menu accordion-menu" data-menu="accordion">
            <li>
              <a href="#">Item 1</a>
            </li>
            <li>
              <a href="#">Item 2</a>
              <ul class="menu vertical nested">
                <li>
                  <a href="#">Item 2A</a>
                </li>
              </ul>
            </li>
          </ul>
          </div>
        </Demo>
        <Demo>
          <div style={{ maxWidth: '16rem' }}>
          <ul class="vertical menu drilldown" data-menu="drilldown">
            <li>
              <a href="#">Item 1</a>
              <ul class="menu vertical nested">
                <li>
                  <a href="#">Item 1A</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">Item 2</a>
            </li>
          </ul>
          </div>
        </Demo>
      </Section>

      <Section title="Slider (Swiper)" id="slider-swiper">
        <Demo>
          <div class="swiper ks-swiper" data-swiper>
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <figure>
                  <img src="https://placehold.co/1200x320/1779ba/ffffff?text=Slide+1" alt="Slide 1" />
                  <figcaption>Slide 1</figcaption>
                </figure>
              </div>
              <div class="swiper-slide">
                <figure>
                  <img src="https://placehold.co/1200x320/3adb76/0a0a0a?text=Slide+2" alt="Slide 2" />
                  <figcaption>Slide 2</figcaption>
                </figure>
              </div>
            </div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
          </div>
        </Demo>
      </Section>

      <Section title="Tooltip" id="tooltip">
        <p class="docs-meta">
          Документация: <a href="tooltip.html">tooltip.html</a>
        </p>
        <Demo>
          <p>
            Hover or focus{' '}
            <button type="button" class="button tiny has-tip" data-tip="Tooltip text">
              ?
            </button>
            .
          </p>
        </Demo>
      </Section>

      <Section title="Breadcrumbs" id="breadcrumbs">
        <Demo>
          <nav aria-label="You are here:" role="navigation">
            <ul class="breadcrumbs">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Features</a>
              </li>
              <li>
                <span class="show-for-sr">Current: </span>Cloning
              </li>
            </ul>
          </nav>
        </Demo>
      </Section>

      <Section title="Pagination" id="pagination">
        <Demo>
          <ul class="pagination" role="navigation" aria-label="Pagination">
            <li class="pagination-previous disabled">
              Previous <span class="show-for-sr">page</span>
            </li>
            <li class="current">
              <span class="show-for-sr">You're on page</span> 1
            </li>
            <li>
              <a href="#" aria-label="Page 2">
                2
              </a>
            </li>
            <li>
              <a href="#" aria-label="Page 3">
                3
              </a>
            </li>
            <li class="pagination-next">
              <a href="#" aria-label="Next page">
                Next <span class="show-for-sr">page</span>
              </a>
            </li>
          </ul>
        </Demo>
      </Section>

      <Section title="Title bar" id="title-bar">
        <Demo>
          <div class="title-bar">
            <div class="title-bar-left">
              <button class="menu-icon" type="button" aria-label="Open menu"></button>
              <span class="title-bar-title">Title Bar</span>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Top bar" id="top-bar">
        <Demo>
          <div class="top-bar">
            <div class="top-bar-left">
              <ul class="menu">
                <li class="menu-text">Site Title</li>
                <li>
                  <a href="#">One</a>
                </li>
                <li>
                  <a href="#">Two</a>
                </li>
              </ul>
            </div>
            <div class="top-bar-right">
              <ul class="menu">
                <li>
                  <button type="button" class="button">
                    Search
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Media Object, Thumbnail, Embed" id="media-object-thumbnail-embed">
        <Demo>
          <div class="media-object">
            <div class="media-object-section">
              <div class="thumbnail">
                <img src="https://placehold.co/100x100/8a8a8a/ffffff?text=Img" alt="" />
              </div>
            </div>
            <div class="media-object-section">
              <h4>Media Object</h4>
              <p>Текст рядом с изображением.</p>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Callout" id="callout">
        <Demo>
          <div class="callout">Default</div>
          <div class="callout primary">Primary</div>
          <div class="callout success">Success</div>
          <div class="callout warning">Warning</div>
          <div class="callout alert">Alert</div>
        </Demo>
      </Section>

      <Section title="Card" id="card">
        <Demo>
          <div class="card" style={{ maxWidth: '18rem' }}>
            <div class="card-divider">Header</div>
            <div class="card-section">
              <h4>Card title</h4>
              <p>Card body text.</p>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Label" id="label">
        <Demo>
          <span class="label">Default</span>{' '}
          <span class="primary label">Primary</span>{' '}
          <span class="success label">Success</span>{' '}
          <span class="warning label">Warning</span>{' '}
          <span class="alert label">Alert</span>
        </Demo>
      </Section>

      <Section title="Badge" id="badge">
        <Demo>
          <span class="badge">1</span>{' '}
          <span class="secondary badge">2</span>{' '}
          <span class="success badge">3</span>{' '}
          <span class="warning badge">A</span>{' '}
          <span class="alert badge">B</span>
        </Demo>
      </Section>

      <Section title="Progress & Meter" id="progress-meter">
        <Demo>
          <div
            class="progress"
            role="progressbar"
            tabindex="0"
            aria-valuenow="50"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ '--progress-value': '50%' }}
          >
            <div class="progress-meter"></div>
          </div>
          <meter value="60" min="0" low="33" high="66" optimum="80" max="100">
            60%
          </meter>
        </Demo>
      </Section>

      <Section title="Table" id="table">
        <Demo>
          <table class="striped hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Anna</td>
                <td>
                  <span class="success label">Active</span>
                </td>
              </tr>
              <tr>
                <td>Boris</td>
                <td>
                  <span class="warning label">Away</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Demo>
      </Section>

      <Section title="Sticky" id="sticky">
        <Demo>
          <div class="grid-x">
            <div class="cell">
              <div class="callout primary sticky-box">
                Sticky box — держится, пока виден родительский .cell
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Avatar" id="avatar">
        <Demo>
          <span class="avatar small">
            <img src="https://i.pravatar.cc/64?img=1" alt="" />
          </span>{' '}
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=2" alt="" />
          </span>{' '}
          <span class="avatar large">
            <img src="https://i.pravatar.cc/64?img=3" alt="" />
          </span>{' '}
          <span class="avatar avatar-initials" data-initials="AB"></span>{' '}
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=4" alt="" />
            <span class="avatar-status" data-status="online"></span>
          </span>{' '}
          <span class="avatar-group">
            <span class="avatar bordered">
              <img src="https://i.pravatar.cc/64?img=5" alt="" />
            </span>
            <span class="avatar bordered">
              <img src="https://i.pravatar.cc/64?img=6" alt="" />
            </span>
            <span class="avatar bordered avatar-initials" data-initials="+3"></span>
          </span>
        </Demo>
      </Section>

      <Section title="Chip" id="chip">
        <Demo>
          <span class="chip">Default</span>{' '}
          <span class="chip primary">Primary</span>{' '}
          <span class="chip success">Success</span>{' '}
          <span class="chip primary hollow">Hollow</span>{' '}
          <span class="chip primary" data-closable>
            Removable
            <button class="chip-close" type="button" data-close aria-label="Remove"></button>
          </span>
        </Demo>
      </Section>

      <Section title="Spinner & Skeleton" id="spinner-skeleton">
        <Demo>
          <span class="spinner tiny"></span>{' '}
          <span class="spinner small"></span>{' '}
          <span class="spinner"></span>{' '}
          <span class="spinner large success"></span>
        </Demo>
        <Demo>
          <div style={{ maxWidth: '16rem' }}>
            <div class="skeleton skeleton-circle large" style={{ marginBottom: '0.75rem' }}></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </Demo>
      </Section>

      <Section title="Toast" id="toast">
        <Demo>
          <button
            class="button"
            type="button"
            data-toast-trigger
            data-toast-variant="primary"
            data-toast-title="Инфо"
            data-toast-message="Просто уведомление"
          >
            Primary
          </button>{' '}
          <button
            class="button success"
            type="button"
            data-toast-trigger
            data-toast-variant="success"
            data-toast-title="Готово"
            data-toast-message="Изменения сохранены"
          >
            Success
          </button>{' '}
          <button
            class="button alert"
            type="button"
            data-toast-trigger
            data-toast-variant="alert"
            data-toast-title="Ошибка"
            data-toast-message="Не удалось сохранить"
          >
            Alert
          </button>
        </Demo>
      </Section>

      <Section title="Stepper" id="stepper">
        <Demo>
          <div class="stepper-wrap">
            <ol class="stepper" data-stepper data-clickable>
              <li class="stepper-step is-complete" data-stepper-step>
                <span class="stepper-step-marker" data-index="1"></span>
                <span class="stepper-step-label">Корзина</span>
              </li>
              <li class="stepper-step is-active" data-stepper-step>
                <span class="stepper-step-marker" data-index="2"></span>
                <span class="stepper-step-label">Доставка</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="3"></span>
                <span class="stepper-step-label">Оплата</span>
              </li>
            </ol>
          </div>
        </Demo>
      </Section>

      <Section title="Rating" id="rating">
        <Demo>
          <div class="rating" data-rating data-rating-value="3" data-rating-max="5"></div>
          <div
            class="rating"
            data-rating
            data-readonly
            data-stars="★★★★★"
            style={{ '--lf-rating-value': '84%' }}
            aria-label="4.2 из 5"
          ></div>
        </Demo>
      </Section>

      <Section title="Timeline" id="timeline">
        <Demo>
          <ol class="timeline">
            <li class="timeline-item is-complete">
              <p class="timeline-meta">12 июля, 09:14</p>
              <h4 class="timeline-title">Заказ оформлен</h4>
            </li>
            <li class="timeline-item is-current">
              <p class="timeline-meta">13 июля, 08:30</p>
              <h4 class="timeline-title">Передан в доставку</h4>
            </li>
            <li class="timeline-item">
              <p class="timeline-meta">Ожидается 13 июля</p>
              <h4 class="timeline-title">Доставлен</h4>
            </li>
          </ol>
        </Demo>
      </Section>

      <Section title="Segmented control" id="segmented">
        <Demo>
          <div class="segmented">
            <label class="segmented-item">
              <input type="radio" name="uikitSeg" checked />
              <span>Список</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="uikitSeg" />
              <span>Плитка</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="uikitSeg" />
              <span>Карта</span>
            </label>
          </div>
          <div class="segmented small" style={{ marginInlineStart: '0.5rem' }}>
            <label class="segmented-item success">
              <input type="radio" name="uikitSeg2" checked />
              <span>Оплачен</span>
            </label>
            <label class="segmented-item warning">
              <input type="radio" name="uikitSeg2" />
              <span>Ожидает</span>
            </label>
          </div>
        </Demo>
      </Section>

      <Section title="Popover" id="popover">
        <Demo>
          <button class="button" popovertarget="uiKitPopover">
            Аккаунт ▾
          </button>
          <div class="popover" id="uiKitPopover" popover data-popover>
            <ul class="popover-menu">
              <li>
                <a href="#">Профиль</a>
              </li>
              <li>
                <a href="#">Настройки</a>
              </li>
              <li>
                <button type="button">Выйти</button>
              </li>
            </ul>
          </div>

          <button class="button secondary" popovertarget="uiKitPopoverTop">
            Сверху
          </button>
          <div class="popover top center" id="uiKitPopoverTop" popover data-popover>
            <p class="popover-title">Подсказка</p>
            <p style={{ margin: 0 }}>Нативный popover с фолбэком на JS.</p>
          </div>
        </Demo>
        <Aside>
          Поддержка браузерами и уровни деградации — на <a href="popover.html">странице Popover</a>.
        </Aside>
      </Section>

      <Section title="Quantity" id="quantity">
        <Demo>
          <div class="quantity small" data-quantity>
            <input class="quantity-input" type="number" value="1" min="1" max="9" />
          </div>
          <div class="quantity" data-quantity data-quantity-hold data-quantity-max="99">
            <input class="quantity-input" type="number" value="1" />
          </div>
          <div class="quantity large" data-quantity>
            <input class="quantity-input" type="number" value="1" min="0.5" max="5" step="0.5" />
          </div>
        </Demo>
      </Section>

      <Section title="Combobox" id="combobox">
        <Demo>
          <div style={{ maxWidth: '20rem' }}>
            <select name="uikitCity" data-combobox>
              <option value="">— выберите город —</option>
              <option value="msk">Москва</option>
              <option value="spb">Санкт-Петербург</option>
              <option value="nsk">Новосибирск</option>
              <option value="ekb">Екатеринбург</option>
              <option value="kzn">Казань</option>
            </select>
          </div>
        </Demo>
      </Section>

      <Section title="Tag input" id="tag-input">
        <Demo>
          <div style={{ maxWidth: '26rem' }}>
            <div
              class="tag-input"
              data-tag-input
              data-tag-input-name="uikitTags[]"
              data-tag-input-value="css, доступность"
              data-tag-input-max="6"
              data-tag-input-suggestions="javascript, css, вёрстка, тестирование"
            >
              <input class="tag-input-field" type="text" placeholder="Добавить тег…" />
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="OTP" id="otp">
        <Demo>
          <div class="otp" data-otp data-otp-length="4" data-otp-name="uikitCode"></div>
        </Demo>
      </Section>

      <Section title="Счётчик и надёжность пароля" id="field-feedback">
        <Demo>
          <div class="grid-x grid-padding-x">
            <div class="large-6 cell">
              <label>
                Заголовок
                <input class="input" type="text" data-char-counter maxlength="60" />
              </label>
            </div>
            <div class="large-6 cell">
              <label>
                Пароль
                <input
                  class="input"
                  type="password"
                  data-password-strength
                  data-password-strength-min="3"
                />
              </label>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Copy to clipboard" id="copy">
        <Demo>
          <code id="uiKitSnippet">npm i lite-foundation</code>{' '}
          <button class="button tiny" type="button" data-copy="#uiKitSnippet" data-copy-label="Скопировано!">
            Копировать
          </button>{' '}
          <button class="button tiny secondary" type="button" data-copy-text="LF-2026-PROMO" data-copy-status>
            Промокод
          </button>
        </Demo>
      </Section>

      <Section title="Table: сортировка и липкий заголовок" id="table-advanced">
        <Demo>
          <div class="table-scroll limited" style={{ '--lf-table-scroll-height': '13rem' }}>
            <table class="striped hover sticky-head" data-table-sort>
              <thead>
                <tr>
                  <th data-sort="text">Клиент</th>
                  <th data-sort="number">Сумма</th>
                  <th data-sort="date" data-sort-default="desc">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Клиент">Иванова А.</td>
                  <td data-label="Сумма" data-sort-value="12450">
                    12 450 ₽
                  </td>
                  <td data-label="Дата">03.07.2026</td>
                </tr>
                <tr>
                  <td data-label="Клиент">Петров Б.</td>
                  <td data-label="Сумма" data-sort-value="890">
                    890 ₽
                  </td>
                  <td data-label="Дата">14.07.2026</td>
                </tr>
                <tr>
                  <td data-label="Клиент">Сидорова В.</td>
                  <td data-label="Сумма" data-sort-value="103200">
                    103 200 ₽
                  </td>
                  <td data-label="Дата">28.06.2026</td>
                </tr>
                <tr>
                  <td data-label="Клиент">Ёлкин Г.</td>
                  <td data-label="Сумма" data-sort-value="4500">
                    4 500 ₽
                  </td>
                  <td data-label="Дата">21.07.2026</td>
                </tr>
                <tr>
                  <td data-label="Клиент">Жукова Д.</td>
                  <td data-label="Сумма" data-sort-value="7300">
                    7 300 ₽
                  </td>
                  <td data-label="Дата">09.07.2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Demo>
      </Section>

      <Section title="Container queries" id="container-queries">
        <Demo>
          <div class="query-container" style={{ maxWidth: '18rem' }}>
            <div class="media-object stack-narrow">
              <div class="media-object-section">
                <span class="avatar avatar-initials" data-initials="АИ"></span>
              </div>
              <div class="media-object-section">
                <h5 style={{ margin: '0 0 0.2rem' }}>Узкий контейнер</h5>
                <p style={{ margin: 0 }}>Аватар встаёт над текстом — реагирует контейнер, не вьюпорт.</p>
              </div>
            </div>
          </div>
        </Demo>
        <Aside>
          Подробнее и с изменяемой шириной — <a href="modern-css.html">современный CSS</a>.
        </Aside>
      </Section>

      <Section title="Тёмная тема" id="theme">
        <Demo>
          <button
            class="button"
            type="button"
            data-theme-toggle
            data-theme-label-light="Включить тёмную"
            data-theme-label-dark="Включить светлую"
          >
            Включить тёмную
          </button>{' '}
          <button class="button hollow" type="button" data-theme-set="auto">
            Как в системе
          </button>
        </Demo>
        <Aside>
          Переключение меняет <code>--lf-*</code> токены — все компоненты на этой странице
          перекрашиваются сразу. См. <a href="dark-mode.html">тёмную тему</a>.
        </Aside>
      </Section>

      <Section title="Empty state" id="empty-state" mark="new">
        <p class="docs-meta">
          Docs: <a href="empty-state.html">empty-state.html</a>
        </p>
        <Demo>
          <div class="empty-state">
            <span class="empty-state-icon" aria-hidden="true">∅</span>
            <h3 class="empty-state-title">Пока пусто</h3>
            <p class="empty-state-text">Добавьте первый элемент, чтобы начать работу.</p>
            <div class="empty-state-actions">
              <button type="button" class="button primary">
                Создать
              </button>
              <button type="button" class="button hollow">
                Импорт
              </button>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="File upload" id="file-upload" mark="new">
        <p class="docs-meta">
          Docs: <a href="file-upload.html">file-upload.html</a>
        </p>
        <Demo>
          <div class="file-upload" data-file-upload style={{ maxWidth: '28rem' }}>
            <input class="file-upload-input" type="file" id="uiKitUpload" multiple />
            <label class="file-upload-drop" for="uiKitUpload">
              <span class="file-upload-title">Перетащите файлы сюда</span>
              <span class="file-upload-hint">или нажмите, чтобы выбрать</span>
            </label>
            <ul class="file-upload-list" data-file-upload-list></ul>
          </div>
        </Demo>
      </Section>

      <Section title="Card states" id="card-states" mark="new">
        <Demo>
          <div class="grid-x grid-padding-x">
            <div class="medium-4 cell">
              <div class="card is-empty">
                <div class="card-section">
                  <div class="empty-state compact">
                    <h3 class="empty-state-title">Нет заказов</h3>
                    <p class="empty-state-text">Создайте первый.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="medium-4 cell">
              <div class="card is-loading" aria-busy="true">
                <div class="card-loading">
                  <span class="skeleton skeleton-text"></span>
                  <span class="skeleton skeleton-text"></span>
                  <span class="skeleton skeleton-text" style={{ width: '60%' }}></span>
                </div>
              </div>
            </div>
            <div class="medium-4 cell">
              <div class="card is-error">
                <div class="card-section">
                  <div class="callout alert" style={{ margin: 0 }}>
                    Не удалось загрузить данные.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Table states & density" id="table-states" mark="new">
        <Demo>
          <div class="table-shell is-empty">
            <div class="table-shell-status">
              <div class="empty-state compact">
                <h3 class="empty-state-title">Нет строк</h3>
              </div>
            </div>
            <div class="table-shell-body">
              <table class="table">
                <tbody>
                  <tr>
                    <td>hidden when empty</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <table class="table compact striped" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Qty</th>
                <th class="table-actions hide-for-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A-100</td>
                <td>2</td>
                <td class="table-actions">
                  <button type="button" class="button tiny hollow">
                    Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td>B-200</td>
                <td>5</td>
                <td class="table-actions">
                  <button type="button" class="button tiny hollow">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="docs-meta">
            <code>.table.compact</code> · колонка действий:{' '}
            <code>.hide-for-print</code> / <code>.hide-actions-print</code>
          </p>
        </Demo>
      </Section>

      <Section title="Patterns" id="patterns" mark="new">
        <p class="docs-meta">
          Полные композиции — <a href="patterns.html">patterns.html</a> (без новых примитивов).
        </p>
        <Demo>
          <form class="form-compact" style={{ maxWidth: '22rem' }} onSubmit={(e) => e.preventDefault()}>
            <div class="form-control compact">
              <label class="form-control-label" for="patEmail">
                Email
              </label>
              <input id="patEmail" type="email" class="input" autocomplete="username" />
            </div>
            <div class="form-control compact">
              <label class="form-control-label" for="patPass">
                Password
              </label>
              <input id="patPass" type="password" class="input" autocomplete="current-password" />
            </div>
            <button type="submit" class="button primary expanded">
              Войти
            </button>
          </form>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Якорные ссылки из off-canvas (<code>#button</code>, <code>#forms</code>…) — быстрая
            навигация по витрине на длинной странице.
          </li>
          <li>
            Каждый блок — ссылка на отдельную doc-страницу в сайдбаре для флагов и API.
          </li>
          <li>
            Swiper-блок требует <code>extraBuilds: ['swiper']</code> и <code>lib-swiper.css</code> —
            не тащите в основной bundle без нужды.
          </li>
        </ul>
      </Section>

      <footer class="docs-footer">
        <p>
          Разметка, флаги и рекомендации по каждому компоненту — на его собственной странице в сайдбаре.
        </p>
      </footer>
    </>
  );
}
