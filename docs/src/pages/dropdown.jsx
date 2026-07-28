import { Section, Demo, Code, Meta } from '../components/primitives.jsx';

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
          </ul>
        </div>
        <div class="docs-note">
          <strong>Tooltip</strong>
          <ul>
            <li>Пояснение к иконке или термину (1–2 предложения)</li>
            <li>Не клади внутрь формы и критичные CTA — плохо на тач-устройствах</li>
          </ul>
        </div>
      </Section>

      <Section title="Dropdown">
        <Meta>
          <code>data-dropdown-open="paneId"</code>, панель с тем же <code>id</code> и классом{' '}
          <code>dropdown-pane</code>. Закрытие: повторный клик, клик снаружи, Esc.
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
            <div class="dropdown-pane" id="docs-dropdown" aria-hidden="true">
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
<div class="dropdown-pane" id="docs-dropdown" aria-hidden="true">…</div>`}
        />
      </Section>

      <Section title="Tooltip">
        <Meta>
          Атрибут специально <code>data-tip</code>, не <code>data-tooltip</code> (чтобы не
          конфликтовать с title-паттернами).
        </Meta>
        <Demo>
          <p>
            Hover or focus{' '}
            <span class="has-tip" data-tip="Tooltip text">
              this tip
            </span>{' '}
            for a tooltip.
          </p>
        </Demo>
        <Code code={`<span class="has-tip" data-tip="Tooltip text">this tip</span>`} />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Dropdown с формой внутри — закрывайте панель после submit через{' '}
            <code>data-dropdown-close</code> или клик снаружи.
          </li>
          <li>
            Tooltip только для дополнительного контекста; критичные подписи — видимый текст рядом с
            полем.
          </li>
          <li>
            Длинные списки в dropdown — прокрутка внутри <code>.dropdown-pane</code>, не
            растягивайте страницу.
          </li>
        </ul>
      </Section>
    </>
  );
}
