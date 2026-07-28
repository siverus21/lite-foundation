import { Section, Demo, Code, ApiTable, c } from '../components/primitives.jsx';

export default function SegmentedPage() {
  return (
    <>
      <Section title="Segmented или Tabs">
        <ApiTable
          columns={['Задача', 'Компонент']}
          rows={[
            [
              'Выбрать <strong>значение</strong>: вид списка, период, сортировку, вариант товара',
              '<strong>Segmented</strong> — это поле формы',
            ],
            [
              'Показать одну из <strong>панелей</strong> с контентом',
              '<a href="tabs.html">Tabs</a> — там роли <code>tab</code>/<code>tabpanel</code> и своя клавиатура',
            ],
            ['Два состояния, вкл/выкл', '<a href="forms.html">Switch</a>'],
          ]}
        />
      </Section>

      <Section title="Разметка">
        <p>
          Радиокнопка внутри <code>&lt;label&gt;</code>, подпись — в <code>&lt;span&gt;</code>.
          Input визуально скрыт, но остаётся фокусируемым и отправляемым, поэтому доступность
          бесплатна: <kbd>←</kbd> <kbd>→</kbd> переключают вариант, скринридер объявляет
          «радиокнопка, 2 из 3».
        </p>
        <Demo>
          <div class="segmented">
            <label class="segmented-item">
              <input type="radio" name="docsView" value="list" checked />
              <span>Список</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsView" value="grid" />
              <span>Плитка</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsView" value="map" />
              <span>Карта</span>
            </label>
          </div>
        </Demo>
        <Code
          code={`<div class="segmented">
  <label class="segmented-item">
    <input type="radio" name="view" value="list" checked><span>Список</span>
  </label>
  <label class="segmented-item">
    <input type="radio" name="view" value="grid"><span>Плитка</span>
  </label>
</div>`}
        />
        <div class="docs-note">
          <strong>
            <code>&lt;span&gt;</code> обязателен
          </strong>{' '}
          Стиль активного состояния — это <code>input:checked + span</code>. Без соседнего span
          подсветки не будет. Зато и <code>:has()</code> не нужен: работает во всём, что понимает
          соседний селектор.
        </div>
      </Section>

      <Section title="Размеры, ширина, цвет">
        <Demo>
          <div class="segmented small">
            <label class="segmented-item">
              <input type="radio" name="docsSizeS" checked />
              <span>День</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSizeS" />
              <span>Неделя</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSizeS" />
              <span>Месяц</span>
            </label>
          </div>
          <div class="segmented" style={{ marginInlineStart: '0.5rem' }}>
            <label class="segmented-item">
              <input type="radio" name="docsSizeM" checked />
              <span>День</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSizeM" />
              <span>Неделя</span>
            </label>
          </div>
          <div class="segmented large" style={{ marginInlineStart: '0.5rem' }}>
            <label class="segmented-item">
              <input type="radio" name="docsSizeL" checked />
              <span>День</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSizeL" />
              <span>Неделя</span>
            </label>
          </div>

          <p style={{ margin: '1rem 0 0.35rem' }}>
            <code>expanded</code> — на всю ширину, равные доли:
          </p>
          <div class="segmented expanded">
            <label class="segmented-item">
              <input type="radio" name="docsExp" checked />
              <span>Все</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsExp" />
              <span>Активные</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsExp" />
              <span>Архив</span>
            </label>
          </div>

          <p style={{ margin: '1rem 0 0.35rem' }}>Акцент — палитра на <code>.segmented-item</code>:</p>
          <div class="segmented">
            <label class="segmented-item success">
              <input type="radio" name="docsColor" checked />
              <span>Оплачен</span>
            </label>
            <label class="segmented-item warning">
              <input type="radio" name="docsColor" />
              <span>Ожидает</span>
            </label>
            <label class="segmented-item alert">
              <input type="radio" name="docsColor" />
              <span>Отменён</span>
            </label>
          </div>

          <p style={{ margin: '1rem 0 0.35rem' }}>Отключённый вариант:</p>
          <div class="segmented">
            <label class="segmented-item">
              <input type="radio" name="docsDis" checked />
              <span>Курьер</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsDis" />
              <span>Самовывоз</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsDis" disabled />
              <span>Почта</span>
            </label>
          </div>
        </Demo>
        <Code
          code={`<div class="segmented small">…</div>        <!-- small | large -->
<div class="segmented expanded">…</div>     <!-- на всю ширину -->
<div class="segmented stack-small">…</div>  <!-- в столбик на мобильных -->

<label class="segmented-item success">…</label>  <!-- цвет активной пилюли -->
<input type="radio" disabled>                     <!-- недоступный вариант -->`}
        />
      </Section>

      <Section title="Реакция на выбор">
        <p>
          Своих событий у компонента нет — это обычные радиокнопки, поэтому слушать надо{' '}
          <code>change</code>. Так же работает и сброс формы, и восстановление значения.
        </p>
        <Code
          code={`const group = document.getElementById('viewSwitch');

group.addEventListener('change', (event) => {
  renderList(event.target.value);           // 'list' | 'grid' | 'map'
});

const value = group.querySelector('input:checked')?.value;

group.querySelector('input[value="grid"]').checked = true;`}
        />
        <Demo>
          <div class="segmented" id="docsSegDemo">
            <label class="segmented-item">
              <input type="radio" name="docsSegDemo" value="day" checked />
              <span>День</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSegDemo" value="week" />
              <span>Неделя</span>
            </label>
            <label class="segmented-item">
              <input type="radio" name="docsSegDemo" value="month" />
              <span>Месяц</span>
            </label>
          </div>
          <p class="docs-aside" id="docsSegStatus" style={{ marginTop: '0.75rem' }}>
            Выбрано: day
          </p>
        </Demo>
      </Section>

      <Section title="Токены">
        <ApiTable
          columns={['Переменная', 'Что задаёт']}
          rows={[
            [c('--lf-segmented-bg'), 'Фон дорожки'],
            [c('--lf-segmented-thumb-bg'), 'Фон активной пилюли'],
            [`${c('--lf-segmented-color')} / ${c('--lf-segmented-color-active')}`, 'Цвет подписи неактивного / активного'],
            [c('--lf-segmented-radius'), 'Радиус дорожки и пилюли'],
            [`${c('--lf-segmented-padding')} / ${c('--lf-segmented-item-padding')}`, 'Внутренние отступы'],
            [c('--lf-segmented-gap'), 'Зазор между вариантами'],
          ]}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Свяжите <code>change</code> с перерисовкой списка/графика — значение уже в FormData.
          </li>
          <li>
            <code>expanded</code> + <code>stack-small</code> — период отчёта на мобильных в
            столбик.
          </li>
          <li>
            Цвет на <code>.segmented-item</code> для семантики статуса заказа, не дублируйте
            badge рядом.
          </li>
        </ul>
      </Section>
    </>
  );
}
