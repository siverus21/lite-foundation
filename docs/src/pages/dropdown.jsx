import { Section, Demo, Code, Meta, Aside } from '../components/primitives.jsx';

export default function DropdownPage() {
  return (
    <>
      <Section title="Когда использовать">
        <div class="docs-note">
          <strong>Dropdown</strong>
          <ul>
            <li>Короткое меню действий у кнопки («ещё…»), фильтр, список ссылок</li>
            <li>
              Не для полноценной навигации сайта — см. <a href="menus.html">Menus</a>
            </li>
            <li>
              Не для hover-подсказки — см. <a href="tooltip.html">Tooltip</a>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Разметка">
        <Meta>
          <code>data-dropdown-open="paneId"</code>, панель с тем же <code>id</code> и классом{' '}
          <code>dropdown-pane</code>. При открытии модуль ставит <code>role="dialog"</code> (если
          нет) + <code>aria-modal</code>, ловит Tab и помечает фон <code>inert</code>. Закрытие:
          повторный клик, клик снаружи, Esc. Дай панели доступное имя (
          <code>aria-label</code> / <code>aria-labelledby</code>).
        </Meta>
        <Demo>
          <div class="dropdown">
            <button
              class="button"
              type="button"
              data-dropdown-open="docs-dropdown"
              aria-expanded="false"
              aria-controls="docs-dropdown"
            >
              Toggle Dropdown
            </button>
            <div
              class="dropdown-pane"
              id="docs-dropdown"
              aria-hidden="true"
              aria-label="Example menu"
            >
              Example dropdown pane content.
            </div>
          </div>
        </Demo>
        <Code
          code={`<button type="button" class="button"
  data-dropdown-open="docs-dropdown"
  aria-expanded="false" aria-controls="docs-dropdown">
  Toggle
</button>
<div class="dropdown-pane" id="docs-dropdown" aria-hidden="true"
  aria-label="Example menu">…</div>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Dropdown с формой внутри — закрывайте панель после submit через{' '}
            <code>data-dropdown-close</code> или клик снаружи.
          </li>
          <li>
            Длинные списки — прокрутка внутри <code>.dropdown-pane</code>, не растягивайте страницу.
          </li>
          <li>
            Hover/focus tip без клика — <a href="tooltip.html">Tooltip</a>; панель с richer UI —{' '}
            <a href="popover.html">Popover</a>.
          </li>
        </ul>
        <Aside>
          Подсказка (CSS + лёгкий aria-sync) вынесена на отдельную страницу{' '}
          <a href="tooltip.html">tooltip.html</a>.
        </Aside>
      </Section>
    </>
  );
}
