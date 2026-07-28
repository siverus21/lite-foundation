import { describe, it, expect, afterEach } from 'vitest';
import { Module } from '../js/core/Module.js';
import { Listbox } from '../js/core/listbox.js';

class Owner extends Module {
  static id = 'test';
}

describe('Listbox', () => {
  let owner;
  let listbox;
  let input;

  afterEach(() => {
    owner?.destroy();
    owner = null;
    listbox = null;
    document.body.innerHTML = '';
  });

  function setup({ emptyText = 'Пусто', highlight = true } = {}) {
    document.body.innerHTML = `
      <div class="root" data-test-ready>
        <input type="text" class="field">
      </div>
    `;
    owner = new Owner(document);
    const root = document.querySelector('.root');
    input = document.querySelector('.field');
    listbox = new Listbox({ owner, root, input, emptyText, highlight });
    return root;
  }

  it('creates a hidden listbox and wires aria-controls / aria-expanded', () => {
    setup();
    expect(listbox.element.className).toBe('listbox');
    expect(listbox.element.hidden).toBe(true);
    expect(input.getAttribute('aria-controls')).toBe(listbox.element.id);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders options, highlights the query and tracks the active option', () => {
    setup();
    listbox.render(
      [
        { value: 'msk', label: 'Москва' },
        { value: 'spb', label: 'Санкт-Петербург' },
      ],
      { query: 'Мос' },
    );

    const options = [...listbox.element.querySelectorAll('.listbox-option')];
    expect(options.length).toBe(2);
    expect(options[0].querySelector('mark')?.textContent).toBe('Мос');
    expect(listbox.activeItem).toEqual({ value: 'msk', label: 'Москва' });

    listbox.move(1);
    expect(listbox.activeItem.value).toBe('spb');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id);
  });

  it('shows the empty state when there are no items', () => {
    setup();
    listbox.render([]);
    expect(listbox.element.querySelector('.listbox-empty')?.textContent).toBe('Пусто');
    expect(listbox.activeItem).toBeNull();
  });

  it('open / close toggle aria-expanded and return whether state changed', () => {
    setup();
    listbox.render([{ value: 'a', label: 'A' }]);

    expect(listbox.open()).toBe(true);
    expect(listbox.isOpen).toBe(true);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(listbox.open()).toBe(false);

    expect(listbox.close()).toBe(true);
    expect(listbox.isOpen).toBe(false);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('onPick ignores disabled options and reports the chosen item', () => {
    setup();
    const picked = [];
    listbox.onPick((item) => picked.push(item));
    listbox.render([
      { value: 'a', label: 'A', disabled: true },
      { value: 'b', label: 'B' },
    ]);

    listbox.element.querySelectorAll('.listbox-option')[0].click();
    expect(picked).toEqual([]);

    listbox.element.querySelectorAll('.listbox-option')[1].click();
    expect(picked).toEqual([{ value: 'b', label: 'B' }]);
  });

  it('move wraps around both ends', () => {
    setup();
    listbox.render([
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ]);
    listbox.move(-1);
    expect(listbox.activeItem.value).toBe('c');
    listbox.move(1);
    expect(listbox.activeItem.value).toBe('a');
  });
});
