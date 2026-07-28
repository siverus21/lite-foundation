import { describe, it, expect, afterEach } from 'vitest';
import { TableSort } from '../js/modules/table-sort.js';

const ROWS = [
  ['Борис', '1 200', '02.03.2024'],
  ['Анна', '12 400', '01.02.2024'],
  ['Виктор', '340', '15.12.2023'],
];

function mount({ headers = 'data-sort="text"|data-sort="number"|data-sort="date"' } = {}) {
  const heads = headers.split('|');
  document.body.innerHTML = `
    <table data-table-sort>
      <thead>
        <tr>
          <th ${heads[0]}>Клиент</th>
          <th ${heads[1]}>Сумма</th>
          <th ${heads[2]}>Дата</th>
        </tr>
      </thead>
      <tbody>
        ${ROWS.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
  return document.querySelector('table');
}

function column(index) {
  return [...document.querySelectorAll('tbody tr')].map((row) => row.children[index].textContent);
}

function clickHeader(index) {
  document.querySelectorAll('thead th')[index].querySelector('.table-sort-button').click();
}

describe('TableSort', () => {
  let sorter;

  afterEach(() => {
    sorter?.destroy();
    sorter = null;
    document.body.innerHTML = '';
  });

  it('wraps sortable headers in a button and leaves the others alone', () => {
    mount({ headers: 'data-sort="text"||' });
    sorter = new TableSort(document);
    const headers = [...document.querySelectorAll('thead th')];

    expect(headers[0].querySelector('.table-sort-button')).toBeTruthy();
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
    expect(headers[1].querySelector('.table-sort-button')).toBe(null);
    expect(headers[1].hasAttribute('aria-sort')).toBe(false);
  });

  it('sorts text ascending then descending', () => {
    mount();
    sorter = new TableSort(document);

    clickHeader(0);
    expect(column(0)).toEqual(['Анна', 'Борис', 'Виктор']);
    expect(document.querySelectorAll('thead th')[0].getAttribute('aria-sort')).toBe('ascending');

    clickHeader(0);
    expect(column(0)).toEqual(['Виктор', 'Борис', 'Анна']);
    expect(document.querySelectorAll('thead th')[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('sorts numbers by value, not by string, ignoring thousands separators', () => {
    mount();
    sorter = new TableSort(document);

    clickHeader(1);

    expect(column(1)).toEqual(['340', '1 200', '12 400']);
  });

  it('sorts dd.mm.yyyy dates chronologically', () => {
    mount();
    sorter = new TableSort(document);

    clickHeader(2);

    expect(column(2)).toEqual(['15.12.2023', '01.02.2024', '02.03.2024']);
  });

  it('prefers data-sort-value over the visible text', () => {
    document.body.innerHTML = `
      <table data-table-sort>
        <thead><tr><th data-sort="number">Цена</th></tr></thead>
        <tbody>
          <tr><td data-sort-value="2">дорого</td></tr>
          <tr><td data-sort-value="1">дешевле</td></tr>
        </tbody>
      </table>
    `;
    sorter = new TableSort(document);

    clickHeader(0);

    expect(column(0)).toEqual(['дешевле', 'дорого']);
  });

  it('resets aria-sort on the other columns', () => {
    mount();
    sorter = new TableSort(document);

    clickHeader(0);
    clickHeader(1);

    const headers = [...document.querySelectorAll('thead th')];
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
    expect(headers[1].getAttribute('aria-sort')).toBe('ascending');
  });

  it('applies data-sort-default on init and reports it', () => {
    document.body.innerHTML = `
      <table data-table-sort>
        <thead><tr><th data-sort="number" data-sort-default="desc" data-sort-key="total">Сумма</th></tr></thead>
        <tbody>
          <tr><td>10</td></tr>
          <tr><td>30</td></tr>
          <tr><td>20</td></tr>
        </tbody>
      </table>
    `;
    const events = [];
    document.querySelector('table').addEventListener('sorted.lf.table', (event) => events.push(event.detail));
    sorter = new TableSort(document);

    expect(column(0)).toEqual(['30', '20', '10']);
    expect(events[0]).toMatchObject({ direction: 'descending', type: 'number', key: 'total' });
  });

  it('keeps equal rows in their original order', () => {
    document.body.innerHTML = `
      <table data-table-sort>
        <thead><tr><th data-sort="text">Статус</th><th>Кто</th></tr></thead>
        <tbody>
          <tr><td>новый</td><td>первый</td></tr>
          <tr><td>новый</td><td>второй</td></tr>
          <tr><td>новый</td><td>третий</td></tr>
        </tbody>
      </table>
    `;
    sorter = new TableSort(document);

    clickHeader(0);

    expect(column(1)).toEqual(['первый', 'второй', 'третий']);
  });
});
