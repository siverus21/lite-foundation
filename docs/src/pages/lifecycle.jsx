import { Section, Demo, Code, Aside, Meta, ApiTable, c } from '../components/primitives.jsx';

export default function LifecyclePage() {
  return (
    <>
      <Section title="Зачем отдельный lifecycle">
        <div class="docs-note">
          <strong>Нужен, когда</strong>
          <ul>
            <li>Контент подгружается fetch/Turbo/PJAX и внутри есть tabs / accordion / dropdown</li>
            <li>Нужно безопасно снять обработчики при уходе со страницы (SPA-фрагмент)</li>
            <li>Пишешь свой виджет в том же стиле, что и built-in модули</li>
          </ul>
        </div>
        <Aside>
          На обычной статической странице достаточно подключить <code>entry.js</code> /{' '}
          <code>lib.js</code> — <code>boot</code> сам вызовет <code>initModules(document)</code>.
        </Aside>
      </Section>

      <Section title="Публичный API">
        <Code
          code={`import {
  initModules,
  destroyModules,
  refreshModules,
  unmountModules,
} from 'virtual:lf-modules/full';
// production: from 'dist/lib.js' (re-export) or свой entry

initModules(document);              // boot делает это сам
refreshModules(ajaxContainer);      // после вставки HTML
destroyModules(ajaxContainer);      // только JS teardown
unmountModules(ajaxContainer);      // JS + очистить HTML внутри контейнера
unmountModules(panel, { removeRoot: true }); // JS + удалить сам элемент`}
        />
        <ul>
          <li>
            <code>initModules(root)</code> — создать инстансы модулей в пределах <code>root</code>
          </li>
          <li>
            <code>destroyModules(root)</code> — снять listeners/инстансы (HTML <strong>не</strong>{' '}
            удаляет)
          </li>
          <li>
            <code>refreshModules(root)</code> — destroy + init для поддерева (удобно после AJAX)
          </li>
          <li>
            <code>unmountModules(root)</code> — destroy + <code>replaceChildren()</code> (контейнер
            остаётся)
          </li>
          <li>
            <code>unmountModules(root, {'{ removeRoot: true }'})</code> — destroy +{' '}
            <code>root.remove()</code>
          </li>
        </ul>
        <Aside>
          <code>unmountModules(document)</code> / <code>body</code> / <code>html</code> только
          делает destroy — страницу не очищает.
        </Aside>
        <Aside>
          Ленивый init: добавь <code>data-lf-lazy</code> на корень компонента (например{' '}
          <code>&lt;ul data-tabs data-lf-lazy&gt;</code>) — модуль поднимется при приближении к
          viewport.
        </Aside>
        <Aside>
          ⚠️ Не вешай <code>data-lf-lazy</code> на корень, который скрыт по умолчанию (
          <code>&lt;dialog&gt;</code>, <code>.offcanvas</code>-панель, что-то внутри неактивной
          вкладки/аккордеона) — <code>IntersectionObserver</code> не сработает для{' '}
          <code>display: none</code> элемента, поэтому модуль всё равно поднимется сразу (без
          ленивой отсрочки), но лучше просто не размечать такие корни лениво.
        </Aside>
      </Section>

      <Section title="Базовый класс Module">
        <p>
          Каждый UI-модуль наследует <code>Module</code> и задаёт <code>static id</code> в
          kebab-case. От этого id строятся имена событий — нельзя «разъехаться» между атрибутами,
          командами и исходящими событиями.
        </p>
        <ApiTable
          columns={['Контракт', 'Форма', 'Пример']}
          rows={[
            [
              'Исходящее событие',
              c('<verb>.lf.<id>'),
              `${c('changed.lf.quantity')}, ${c('committed.lf.quantity')}`,
            ],
            [
              'Команда извне',
              c('lf:<id>:<action>'),
              `${c('lf:quantity:set')}, ${c('lf:quantity:busy')}`,
            ],
            ['Флаг «уже смонтирован»', c('data-<id>-ready'), c('data-quantity-ready')],
            [
              'Form slider vs Swiper',
              `${c('form-slider')} / ${c('swiper')}`,
              `${c('changed.lf.form-slider')} · Swiper без обёртки событий`,
            ],
          ]}
        />
        <Code
          code={`import { Module } from '../core/Module.js';

export class Quantity extends Module {
  static id = 'quantity';

  constructor(root = document) {
    super(root);
    // Не пересоздаёт кнопки/слушатели при refreshModules
    this.mountOnce('[data-quantity]', (el) => this.#setup(el));
  }

  #setup(el) {
    this.commands(el, {
      set: (event) => this.set(el, event.detail?.value),
      increase: () => this.increase(el),
    });

    // → changed.lf.quantity (bubbles)
    this.emit(el, 'changed', { value: 1, previous: 0, reason: 'api' });

    // Таймер и rAF снимаются на destroy() — нет утечек после unmount
    this.timeout(() => this.emit(el, 'committed', { value: 1 }), 400);
  }

  set(el, value) {
    const state = this.stateFor(el); // корень или любой потомок
    // …
  }
}`}
        />
        <ul>
          <li>
            <code>this.on(target, type, fn)</code> — слушатель с <code>AbortSignal</code>, уходит в{' '}
            <code>destroy()</code>
          </li>
          <li>
            <code>this.emit(el, verb, detail)</code> — исходящее <code>verb.lf.&lt;id&gt;</code>
          </li>
          <li>
            <code>this.commands(el, {'{ set, … }'})</code> — входящие <code>lf:&lt;id&gt;:set</code>
          </li>
          <li>
            <code>this.timeout</code> / <code>this.raf</code> / <code>this.clearTimer</code> — таймеры
            экземпляра
          </li>
          <li>
            <code>this.mountOnce(sel, setup)</code> — идемпотентный mount +{' '}
            <code>data-&lt;id&gt;-ready</code>
          </li>
          <li>
            <code>this.stateFor(el)</code> — state по корню или любому элементу внутри (например
            исходному <code>&lt;select&gt;</code>)
          </li>
        </ul>
        <Aside>
          Хелперы имён: <code>eventName(verb, id)</code> и <code>commandName(id, action)</code> в{' '}
          <code>js/core/events.js</code>. Past-tense глагол (<code>changed</code>,{' '}
          <code>committed</code>) — «уже случилось»; present (<code>close</code>) — cancelable «сейчас
          закрою».
        </Aside>
      </Section>

      <Section title="Свой модуль">
        <p>
          Наследуй <code>Module</code>, задай <code>static id</code>, вешай события через{' '}
          <code>this.on(…)</code> — тогда <code>destroy()</code> снимет их автоматически.
        </p>
        <Code
          code={`import { Module } from '../core/Module.js';

export class MyWidget extends Module {
  static id = 'my-widget';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-my-widget]', (el) => {
      this.on(el, 'click', () => this.emit(el, 'clicked'));
      this.commands(el, {
        ping: () => this.emit(el, 'pinged'),
      });
    });
  }
}

// Снаружи: el.dispatchEvent(new CustomEvent('lf:my-widget:ping'));
// Слушать: el.addEventListener('clicked.lf.my-widget', …);`}
        />
        <Aside>
          Зарегистрируй класс в <code>scripts/sync-features.js</code> (карта модулей) и включи флаг
          в <code>config/features.js</code>.
        </Aside>
      </Section>

      <Section title="Живой пример: refresh после «AJAX»">
        <Meta>
          1) Вставить HTML → native <code>&lt;details&gt;</code>.
          <br />
          2) <code>refreshModules(#mount)</code> — JS-анимация.
          <br />
          3) <code>destroyModules(#mount)</code> — только JS, HTML остаётся.
          <br />
          4) <code>unmountModules(#mount)</code> — JS + очистка разметки внутри mount.
        </Meta>
        <Demo>
          <p>
            <button type="button" class="button primary" id="docs-inject">
              Вставить accordion
            </button>{' '}
            <button type="button" class="button secondary" id="docs-refresh">
              refreshModules(#mount)
            </button>{' '}
            <button type="button" class="button hollow" id="docs-destroy">
              destroyModules(#mount)
            </button>{' '}
            <button type="button" class="button alert" id="docs-unmount">
              unmountModules(#mount)
            </button>
          </p>
          <p class="docs-aside" id="docs-lifecycle-status">
            Статус: mount пуст.
          </p>
          <div id="docs-mount" />
        </Demo>
        <Code
          code={`const mount = document.getElementById('docs-mount');
mount.insertAdjacentHTML('beforeend', accordionHtml);
refreshModules(mount);

destroyModules(mount);  // JS off, HTML на месте
unmountModules(mount);  // JS off + mount пустой (контейнер остаётся)

// убрать сам узел:
unmountModules(panel, { removeRoot: true });`}
        />
        <div class="docs-note">
          <strong>Важно</strong>
          <ul>
            <li>
              <code>destroyModules</code> — только listeners; <code>unmountModules</code> — ещё и HTML
            </li>
            <li>
              Оба работают только если раньше был <code>init</code>/<code>refresh</code> с тем же{' '}
              <code>root</code>
            </li>
            <li>
              Глобальный <code>initModules(document)</code> не видит узлы, вставленные позже — для
              AJAX всегда <code>refreshModules(container)</code>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Turbo/PJAX: <code>refreshModules</code> на контейнер после каждого visit/render.
          </li>
          <li>
            SPA unmount: <code>unmountModules(panel, {'{ removeRoot: true }'})</code> перед удалением
            узла.
          </li>
          <li>
            Свой модуль — наследуй <code>Module</code>, регистрируй в sync-features и feature-флагах.
          </li>
        </ul>
      </Section>
    </>
  );
}
