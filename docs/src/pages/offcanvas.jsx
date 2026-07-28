import { Section, When, Demo, Code } from '../components/primitives.jsx';

export default function OffcanvasPage() {
  return (
    <>
      <div class="offcanvas position-left" id="docsOffCanvas" aria-hidden="true">
        <button class="close-button" aria-label="Close" type="button" data-offcanvas-close>
          <span aria-hidden="true">&times;</span>
        </button>
        <ul class="vertical menu">
          <li>
            <a href="#top">Home</a>
          </li>
          <li>
            <a href="modal.html">Modal</a>
          </li>
          <li>
            <a href="tabs.html">Tabs</a>
          </li>
        </ul>
      </div>

      <Section title="Когда использовать" id="top">
        <When
          good={[
            'Главная навигация на узких экранах',
            'Корзина / фильтры каталога сбоку',
          ]}
          bad={[
            'Короткий confirm — <a href="modal.html">Modal</a>',
            'Маленькое меню у кнопки — <a href="dropdown.html">Dropdown</a>',
          ]}
        />
      </Section>

      <Section title="Разметка и API">
        <ul>
          <li>
            Открыть: <code>data-offcanvas-open="panelId"</code>
          </li>
          <li>
            Закрыть: <code>data-offcanvas-close</code>, backdrop, Esc, якорная ссылка{' '}
            <code>#…</code> внутри панели
          </li>
          <li>
            Панель лучше держать в конце <code>body</code> (модуль сам перенесёт)
          </li>
        </ul>
        <Demo>
          <button type="button" class="button primary" data-offcanvas-open="docsOffCanvas">
            Open off-canvas
          </button>
        </Demo>
        <Code
          code={`<button type="button" class="button" data-offcanvas-open="docsOffCanvas">Open</button>

<div class="offcanvas position-left" id="docsOffCanvas" aria-hidden="true">
  <button class="close-button" type="button" data-offcanvas-close aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <ul class="vertical menu">…</ul>
</div>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Мобильное меню: off-canvas + <a href="menus.html">Accordion menu</a> внутри панели.
          </li>
          <li>
            <code>position-left</code> / <code>position-right</code> — фильтры справа, навигация
            слева.
          </li>
          <li>
            Закрытие по клику на ссылку внутри — удобно для SPA без дополнительного JS.
          </li>
        </ul>
      </Section>
    </>
  );
}
