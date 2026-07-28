import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function ComboboxPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Больше ~10 вариантов, по которым удобнее печатать, чем скроллить',
            'Варианты приходят с сервера по мере набора (поиск товаров, адресов)',
            'Нужно разрешить и ввод «своего» значения (без data-combobox-strict)',
          ]}
        />
        <p>
          До десятка вариантов — оставьте нативный <code>&lt;select&gt;</code>: на мобильных он
          вызывает системный выбор, который всегда удобнее. Для нескольких значений сразу —{' '}
          <a href="tag-input.html">Tag input</a>.
        </p>
      </Section>

      <Section title="Из &lt;select&gt; (рекомендуемый путь)">
        <p>
          Ставите <code>data-combobox</code> на существующий <code>&lt;select&gt;</code> — модуль
          строит поле поиска рядом, а сам select прячет и оставляет как поле формы (
          <code>data-combobox-source</code>). Значение, <code>name</code>, обязательность — всё
          остаётся на нём.
        </p>
        <Demo>
          <label for="docsCity">Город</label>
          <select id="docsCity" name="city" data-combobox>
            <option value="">— выберите —</option>
            <option value="msk">Москва</option>
            <option value="spb">Санкт-Петербург</option>
            <option value="nsk">Новосибирск</option>
            <option value="ekb">Екатеринбург</option>
            <option value="kzn">Казань</option>
            <option value="nn">Нижний Новгород</option>
            <option value="chel">Челябинск</option>
            <option value="oms">Омск</option>
          </select>
          <Aside>
            <span id="docsCityStatus">Ничего не выбрано</span>
          </Aside>
        </Demo>
        <Code
          code={`<select name="city" data-combobox>
  <option value="">— выберите —</option>
  <option value="msk">Москва</option>
  <option value="spb">Санкт-Петербург</option>
</select>`}
        />
        <Aside>
          <code>&lt;option value=""&gt;</code> — не вариант выбора, а подсказка: его текст становится{' '}
          <code>placeholder</code> поля.
        </Aside>
      </Section>

      <Section title="Своя разметка">
        <p>
          Когда варианты приходят с сервера, начинать со <code>&lt;select&gt;</code> нечего. Тогда
          собираете корень сами — модуль дополнит его ARIA, кнопкой очистки и скрытым полем для
          отправки.
        </p>
        <Code
          code={`<div class="combobox" data-combobox data-combobox-name="product"
     data-combobox-filter="none" data-combobox-min-chars="2">
  <input class="input combobox-input" type="text" placeholder="Название товара">
  <ul class="listbox" hidden></ul>
</div>`}
        />
        <Aside>
          <code>data-combobox-filter="none"</code> означает «фильтрует сервер»: модуль показывает то,
          что ему передали, ничего не отбрасывая.
        </Aside>
      </Section>

      <Section title="Настройки">
        <ApiTable
          columns={['Атрибут', 'По умолчанию', 'Что делает']}
          rows={[
            [
              c('data-combobox-filter'),
              c('contains'),
              <>
                <code>contains</code> — подстрока в любом месте, <code>starts</code> — только начало,{' '}
                <code>none</code> — фильтрует сервер
              </>,
            ],
            [c('data-combobox-min-chars'), c('0'), 'Не открывать список, пока не набрано N символов'],
            [c('data-combobox-debounce'), c('250'), <>Задержка события <code>input.lf.combobox</code> в мс</>],
            [
              c('data-combobox-strict'),
              'выкл.',
              'Принимать только значения из списка: непопавший текст сбрасывается при потере фокуса',
            ],
            [c('data-combobox-empty'), c('Ничего не найдено'), 'Текст пустого состояния'],
            [c('data-combobox-name'), '—', <>name скрытого поля (когда источник не <code>&lt;select&gt;</code>)</>],
          ]}
        />
      </Section>

      <Section title="Клавиатура">
        <ApiTable
          columns={['Клавиша', 'Действие']}
          rows={[
            [<><kbd>↓</kbd> / <kbd>↑</kbd></>, 'Открыть список, двигаться по вариантам'],
            [<><kbd>Home</kbd> / <kbd>End</kbd></>, 'Первый / последний вариант'],
            [<kbd>Enter</kbd>, 'Выбрать подсвеченный'],
            [<kbd>Escape</kbd>, 'Закрыть список; повторно — очистить поле'],
            [<kbd>Tab</kbd>, 'Уйти с поля: список закрывается, выбор сохраняется'],
          ]}
        />
        <Aside>
          Фокус всё время остаётся в поле ввода — подсветку варианта передаёт{' '}
          <code>aria-activedescendant</code>. Так печатать и выбирать можно не отпуская клавиатуру, и
          скринридер читает вариант, не теряя контекст поля.
        </Aside>
      </Section>

      <Section title="События">
        <ApiTable
          columns={['Событие (на корне)', 'detail', 'Когда']}
          rows={[
            [
              c('input.lf.combobox'),
              c('{ query }'),
              'Пользователь печатает, с дебаунсом — сюда вешают запрос к серверу',
            ],
            [
              c('changed.lf.combobox'),
              c('{ value, label, reason }'),
              <>Выбор изменился. <code>reason</code>: <code>'select'</code>, <code>'clear'</code>, <code>'api'</code></>,
            ],
            [
              c('opened.lf.combobox') + ' / ' + c('closed.lf.combobox'),
              '—',
              'Список открылся / закрылся',
            ],
          ]}
        />
        <h3>Командные события</h3>
        <ApiTable
          columns={['Событие', 'detail', 'Эффект']}
          rows={[
            [
              c('lf:combobox:options'),
              c('{ options, keepOpen? }'),
              <>Заменить список. <code>options</code> — массив <code>{'{ value, label, disabled? }'}</code></>,
            ],
            [c('lf:combobox:set'), c('{ value }'), 'Выбрать вариант из кода'],
            [c('lf:combobox:loading'), c('{ loading }'), 'Спиннер в поле, пока идёт запрос'],
            [c('lf:combobox:open') + ' / ' + c('lf:combobox:close'), '—', 'Открыть / закрыть список'],
          ]}
        />
      </Section>

      <Section title="Асинхронный источник">
        <p>
          Полный цикл: печатаем → дебаунс → запрос → спиннер → новые варианты. Ниже — рабочий пример,
          поиск идёт по локальному массиву с искусственной задержкой 300&nbsp;мс, но код запроса ровно
          тот же, что и с настоящим API.
        </p>
        <Demo>
          <label for="docsAsyncField">Товар</label>
          <div
            class="combobox"
            data-combobox
            id="docsAsyncCombo"
            data-combobox-name="product"
            data-combobox-filter="none"
            data-combobox-min-chars="2"
            data-combobox-empty="Ничего не нашли — уточните запрос"
          >
            <input
              class="input combobox-input"
              type="text"
              id="docsAsyncField"
              placeholder="Введите минимум 2 символа"
            />
            <ul class="listbox" hidden></ul>
          </div>
          <Aside>
            <span id="docsAsyncStatus">Ждём ввода…</span>
          </Aside>
        </Demo>
        <Code
          code={`const combo = document.getElementById('productCombo');
let abort;

combo.addEventListener('input.lf.combobox', async (event) => {
  const { query } = event.detail;

  abort?.abort();                       // отменяем предыдущий запрос
  abort = new AbortController();

  combo.dispatchEvent(new CustomEvent('lf:combobox:loading', { detail: { loading: true } }));
  try {
    const res = await fetch(\`/api/products?q=\${encodeURIComponent(query)}\`, {
      signal: abort.signal,
    });
    const items = await res.json();

    combo.dispatchEvent(new CustomEvent('lf:combobox:options', {
      detail: { options: items.map((i) => ({ value: i.id, label: i.title })) },
    }));
  } catch (error) {
    if (error.name !== 'AbortError') {
      combo.dispatchEvent(new CustomEvent('lf:combobox:options', { detail: { options: [] } }));
    }
  } finally {
    combo.dispatchEvent(new CustomEvent('lf:combobox:loading', { detail: { loading: false } }));
  }
});

combo.addEventListener('changed.lf.combobox', (event) => {
  const { value, label, reason } = event.detail;
  if (reason === 'clear') return resetPreview();
  loadPreview(value);
});`}
        />
      </Section>

      <Section title="Методы инстанса">
        <Code
          code={`import { Combobox } from 'lite-foundation/js/modules/combobox.js';

const comboboxes = new Combobox(document.getElementById('checkout'));
// Любой из двух: корень .combobox или исходный <select>
const root = document.getElementById('citySelect');

comboboxes.selection(root);        // { value, label } | null
comboboxes.set(root, 'spb');       // выбрать вариант
comboboxes.setOptions(root, [{ value: 'spb', label: 'Санкт-Петербург' }]);
comboboxes.loading(root, true);    // спиннер в поле
comboboxes.open(root);
comboboxes.close(root);
comboboxes.destroy();`}
        />
        <Aside>
          Для разметки, появившейся после инициализации, вызывать конструктор вручную не нужно —
          достаточно <code>refreshModules()</code>, см. <a href="lifecycle.html">JS API</a>.
          Повторный проход безопасен: корень помечается <code>data-combobox-ready</code>, второй раз
          он не оборачивается.
        </Aside>
      </Section>

      <Section title="Валидация и форма">
        <ul>
          <li>
            Значение отправляет исходный <code>&lt;select&gt;</code> (или скрытое поле).{' '}
            <code>required</code> на нём продолжает работать.
          </li>
          <li>
            <code>data-combobox-strict</code> — жёсткий режим: набрал «Мсква», ушёл с поля → значение
            сбрасывается. Без него текст остаётся, а <code>value</code> остаётся пустым: удобно,
            когда «своё» значение допустимо.
          </li>
          <li>
            Ошибку показывайте штатно — <code>.input.is-invalid</code> и <code>.form-error</code>, см.{' '}
            <a href="forms.html">Forms</a>.
          </li>
        </ul>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            <code>AbortController</code> на каждый <code>input.lf.combobox</code> — отмена предыдущего
            запроса при быстром наборе.
          </li>
          <li>
            <code>data-combobox-filter="none"</code> + серверный поиск; локальный{' '}
            <code>contains</code> — для статического списка до ~100 пунктов.
          </li>
          <li>
            <code>changed.lf.combobox</code> с <code>reason: 'select'</code> — подгрузка превью
            карточки товара или адреса доставки.
          </li>
        </ul>
      </Section>
    </>
  );
}
