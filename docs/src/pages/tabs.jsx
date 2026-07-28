import { Section, When, Demo, Code, Meta, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function TabsPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Карточка товара: описание / характеристики / отзывы',
            'Настройки с несколькими равнозначными секциями',
          ]}
          bad={[
            'Длинный FAQ — <a href="accordion.html">Accordion</a> читабельнее',
            'Шаги мастера с прогрессом — отдельный wizard / отдельные URL',
          ]}
        />
      </Section>

      <Section title="Разметка">
        <Meta>
          Связка: <code>data-tabs</code> + <code>id</code> списка и{' '}
          <code>data-tabs-content="тот-же-id"</code>. У tab — <code>aria-controls</code>, у panel —{' '}
          <code>aria-labelledby</code>.
        </Meta>
        <Demo>
          <ul class="tabs" data-tabs id="docs-tabs" role="tablist">
            <li class="tabs-title is-active" role="presentation">
              <button
                type="button"
                role="tab"
                id="docs-tab-1"
                aria-controls="docs-panel-1"
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
                id="docs-tab-2"
                aria-controls="docs-panel-2"
                aria-selected="false"
                tabindex="-1"
              >
                Tab 2
              </button>
            </li>
            <li class="tabs-title" role="presentation">
              <button
                type="button"
                role="tab"
                id="docs-tab-3"
                aria-controls="docs-panel-3"
                aria-selected="false"
                tabindex="-1"
              >
                Tab 3
              </button>
            </li>
          </ul>
          <div class="tabs-content" data-tabs-content="docs-tabs">
            <div class="tabs-panel is-active" id="docs-panel-1" role="tabpanel" aria-labelledby="docs-tab-1">
              <p>Tab panel 1.</p>
            </div>
            <div class="tabs-panel" id="docs-panel-2" role="tabpanel" aria-labelledby="docs-tab-2" hidden>
              <p>Tab panel 2.</p>
            </div>
            <div class="tabs-panel" id="docs-panel-3" role="tabpanel" aria-labelledby="docs-tab-3" hidden>
              <p>Tab panel 3.</p>
            </div>
          </div>
        </Demo>
        <Code
          title="HTML"
          code={`<ul class="tabs" data-tabs id="docs-tabs" role="tablist">
  <li class="tabs-title is-active" role="presentation">
    <button type="button" role="tab" id="docs-tab-1"
      aria-controls="docs-panel-1" aria-selected="true" tabindex="0">Tab 1</button>
  </li>
</ul>
<div class="tabs-content" data-tabs-content="docs-tabs">
  <div class="tabs-panel is-active" id="docs-panel-1" role="tabpanel"
    aria-labelledby="docs-tab-1">…</div>
</div>`}
        />
      </Section>

      <Section title="События и команды">
        <ApiTable
          columns={['Имя', 'Где', 'detail / эффект']}
          rows={[
            [c('changed.lf.tabs'), 'на tablist', c('{ index, tab, panel }')],
            [c('lf:tabs:select'), 'на tablist', c('{ index }') + ' или ' + c("{ id: 'panel-id' }")],
            [c('lf:tabs:next'), 'на tablist', 'Следующая вкладка'],
            [c('lf:tabs:prev'), 'на tablist', 'Предыдущая вкладка'],
          ]}
        />
        <Code
          title="JS"
          code={`const tabs = document.getElementById('docs-tabs');
tabs.addEventListener('changed.lf.tabs', (e) => {
  console.log(e.detail.index, e.detail.panel);
});
tabs.dispatchEvent(new CustomEvent('lf:tabs:select', { detail: { index: 1 } }));`}
        />
        <Aside>
          Клавиатура: ←/→ и Home/End — automatic activation (WAI-ARIA). Фокус и выбор двигаются
          вместе.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Deep-link: синхронизируйте активный tab с hash (<code>#reviews</code>) — модуль URL не
            меняет.
          </li>
          <li>
            Ленивая загрузка панели: слушайте <code>changed.lf.tabs</code> и подгружайте контент один
            раз.
          </li>
          <li>
            Для выбора значения формы (сортировка, вид списка) —{' '}
            <a href="segmented.html">Segmented</a>, не tabs.
          </li>
        </ul>
      </Section>
    </>
  );
}
