import { Section, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function MenusPage() {
  return (
    <>
      <Section title="Какой тип выбрать">
        <div class="docs-note">
          <strong>dropdown</strong> — горизонтальный top-bar, десктопные подменю по клику/ховеру.
        </div>
        <div class="docs-note">
          <strong>accordion</strong> — вертикальное меню в сайдбаре / off-canvas: вложенность
          раскрывается на месте.
        </div>
        <div class="docs-note">
          <strong>drilldown</strong> — мобильный паттерн «провалиться в уровень» с кнопкой назад
          (узкая колонка).
        </div>
        <Aside>
          Не путать с контентным <a href="accordion.html">Accordion</a> и панельным{' '}
          <a href="dropdown.html">Dropdown</a>.
        </Aside>
      </Section>

      <Section title="Dropdown menu">
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
                <li>
                  <a href="#">Item 2B</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">Item 3</a>
            </li>
          </ul>
        </Demo>
        <Code
          code={`<ul class="dropdown menu" data-menu="dropdown">
  <li><a href="#">Item 1</a></li>
  <li>
    <a href="#">Item 2</a>
    <ul class="menu">
      <li><a href="#">Item 2A</a></li>
    </ul>
  </li>
</ul>`}
        />
      </Section>

      <Section title="Accordion menu">
        <Demo>
          <ul class="vertical menu accordion-menu" data-menu="accordion" style={{ maxWidth: '16rem' }}>
            <li>
              <a href="#">Item 1</a>
            </li>
            <li>
              <a href="#">Item 2</a>
              <ul class="menu vertical nested">
                <li>
                  <a href="#">Item 2A</a>
                </li>
                <li>
                  <a href="#">Item 2B</a>
                </li>
              </ul>
            </li>
          </ul>
        </Demo>
        <Code
          code={`<ul class="vertical menu accordion-menu" data-menu="accordion">
  <li><a href="#">Item 1</a></li>
  <li>
    <a href="#">Item 2</a>
    <ul class="menu vertical nested">…</ul>
  </li>
</ul>`}
        />
      </Section>

      <Section title="Drilldown menu">
        <p>
          Нужен флаг <code>scripts.menuDrilldown</code>. JS оборачивает список в{' '}
          <code>.is-drilldown</code>, помечает уровни и вставляет пункт{' '}
          <code>.js-drilldown-back</code> («Back») в каждое вложенное меню.
        </p>
        <Demo>
          <ul class="vertical menu drilldown" data-menu="drilldown" style={{ maxWidth: '16rem' }}>
            <li>
              <a href="#">Item 1</a>
              <ul class="menu vertical nested">
                <li>
                  <a href="#">Item 1A</a>
                </li>
                <li>
                  <a href="#">Item 1B</a>
                  <ul class="menu vertical nested">
                    <li>
                      <a href="#">Item 1B i</a>
                    </li>
                    <li>
                      <a href="#">Item 1B ii</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">Item 2</a>
            </li>
          </ul>
        </Demo>
        <Code
          code={`<ul class="vertical menu drilldown" data-menu="drilldown">
  <li>
    <a href="#">Item 1</a>
    <ul class="menu vertical nested">
      <li><a href="#">Item 1A</a></li>
      <li>
        <a href="#">Item 1B</a>
        <ul class="menu vertical nested">
          <li><a href="#">Item 1B i</a></li>
          <li><a href="#">Item 1B ii</a></li>
        </ul>
      </li>
    </ul>
  </li>
  <li><a href="#">Item 2</a></li>
</ul>`}
        />
        <Aside>
          Фиксируй ширину контейнера (например <code>max-width: 16rem</code>) — высота панели
          считается от ширины wrapper. Клик по родителю с подменю сдвигает уровень влево; «Back»
          возвращает.
        </Aside>
      </Section>

      <Section title="События">
        <p>
          Все три меню шлют <code>opened</code> / <code>closed</code> в форме{' '}
          <code>&lt;verb&gt;.lf.&lt;id&gt;</code> — как остальные модули.
        </p>
        <ApiTable
          columns={['Модуль', 'События', 'detail']}
          rows={[
            [
              c('menu-dropdown'),
              c('opened.lf.menu-dropdown') + ' / ' + c('closed.lf.menu-dropdown'),
              c('{ menu, item }'),
            ],
            [
              c('menu-accordion'),
              c('opened.lf.menu-accordion') + ' / ' + c('closed.lf.menu-accordion'),
              c('{ menu, item }'),
            ],
            [
              c('menu-drilldown'),
              c('opened.lf.menu-drilldown') + ' / ' + c('closed.lf.menu-drilldown'),
              c('{ menu, submenu }'),
            ],
          ]}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Top-bar на десктопе (<code>data-menu="dropdown"</code>) + drilldown в{' '}
            <a href="offcanvas.html">off-canvas</a> на мобильных.
          </li>
          <li>
            Accordion menu в сайдбаре админки — глубокая вложенность без смены URL.
          </li>
          <li>
            Только нужные флаги в сборке: dropdown / accordion / drilldown включаются отдельно.
          </li>
          <li>
            Аналитика / закрытие соседних панелей — слушайте <code>opened.lf.menu-*</code> на
            контейнере меню (события bubble).
          </li>
        </ul>
      </Section>
    </>
  );
}
