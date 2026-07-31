import { describe, it, expect, afterEach, vi } from 'vitest';
import { Combobox } from '../js/modules/combobox.js';

const CITIES = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Казань'];

function mountSelect(attrs = '') {
  document.body.innerHTML = `
    <select data-combobox name="city" ${attrs}>
      <option value="">—</option>
      ${CITIES.map((city, i) => `<option value="c${i}">${city}</option>`).join('')}
    </select>
  `;
  return new Combobox(document);
}

function root() {
  return document.querySelector('.combobox');
}

function field() {
  return document.querySelector('.combobox-input');
}

function options() {
  return [...document.querySelectorAll('.listbox-option')];
}

function type(text) {
  const input = field();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function key(name) {
  field().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
}

describe('Combobox', () => {
  let combobox;

  afterEach(() => {
    combobox?.destroy();
    combobox = null;
    document.body.innerHTML = '';
  });

  it('enhances a native <select> without removing it from the form', () => {
    combobox = mountSelect();

    const select = document.querySelector('select');
    expect(root()).toBeTruthy();
    expect(select.name).toBe('city');
    expect(select.hasAttribute('data-combobox-source')).toBe(true);
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().getAttribute('aria-expanded')).toBe('false');
    // The empty-value <option> becomes the placeholder, not a list entry.
    expect(options().length).toBe(CITIES.length);
  });

  it('filters options as you type and highlights the match', () => {
    combobox = mountSelect();
    type('нов');

    expect(options().length).toBe(1);
    expect(options()[0].textContent).toBe('Новосибирск');
    // The highlight keeps the label's own casing, not the query's.
    expect(options()[0].querySelector('mark').textContent).toBe('Нов');
    expect(field().getAttribute('aria-expanded')).toBe('true');
  });

  it('supports the starts-with filter mode', () => {
    combobox = mountSelect('data-combobox-filter="starts"');
    type('ка');

    expect(options().map((li) => li.textContent)).toEqual(['Казань']);
  });

  it('shows the empty state when nothing matches', () => {
    combobox = mountSelect('data-combobox-empty="Нет городов"');
    type('zzz');

    expect(options().length).toBe(0);
    expect(document.querySelector('.listbox-empty').textContent).toBe('Нет городов');
  });

  it('ArrowDown + Enter selects and syncs the underlying select', () => {
    combobox = mountSelect();
    const changed = [];
    root().addEventListener('changed.lf.combobox', (event) => changed.push(event.detail));

    type('санкт');
    key('ArrowDown');
    key('Enter');

    expect(field().value).toBe('Санкт-Петербург');
    expect(document.querySelector('select').value).toBe('c1');
    expect(changed[0]).toMatchObject({ label: 'Санкт-Петербург', reason: 'keyboard' });
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps aria-activedescendant on the highlighted option', () => {
    combobox = mountSelect();
    type('о');
    key('ArrowDown');

    const active = document.querySelector('.listbox-option.is-active');
    expect(field().getAttribute('aria-activedescendant')).toBe(active.id);
  });

  it('clicking an option selects it', () => {
    combobox = mountSelect();
    type('каз');
    options()[0].click();

    expect(combobox.selection(root())).toEqual({ value: 'c3', label: 'Казань' });
  });

  it('Escape closes the list, a second Escape clears the value', () => {
    combobox = mountSelect();
    type('каз');
    key('Enter');
    expect(field().value).toBe('Казань');

    key('Escape');
    expect(field().value).toBe('');
    expect(document.querySelector('select').value).toBe('');
  });

  it('debounces input.lf.combobox for async sources', () => {
    vi.useFakeTimers();
    combobox = mountSelect('data-combobox-debounce="250" data-combobox-filter="none"');
    const queries = [];
    root().addEventListener('input.lf.combobox', (event) => queries.push(event.detail.query));

    type('м');
    type('мо');
    type('мос');
    expect(queries).toEqual([]);

    vi.advanceTimersByTime(250);
    expect(queries).toEqual(['мос']);
    vi.useRealTimers();
  });

  it('lf:combobox:options replaces the list from a server response', () => {
    combobox = mountSelect('data-combobox-filter="none"');

    root().dispatchEvent(
      new CustomEvent('lf:combobox:options', {
        detail: { options: [{ value: 'x', label: 'Из API' }] },
      }),
    );

    expect(options().map((li) => li.textContent)).toEqual(['Из API']);
  });

  it('async flow: typing → input.lf.combobox → loading → options', () => {
    vi.useFakeTimers();
    combobox = mountSelect('data-combobox-filter="none" data-combobox-debounce="100"');
    const queries = [];
    root().addEventListener('input.lf.combobox', (event) => {
      queries.push(event.detail.query);
      combobox.loading(root(), true);
      combobox.setOptions(root(), [{ value: 'r1', label: `Remote:${event.detail.query}` }]);
      combobox.loading(root(), false);
    });

    type('мос');
    expect(root().hasAttribute('data-loading')).toBe(false);
    vi.advanceTimersByTime(100);

    expect(queries).toEqual(['мос']);
    expect(options().map((li) => li.textContent)).toEqual(['Remote:мос']);
    expect(root().hasAttribute('data-loading')).toBe(false);
    vi.useRealTimers();
  });

  it('lf:combobox:set selects by value and lf:combobox:loading marks the root', () => {
    combobox = mountSelect();

    root().dispatchEvent(new CustomEvent('lf:combobox:set', { detail: { value: 'c0' } }));
    expect(field().value).toBe('Москва');

    root().dispatchEvent(new CustomEvent('lf:combobox:loading', { detail: { loading: true } }));
    expect(root().hasAttribute('data-loading')).toBe(true);
  });

  it('exposes an instance API that accepts either the root or the source select', () => {
    // filter="none": the list is whatever was last handed in, so setOptions()
    // can be checked without the current input value narrowing it down.
    combobox = mountSelect('data-combobox-filter="none"');
    const select = document.querySelector('select');

    // The caller holds the <select> from their markup, not the generated root.
    combobox.set(select, 'c3');
    expect(field().value).toBe('Казань');
    expect(combobox.selection(select)).toEqual({ value: 'c3', label: 'Казань' });
    expect(combobox.selection(root())).toEqual({ value: 'c3', label: 'Казань' });

    combobox.setOptions(select, [{ value: 'x', label: 'Из API' }]);
    expect(options().map((li) => li.textContent)).toEqual(['Из API']);

    combobox.loading(select, true);
    expect(root().hasAttribute('data-loading')).toBe(true);
    combobox.loading(select, false);
    expect(root().hasAttribute('data-loading')).toBe(false);

    combobox.open(select);
    expect(field().getAttribute('aria-expanded')).toBe('true');
    combobox.close(select);
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('does not wrap the same select twice on refresh', () => {
    combobox = mountSelect();
    const second = new Combobox(document);

    expect(document.querySelectorAll('.combobox').length).toBe(1);
    second.destroy();
  });

  it('strict mode snaps free text back to the selection on blur', async () => {
    vi.useFakeTimers();
    combobox = mountSelect('data-combobox-strict');
    combobox.set(root(), 'c0');
    expect(field().value).toBe('Москва');

    field().value = 'несуществующий';
    field().dispatchEvent(new Event('input', { bubbles: true }));
    field().dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    await vi.advanceTimersByTimeAsync(0);
    expect(field().value).toBe('Москва');
    expect(document.querySelector('select').value).toBe('c0');
    vi.useRealTimers();
  });

  it('Escape closes an open list without clearing; a second Escape clears', () => {
    combobox = mountSelect();
    type('каз');
    expect(field().getAttribute('aria-expanded')).toBe('true');

    key('Escape');
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(field().value).toBe('каз');

    key('Escape');
    expect(field().value).toBe('');
  });
});
