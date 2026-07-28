import { Section, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function TablePage() {
  return (
    <>
      <Section title="Базовые классы">
        <ApiTable
          columns={['Класс', 'Что делает']}
          rows={[
            [
              c('striped') + ' / ' + c('unstriped'),
              'Включить / выключить зебру (по умолчанию задаётся настройкой сборки)',
            ],
            [c('hover'), 'Подсветка строки под курсором'],
            [c('stack'), 'На узких экранах каждая строка становится блоком'],
            [c('sticky-head'), 'Заголовок остаётся на месте при скролле'],
            [c('scroll'), 'Горизонтальный скролл у самой таблицы'],
          ]}
        />
        <p>
          Обёртка <code>.table-scroll</code> — предпочтительнее класса <code>scroll</code> на таблице:
          она не ломает <code>display: table</code> и умеет ограничивать высоту (
          <code>.table-scroll.limited</code>).
        </p>
      </Section>

      <Section title="Сортировка">
        <p>
          Ставите <code>data-table-sort</code> на таблицу и <code>data-sort</code> на те заголовки,
          которые можно сортировать. Модуль оборачивает подпись в настоящую <code>&lt;button&gt;</code>{' '}
          (значит, работает с клавиатуры) и держит <code>aria-sort</code> в актуальном состоянии.
          Стрелка в CSS рисуется по этому же атрибуту — таблице, отсортированной на сервере, JS не
          нужен вообще, достаточно проставить <code>aria-sort</code>.
        </p>
        <Demo>
          <div class="table-scroll">
            <table class="hover striped" data-table-sort id="docsSortTable">
              <thead>
                <tr>
                  <th data-sort="text" data-sort-key="client">
                    Клиент
                  </th>
                  <th data-sort="number" data-sort-key="total">
                    Сумма
                  </th>
                  <th data-sort="date" data-sort-key="date" data-sort-default="desc">
                    Дата
                  </th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Клиент">Иванова А.</td>
                  <td data-label="Сумма" data-sort-value="12450.6">
                    12 450,60 ₽
                  </td>
                  <td data-label="Дата">03.07.2026</td>
                  <td data-label="Статус">
                    <span class="label success">Оплачен</span>
                  </td>
                </tr>
                <tr>
                  <td data-label="Клиент">Петров Б.</td>
                  <td data-label="Сумма" data-sort-value="890">
                    890 ₽
                  </td>
                  <td data-label="Дата">14.07.2026</td>
                  <td data-label="Статус">
                    <span class="label warning">Ожидает</span>
                  </td>
                </tr>
                <tr>
                  <td data-label="Клиент">Сидорова В.</td>
                  <td data-label="Сумма" data-sort-value="103200">
                    103 200 ₽
                  </td>
                  <td data-label="Дата">28.06.2026</td>
                  <td data-label="Статус">
                    <span class="label success">Оплачен</span>
                  </td>
                </tr>
                <tr>
                  <td data-label="Клиент">Ёлкин Г.</td>
                  <td data-label="Сумма" data-sort-value="4500">
                    4 500 ₽
                  </td>
                  <td data-label="Дата">21.07.2026</td>
                  <td data-label="Статус">
                    <span class="label alert">Отменён</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Aside>
            <span id="docsSortStatus"></span>
          </Aside>
        </Demo>
        <Code
          code={`<table class="hover striped" data-table-sort>
  <thead>
    <tr>
      <th data-sort="text" data-sort-key="client">Клиент</th>
      <th data-sort="number">Сумма</th>
      <th data-sort="date" data-sort-default="desc">Дата</th>
      <th>Статус</th>            <!-- без data-sort — не сортируется -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Иванова А.</td>
      <td data-sort-value="12450.6">12 450,60 ₽</td>
      <td>03.07.2026</td>
      <td><span class="label success">Оплачен</span></td>
    </tr>
  </tbody>
</table>`}
        />
        <ApiTable
          columns={['Атрибут', 'Где', 'Что делает']}
          rows={[
            [c('data-table-sort'), c('<table>'), 'Включает модуль'],
            [
              c('data-sort="text|number|date"'),
              c('<th>'),
              <>
                Тип сравнения. <code>text</code> — по правилам локали (<code>Intl.Collator</code>),
                поэтому «Ёлкин» встаёт после «Егоров», а не в конце алфавита
              </>,
            ],
            [c('data-sort-default="asc|desc"'), c('<th>'), 'Отсортировать по этой колонке сразу при инициализации'],
            [c('data-sort-key'), c('<th>'), <>Произвольный идентификатор колонки — приходит в <code>detail.key</code></>],
            [
              c('data-sort-value'),
              c('<td>'),
              'Значение для сортировки вместо текста ячейки. Нужен для «12 450,60 ₽» и локализованных дат',
            ],
          ]}
        />
        <div class="docs-note">
          <strong>Сортировка клиентская</strong>
          Она переставляет только те строки, что уже в DOM. Для страничной выдачи сортировать надо на
          сервере: слушайте <code>sorted.lf.table</code> и уходите на бэкенд с параметрами —{' '}
          <code>aria-sort</code> и стрелка при этом уже проставлены. Форматы без{' '}
          <code>data-sort-value</code>, которые модуль всё же разберёт: числа с пробелами и запятой,
          ISO-даты и <code>дд.мм.гггг</code>.
        </div>
      </Section>

      <Section title="JS API сортировки">
        <ApiTable
          columns={['Событие (на таблице)', 'detail']}
          rows={[
            [
              c('sorted.lf.table'),
              <>
                <code>{'{ index, type, direction, key }'}</code> — <code>direction</code>:{' '}
                <code>'ascending'</code> / <code>'descending'</code>
              </>,
            ],
          ]}
        />
        <Code
          code={`const table = document.getElementById('ordersTable');

// Серверная сортировка: модуль обновил заголовки, данные грузим сами
table.addEventListener('sorted.lf.table', (event) => {
  const { key, direction } = event.detail;
  const params = new URLSearchParams({ sort: key, dir: direction === 'descending' ? 'desc' : 'asc' });
  location.search = params;     // или fetch + перерисовка tbody
});

// Программная сортировка
import { TableSort } from 'lite-foundation/js/modules/table-sort.js';

const sorter = new TableSort(document);
const th = table.querySelector('th[data-sort-key="total"]');

sorter.sort(table, th, 'descending');   // то же, что клик по заголовку
sorter.destroy();`}
        />
      </Section>

      <Section title="Липкий заголовок">
        <p>
          <code>sticky-head</code> работает и на всю страницу, и внутри{' '}
          <code>.table-scroll.limited</code> — тогда «прилипает» к верху окна прокрутки. Если на
          сайте фиксированная шапка, сдвиньте заголовок на её высоту:{' '}
          <code>--lf-table-sticky-offset</code>.
        </p>
        <Demo>
          <div class="table-scroll limited" style={{ '--lf-table-scroll-height': '12rem' }}>
            <table class="hover striped sticky-head">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Товар</th>
                  <th>Остаток</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Кофемолка Wilfa</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Кофеварка Moccamaster</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Весы Acaia</td>
                  <td>7</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Чайник Fellow</td>
                  <td>11</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Воронка Hario V60</td>
                  <td>25</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Фильтры Hario 02</td>
                  <td>140</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Пресс Espro P7</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>Термометр Fellow</td>
                  <td>9</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Demo>
        <Code
          code={`<!-- Окно прокрутки с липким заголовком -->
<div class="table-scroll limited" style="--lf-table-scroll-height: 12rem;">
  <table class="hover striped sticky-head">…</table>
</div>

<!-- На всю страницу, с поправкой на фиксированную шапку сайта -->
<table class="sticky-head" style="--lf-table-sticky-offset: 3.5rem;">…</table>`}
        />
      </Section>

      <Section title="Стековый режим на мобильных">
        <p>
          Класс <code>stack</code> разворачивает строки в блоки. Заголовок при этом пропадает,
          поэтому каждая ячейка носит свою подпись — <code>data-label</code>, который CSS выводит
          через <code>content: attr()</code>. Уменьшите окно браузера, чтобы увидеть переключение.
        </p>
        <Demo>
          <table class="stack hover">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Заказ">#1042</td>
                <td data-label="Сумма">12 450 ₽</td>
                <td data-label="Статус">
                  <span class="label success">Оплачен</span>
                </td>
              </tr>
              <tr>
                <td data-label="Заказ">#1043</td>
                <td data-label="Сумма">890 ₽</td>
                <td data-label="Статус">
                  <span class="label warning">Ожидает</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Demo>
        <Code
          code={`<table class="stack hover">
  <tbody>
    <tr>
      <td data-label="Заказ">#1042</td>
      <td data-label="Сумма">12 450 ₽</td>
    </tr>
  </tbody>
</table>`}
        />
        <Aside>
          <code>stack</code> и <code>sticky-head</code> вместе смысла не имеют: в стековом режиме
          заголовка нет. Выбирайте одно из двух в зависимости от того, читают таблицу с телефона или
          с монитора.
        </Aside>
      </Section>

      <Section title="Доступность">
        <ul>
          <li>
            <code>&lt;caption&gt;</code> вместо заголовка над таблицей — так связь названия и данных
            понятна скринридеру.
          </li>
          <li>
            <code>&lt;th scope="col"&gt;</code> и <code>scope="row"</code> — обязательны для таблиц с
            обоими типами заголовков.
          </li>
          <li>
            Сортировка объявляется через <code>aria-sort</code> на <code>&lt;th&gt;</code>;
            кликабельный заголовок — настоящая кнопка, поэтому в неё попадает <kbd>Tab</kbd>.
          </li>
          <li>
            Горизонтальный скролл: <code>.table-scroll</code> с <code>tabindex="0"</code> и{' '}
            <code>role="region"</code> + <code>aria-label</code> — тогда область можно прокрутить с
            клавиатуры.
          </li>
        </ul>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Серверная пагинация: слушайте <code>sorted.lf.table</code>, не переставляйте строки в DOM
            — только обновляйте <code>aria-sort</code> и грузите данные.
          </li>
          <li>
            <code>data-sort-value</code> на ячейках с форматированными суммами и датами — без него
            сортировка по тексту «12 450,60 ₽» сломается.
          </li>
          <li>
            Мобильный <code>stack</code> + <code>data-label</code> на каждой ячейке; на десктопе —
            обычная таблица с <code>sticky-head</code> в <code>.table-scroll.limited</code>.
          </li>
        </ul>
      </Section>
    </>
  );
}
