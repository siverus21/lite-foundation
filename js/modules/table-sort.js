/**
 * Client-side table sorting.
 *
 *   <table class="hover" data-table-sort>
 *     <thead>
 *       <tr>
 *         <th data-sort="text">Клиент</th>
 *         <th data-sort="number" data-sort-default="desc">Сумма</th>
 *         <th data-sort="date">Дата</th>
 *         <th>Статус</th>          <!-- no data-sort → not sortable -->
 *       </tr>
 *     </thead>
 *     <tbody>…</tbody>
 *   </table>
 *
 * The header label is wrapped in a real <button> (so the control is reachable by
 * keyboard) and `aria-sort` on the <th> reflects the current order — the arrow
 * in CSS follows that attribute, which means a server-sorted table only needs
 * the attribute, not this module.
 *
 * Cell values: text content by default, `data-sort-value` wins when present —
 * use it for "12 345 ₽" or a localised date.
 *
 * Event on the table: `sorted.lf.table`, detail { index, type, direction, key }
 * where `key` is `th[data-sort-key]` when set. Server-side sorting: listen for it,
 * call `event.preventDefault()`-free (it isn't cancelable — the local sort is
 * cheap) and re-render from the response.
 *
 * Command on the table: `lf:table:sort` { index | key, direction }.
 */
import { Module } from '../core/Module.js';
import { str } from '../core/attrs.js';

const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function cellValue(row, index) {
  const cell = row.children[index];
  if (!cell) return '';
  return (cell.getAttribute('data-sort-value') ?? cell.textContent ?? '').trim();
}

function toNumber(value) {
  // Tolerates "12 345,60 ₽" and "1,234.5".
  const cleaned = value.replace(/\s|\u00a0/g, '').replace(/[^\d,.-]/g, '');
  const normalised =
    cleaned.includes(',') && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  const parsed = Number.parseFloat(normalised);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function toTime(value) {
  const direct = Date.parse(value);
  if (!Number.isNaN(direct)) return direct;
  // dd.mm.yyyy / dd-mm-yyyy — Date.parse doesn't handle these.
  const match = value.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (match) return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.NEGATIVE_INFINITY;
}

function comparator(type) {
  if (type === 'number') return (a, b) => toNumber(a) - toNumber(b);
  if (type === 'date') return (a, b) => toTime(a) - toTime(b);
  return (a, b) => COLLATOR.compare(a, b);
}

export class TableSort extends Module {
  static id = 'table';

  constructor(root = document) {
    super(root);
    this.mountAll('[data-table-sort]', (el) => this.#setup(el));
  }

  #setup(table) {
    const headers = [...table.querySelectorAll('thead th[data-sort]')];
    if (!headers.length) return;

    headers.forEach((th) => {
      if (!th.querySelector('.table-sort-button')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'table-sort-button';
        button.append(...th.childNodes);
        th.appendChild(button);
      }
      if (!th.hasAttribute('aria-sort')) th.setAttribute('aria-sort', 'none');
    });

    this.on(table, 'click', (event) => {
      const button = event.target.closest('.table-sort-button');
      const th = button?.closest('th[data-sort]');
      if (!th) return;
      const current = th.getAttribute('aria-sort');
      this.sort(table, th, current === 'ascending' ? 'descending' : 'ascending');
    });

    this.commands(table, {
      sort: (event) => {
        const { index, key, direction = 'ascending' } = event.detail || {};
        const th =
          typeof index === 'number'
            ? headers[index]
            : headers.find((header) => str(header, 'data-sort-key') === key);
        if (th) this.sort(table, th, direction === 'desc' ? 'descending' : direction);
      },
    });

    const preset = headers.find((th) => th.hasAttribute('data-sort-default'));
    if (preset) {
      const direction = str(preset, 'data-sort-default') === 'desc' ? 'descending' : 'ascending';
      this.sort(table, preset, direction);
    }
  }

  /**
   * @param {HTMLTableElement} table
   * @param {HTMLTableCellElement} th
   * @param {'ascending'|'descending'} direction
   */
  sort(table, th, direction) {
    const headers = [...table.querySelectorAll('thead th')];
    const index = headers.indexOf(th);
    const tbody = table.querySelector('tbody');
    if (index < 0 || !tbody) return;

    const type = th.getAttribute('data-sort') || 'text';
    const compare = comparator(type);
    const sign = direction === 'descending' ? -1 : 1;

    // querySelectorAll rather than `tbody.rows`: it ignores rows of a nested
    // table and behaves the same across DOM implementations.
    const rows = [...tbody.querySelectorAll(':scope > tr')];
    // Decorate with the original position so equal keys keep their input order
    // (Array#sort is stable in modern engines, but ties across re-sorts are not).
    rows
      .map((row, position) => ({ row, position, key: cellValue(row, index) }))
      .sort((a, b) => {
        const result = compare(a.key, b.key) * sign;
        return result !== 0 ? result : a.position - b.position;
      })
      .forEach(({ row }) => tbody.appendChild(row));

    headers.forEach((header) => {
      if (header.hasAttribute('data-sort')) header.setAttribute('aria-sort', 'none');
    });
    th.setAttribute('aria-sort', direction);

    this.emit(table, 'sorted', { index, type, direction, key: str(th, 'data-sort-key') });
  }
}
