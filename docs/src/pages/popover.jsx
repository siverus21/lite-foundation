import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function PopoverPage() {
  return (
    <>
      <Section title="Поддержка в вашем браузере">
        <p>
          Ниже — живая проверка: что именно делает платформа в браузере, из которого вы читаете эту
          страницу, и что берёт на себя модуль.
        </p>
        <Demo>
          <ul id="docsPopoverProbe" class="docs-probe">
            <li>Проверка…</li>
          </ul>
        </Demo>
        <Aside>
          Проверка сделана теми же двумя строчками, что и внутри модуля — экспортируемой функцией{' '}
          <code>popoverSupport()</code> из <code>js/modules/popover.js</code>.
        </Aside>
      </Section>

      <Section title="Три уровня, один и тот же код">
        <p>Разметка не меняется — меняется только то, кто делает работу:</p>
        <ApiTable
          columns={['Уровень', 'Условие', 'Кто открывает', 'Кто позиционирует']}
          rows={[
            [
              '1. Только платформа',
              <>
                <code>popover</code> + anchor positioning
                <br />
                <span class="docs-aside">Chrome 125+, Safari 26+, Firefox 147+</span>
              </>,
              'Браузер',
              <>
                CSS (<code>position-area</code>, <code>position-try</code>)
              </>,
            ],
            [
              '2. Платформа + JS-позиция',
              <>
                есть <code>popover</code>, нет anchor positioning
                <br />
                <span class="docs-aside">Chrome 114+, Safari 17+, Firefox 125+</span>
              </>,
              'Браузер',
              <>Модуль (<code>getBoundingClientRect</code>)</>,
            ],
            [
              '3. Полный фолбэк',
              <>
                нет <code>popover</code>
                <br />
                <span class="docs-aside">браузеры старше</span>
              </>,
              <>Модуль (клик вне, <kbd>Escape</kbd>)</>,
              'Модуль',
            ],
          ]}
        />
        <div class="docs-note">
          <strong>Что теряется на уровне 3</strong>
          Панель рисуется не в топ-слое, а через <code>z-index: var(--lf-z-popover)</code>. Внутри
          модалки или другого стекового контекста поповер может оказаться под соседним элементом — на
          этом уровне используйте <a href="dropdown.html">Dropdown</a>, он изначально рассчитан на
          такой сценарий. Событийный контракт (<code>shown.lf.popover</code> и остальные) одинаков на
          всех трёх уровнях, менять код приложения не нужно.
        </div>
      </Section>

      <Section title="Разметка">
        <p>
          Связь кнопки и панели — стандартный <code>popovertarget</code>, он же делает кнопку
          неявным «якорем» для CSS-позиционирования, поэтому никаких <code>anchor-name</code>{' '}
          прописывать не нужно.
        </p>
        <Demo>
          <button class="button" popovertarget="docsPopoverMenu">
            Аккаунт ▾
          </button>
          <div class="popover" id="docsPopoverMenu" popover data-popover>
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
        </Demo>
        <Code
          code={`<button class="button" popovertarget="userMenu">Аккаунт ▾</button>

<div class="popover" id="userMenu" popover data-popover>
  <ul class="popover-menu">
    <li><a href="/profile">Профиль</a></li>
    <li><button type="button">Выйти</button></li>
  </ul>
</div>`}
        />
        <Aside>
          <code>data-popover</code> — метка для модуля. Без него панель остаётся полностью нативной:
          работает там, где есть <code>popover</code>, и не работает нигде больше.
        </Aside>
      </Section>

      <Section title="Размещение и настройки">
        <ApiTable
          columns={['Атрибут / класс', 'По умолчанию', 'Что делает']}
          rows={[
            ['без класса', '—', 'Снизу, выравнивание по начальному краю кнопки'],
            [c('class="top"'), '—', 'Сверху'],
            [c('class="center"'), '—', <>По центру кнопки (комбинируется с <code>top</code>)</>],
            [
              c('class="inline-end"') + ' / ' + c('class="inline-start"'),
              '—',
              'Справа / слева (в RTL — наоборот)',
            ],
            [
              c('class="match-anchor"'),
              '—',
              <>Ширина панели равна ширине кнопки. Только уровень 1 (<code>anchor-size()</code>)</>,
            ],
            [c('data-popover-offset="8"'), c('6'), 'Зазор до кнопки, px'],
          ]}
        />
        <Demo>
          <button class="button secondary" popovertarget="docsPopoverTop">
            Сверху
          </button>
          <div class="popover top" id="docsPopoverTop" popover data-popover>
            <p class="popover-title">Сверху</p>
            <p style={{ margin: 0 }}>class="top"</p>
          </div>

          <button class="button secondary" popovertarget="docsPopoverEnd">
            Справа
          </button>
          <div
            class="popover inline-end"
            id="docsPopoverEnd"
            popover
            data-popover
            data-popover-offset="10"
          >
            <p class="popover-title">Справа</p>
            <p style={{ margin: 0 }}>class="inline-end", отступ 10px</p>
          </div>

          <button class="button secondary" popovertarget="docsPopoverForm">
            С формой
          </button>
          <div class="popover" id="docsPopoverForm" popover data-popover>
            <p class="popover-title">Фильтр</p>
            <label>
              Город
              <input class="input" type="text" placeholder="Москва" />
            </label>
            <button class="button tiny primary" type="button" style={{ margin: 0 }}>
              Применить
            </button>
          </div>
        </Demo>
        <Aside>
          На уровне 1 браузер сам «переворачивает» панель, если она не влезает (
          <code>position-try-fallbacks</code>). На уровнях 2–3 то же делает модуль: проверяет
          границы вьюпорта и при нехватке места отражает по вертикали и подтягивает по горизонтали.
        </Aside>
      </Section>

      <Section title="JS API">
        <p>
          Для типового меню JS не нужен вообще: <code>popovertarget</code> и модуль закрывают всё.
          API нужен, когда открытием управляет код — например, поповер показывается после ответа
          сервера.
        </p>
        <h3>Командные события (без импорта)</h3>
        <ApiTable
          columns={['Событие (на панели)', 'Эффект']}
          rows={[
            [c('lf:popover:show'), 'Открыть'],
            [c('lf:popover:hide'), 'Закрыть'],
            [c('lf:popover:toggle'), 'Переключить'],
          ]}
        />
        <h3>События, на которые можно подписаться</h3>
        <ApiTable
          columns={['Событие', 'detail', 'Когда']}
          rows={[
            [
              c('shown.lf.popover'),
              c('{ native }'),
              <>
                Панель открыта. <code>native: false</code> — сработал фолбэк
              </>,
            ],
            [
              c('hidden.lf.popover'),
              c('{ native }'),
              <>
                Панель закрыта (в том числе кликом вне и <kbd>Escape</kbd>)
              </>,
            ],
          ]}
        />
        <Code
          code={`const panel = document.getElementById('userMenu');

// Открыть из кода
panel.dispatchEvent(new CustomEvent('lf:popover:show'));

// Ленивая загрузка содержимого при первом открытии
let loaded = false;
panel.addEventListener('shown.lf.popover', async () => {
  if (loaded) return;
  panel.innerHTML = await fetch('/api/notifications').then((r) => r.text());
  loaded = true;
});

// Сохранить черновик фильтра при закрытии
panel.addEventListener('hidden.lf.popover', () => saveDraft(panel));`}
        />
        <h3>Методы инстанса</h3>
        <p>
          Нужны, если вы создаёте модуль вручную (например, для поддерева, отрисованного после
          инициализации страницы).
        </p>
        <Code
          code={`import { Popover, popoverSupport } from '/js/modules/popover.js';

const popovers = new Popover(document.getElementById('app'));

popovers.show(panel);          // второй аргумент — свой «якорь», если он не popovertarget
popovers.hide(panel);
popovers.toggle(panel);
popovers.hideAll();            // закрыть все открытые
popovers.support;              // { native, anchor } — что умеет браузер
popovers.destroy();            // снять все слушатели

popoverSupport();              // те же флаги без создания инстанса`}
        />
        <Demo>
          <button class="button tiny" type="button" id="docsPopoverApiShow">
            show()
          </button>{' '}
          <button class="button tiny" type="button" id="docsPopoverApiHide">
            hide()
          </button>{' '}
          <button class="button tiny" popovertarget="docsPopoverApi">
            Панель
          </button>
          <div class="popover" id="docsPopoverApi" popover data-popover>
            <p style={{ margin: 0 }}>Открыт из кода</p>
          </div>
          <Aside>
            <span id="docsPopoverApiLog" style={{ marginTop: '0.75rem' }}>
              События появятся здесь
            </span>
          </Aside>
        </Demo>
      </Section>

      <Section title="Popover, Dropdown или Modal">
        <ApiTable
          columns={['Задача', 'Компонент', 'Почему']}
          rows={[
            [
              'Меню, фильтр, подсказка рядом с кнопкой',
              <strong>Popover</strong>,
              'Топ-слой и light dismiss от платформы, позиционирование без JS',
            ],
            [
              'То же, но нужна работа в старых браузерах или внутри модалки',
              <a href="dropdown.html">Dropdown</a>,
              'Обычное абсолютное позиционирование, без топ-слоя и требований к версиям',
            ],
            [
              'Диалог, который нельзя проигнорировать',
              <a href="modal.html">Modal</a>,
              <>
                <code>&lt;dialog&gt;</code>: фон становится <code>inert</code>, фокус заперт внутри
              </>,
            ],
          ]}
        />
      </Section>

      <Section title="Доступность">
        <ul>
          <li>
            <code>aria-expanded</code> на кнопке модуль ставит и обновляет сам.
          </li>
          <li>
            Фокус внутри поповера <strong>не</strong> запирается — это не диалог. <kbd>Tab</kbd>{' '}
            уходит дальше по странице, и это правильное поведение для меню и подсказок.
          </li>
          <li>
            Для меню-списка используйте <code>&lt;ul class="popover-menu"&gt;</code> из ссылок и
            кнопок: нативные элементы уже дают роль и клавиатуру.
          </li>
          <li>
            <kbd>Escape</kbd> закрывает на всех трёх уровнях. На уровне 3 это общий обработчик из{' '}
            <code>js/core/global-events.js</code> — один слушатель на страницу, а не на панель.
          </li>
        </ul>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Ленивая загрузка содержимого на <code>shown.lf.popover</code> — один раз на первое
            открытие, без лишних запросов.
          </li>
          <li>
            Внутри модалки или старого браузера — <a href="dropdown.html">Dropdown</a> вместо
            поповера; событийный контракт приложения можно сохранить в обёртке.
          </li>
          <li>
            <code>popoverSupport()</code> в devtools или feature-detect UI — показать пользователю
            уровень деградации, как на этой странице.
          </li>
        </ul>
      </Section>
    </>
  );
}
