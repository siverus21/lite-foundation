import { Section, When, Demo, Code, Aside, ApiTable, c, Anatomy } from '../components/primitives.jsx';

export default function QuantityPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Количество товара в корзине и в карточке товара',
            'Число гостей, мест, страниц — любое небольшое целое',
            'Дробные величины с шагом: вес, длина, доли (<code>step="0.1"</code>)',
          ]}
          bad={[
            'Длинный непрерывный диапазон «на глаз» — <a href="slider.html">Slider</a> или native range / form-slider',
            'Выбор из фиксированного списка значений — <a href="segmented.html">Segmented</a> или select',
          ]}
        >
          <p>
            Модуль не заменяет <code>&lt;input type="number"&gt;</code> — он обрамляет его кнопками и
            унифицирует события/команды.
          </p>
        </When>
      </Section>

      <Section title="Анатомия">
        <Anatomy
          rows={[
            {
              part: '.quantity[data-quantity]',
              detail: 'Корень. На нём атрибуты настроек и командный API.',
            },
            {
              part: '.quantity-input',
              detail: 'Настоящий <code>type="number"</code> — уходит в FormData.',
            },
            {
              part: '.quantity-button[data-quantity-decrease|increase]',
              detail: 'Кнопки. Если их нет в разметке — модуль создаст сам.',
            },
            {
              part: 'data-quantity-ready',
              detail: 'Флаг mountOnce: защита от двойной инициализации при refreshModules.',
            },
          ]}
        />
      </Section>

      <Section title="Минимальная разметка">
        <p>
          Достаточно корня и поля — кнопки модуль создаст сам, с <code>aria-label</code> и{' '}
          <code>type="button"</code>. Значение берётся из <code>value</code> поля.
        </p>
        <Demo>
          <div class="quantity" data-quantity>
            <input class="quantity-input" type="number" name="qty" value="1" min="1" max="10" />
          </div>
        </Demo>
        <Code
          code={`<div class="quantity" data-quantity>
  <input class="quantity-input" type="number" name="qty" value="1" min="1" max="10">
</div>`}
        />
        <p>Своя разметка тоже работает — если кнопки есть, модуль их не дублирует:</p>
        <Code
          code={`<div class="quantity" data-quantity>
  <button class="quantity-button" type="button" data-quantity-decrease aria-label="Меньше">−</button>
  <input class="quantity-input" type="number" name="qty" value="1">
  <button class="quantity-button" type="button" data-quantity-increase aria-label="Больше">+</button>
</div>`}
        />
        <Aside>
          Совсем без разметки поля тоже можно:{' '}
          <code>{`<div class="quantity" data-quantity data-quantity-name="qty" data-quantity-value="1"></div>`}</code>{' '}
          — модуль создаст и <code>input</code>, и обе кнопки.
        </Aside>
      </Section>

      <Section title="Настройки">
        <p>
          Атрибуты на корне. <code>min</code>, <code>max</code> и <code>step</code> на самом поле
          приоритетнее — так нативная валидация формы и модуль всегда согласованы.
        </p>
        <ApiTable
          columns={['Атрибут', 'По умолчанию', 'Что делает']}
          rows={[
            [c('data-quantity-min'), c('0'), 'Нижняя граница. На ней «−» становится disabled'],
            [c('data-quantity-max'), '∞', 'Верхняя граница. На ней «+» становится disabled'],
            [c('data-quantity-step'), c('1'), 'Шаг одного нажатия'],
            [
              c('data-quantity-precision'),
              'из шага',
              'Знаков после запятой. По умолчанию выводится из шага',
            ],
            [c('data-quantity-wrap'), 'выкл.', 'За max — прыжок на min и обратно'],
            [c('data-quantity-hold'), 'выкл.', 'Удержание кнопки повторяет шаг'],
            [c('data-quantity-debounce'), c('0'), 'Задержка committed.lf.quantity в мс'],
            [c('data-quantity-name'), '—', 'name для сгенерированного поля'],
            [c('data-quantity-value'), c('0'), 'Начальное значение для сгенерированного поля'],
          ]}
        />
        <p>Размеры и раскладка — классами на корне:</p>
        <Demo>
          <div class="quantity small" data-quantity>
            <input class="quantity-input" type="number" value="1" />
          </div>
          <div class="quantity" data-quantity>
            <input class="quantity-input" type="number" value="1" />
          </div>
          <div class="quantity large" data-quantity>
            <input class="quantity-input" type="number" value="1" />
          </div>
        </Demo>
        <Code
          code={`<div class="quantity small">…</div>      <!-- small | large -->
<div class="quantity expanded">…</div>   <!-- на всю ширину контейнера -->`}
        />
      </Section>

      <Section title="Примеры настроек">
        <Demo>
          <p style={{ marginBottom: '0.35rem' }}>
            <strong>Дробный шаг</strong> — вес, 0.5 кг, до 5 кг
          </p>
          <div class="quantity" data-quantity>
            <input class="quantity-input" type="number" value="1" min="0.5" max="5" step="0.5" />
          </div>
          <p style={{ margin: '1rem 0 0.35rem' }}>
            <strong>Удержание</strong> — зажмите «+», чтобы разогнаться
          </p>
          <div class="quantity" data-quantity data-quantity-hold data-quantity-max="500">
            <input class="quantity-input" type="number" value="1" />
          </div>
          <p style={{ margin: '1rem 0 0.35rem' }}>
            <strong>Циклично</strong> — за 12 идёт 1 (часы)
          </p>
          <div class="quantity" data-quantity data-quantity-wrap data-quantity-min="1" data-quantity-max="12">
            <input class="quantity-input" type="number" value="12" />
          </div>
        </Demo>
      </Section>

      <Section title="События">
        <p>
          Два события с одинаковым <code>detail</code>. <code>changed.lf.quantity</code> — на каждое
          изменение. <code>committed.lf.quantity</code> — с задержкой{' '}
          <code>data-quantity-debounce</code>: на него вешают запрос к серверу.
        </p>
        <ApiTable
          columns={['Поле detail', 'Значение']}
          rows={[
            [c('value'), 'Новое значение (уже в границах и округлённое)'],
            [c('previous'), 'Предыдущее — удобно для отката при ошибке сервера'],
            [c('reason'), "'increase' | 'decrease' | 'input' | 'api' | 'limits'"],
            [c('min, max, step'), 'Актуальные границы'],
          ]}
        />
        <Code
          code={`qty.addEventListener('changed.lf.quantity', (e) => { /* UI */ });
qty.addEventListener('committed.lf.quantity', async (e) => { /* API */ });`}
        />
      </Section>

      <Section title="Командные события">
        <p>
          Управление извне без импорта класса: модуль слушает события на корне компонента.
        </p>
        <ApiTable
          columns={['Событие', 'detail', 'Эффект']}
          rows={[
            [c('lf:quantity:set'), c('{ value }'), 'Задать значение'],
            [c('lf:quantity:increase'), c('{ by? }'), 'Прибавить шаг или by'],
            [c('lf:quantity:decrease'), c('{ by? }'), 'Отнять шаг или by'],
            [c('lf:quantity:limits'), c('{ min?, max?, step?, clamp? }'), 'Сменить границы на ходу'],
            [c('lf:quantity:busy'), c('{ busy }'), 'aria-busy + блокировка кнопок'],
          ]}
        />
        <Demo>
          <div
            class="quantity"
            data-quantity
            id="docsQtyApi"
            data-quantity-debounce="500"
            data-quantity-max="10"
          >
            <input class="quantity-input" type="number" value="1" />
          </div>
          <p style={{ marginTop: '0.75rem' }}>
            <button class="button tiny" type="button" data-docs-qty="set">
              set(5)
            </button>{' '}
            <button class="button tiny" type="button" data-docs-qty="increase">
              increase(3)
            </button>{' '}
            <button class="button tiny" type="button" data-docs-qty="limits">
              max = 3
            </button>{' '}
            <button class="button tiny" type="button" data-docs-qty="unlimit">
              max = ∞
            </button>{' '}
            <button class="button tiny" type="button" data-docs-qty="busy">
              busy 1.5 c
            </button>
          </p>
          <Aside>
            <span id="docsQtyLog">changed / commit появятся здесь</span>
          </Aside>
        </Demo>
      </Section>

      <Section title="Методы инстанса">
        <p>
          Нужны, когда компонент вставляется после инициализации или когда пишете обёртку.
        </p>
        <Code
          code={`import { Quantity } from 'lite-foundation/js/modules/quantity.js';

const quantities = new Quantity(document.getElementById('cart'));
quantities.value(el);
quantities.set(el, 7);
quantities.increase(el, 10);
quantities.destroy();`}
        />
        <Aside>
          Для динамически добавленной разметки достаточно <code>refreshModules()</code> — см.{' '}
          <a href="lifecycle.html">JS API</a>.
        </Aside>
      </Section>

      <Section title="Форма и доступность">
        <ul>
          <li>
            Значение живёт в настоящем <code>&lt;input type="number"&gt;</code> — уходит с FormData.
          </li>
          <li>
            Набранное вручную <strong>не</strong> обрезается на каждом нажатии — обрезка на{' '}
            <code>change</code> и Enter.
          </li>
          <li>
            На границах кнопка получает <code>disabled</code>, кроме{' '}
            <code>data-quantity-wrap</code>.
          </li>
        </ul>
        <Demo>
          <form id="docsQtyForm">
            <label>
              Количество
              <div class="quantity" data-quantity>
                <input class="quantity-input" type="number" name="qty" value="2" min="1" max="9" />
              </div>
            </label>
            <button class="button tiny primary" type="submit" style={{ marginTop: '0.75rem' }}>
              Отправить
            </button>
            <Aside>
              <span id="docsQtyFormResult" />
            </Aside>
          </form>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Слушайте <code>committed.lf.quantity</code> + <code>lf:quantity:busy</code> для
            оптимистичного обновления корзины.
          </li>
          <li>
            После ответа склада шлите <code>lf:quantity:limits</code> с новым <code>max</code>.
          </li>
          <li>
            Свой UI вокруг того же контракта: достаточно сохранить{' '}
            <code>data-quantity</code> и поле <code>.quantity-input</code>.
          </li>
        </ul>
      </Section>
    </>
  );
}
