/**
 * Popup option list shared by Combobox and Tag input.
 *
 * Both components used to carry their own near-identical copy of: build the
 * `<ul class="listbox">`, render options, track the highlighted one, wire
 * `aria-expanded` / `aria-controls` / `aria-activedescendant`, wrap the arrow keys
 * and open/close the list. The copies had already drifted (only one highlighted
 * the matched substring, only one had an empty state), which is exactly the kind
 * of inconsistency this class exists to prevent.
 *
 * What it deliberately does NOT own: what a pick *means*. Combobox replaces its
 * single value, Tag input appends a chip — so selection is left to `onPick`.
 *
 * Keyboard model follows the APG combobox pattern: focus never leaves the text
 * field, the "current" option is communicated through `aria-activedescendant`.
 */
import { uid } from './uid.js';

export class Listbox {
  /**
   * @param {object} config
   * @param {import('./Module.js').Module} config.owner  module that owns the listeners
   * @param {Element} config.root                        component root
   * @param {HTMLInputElement} config.input              text field the list belongs to
   * @param {string} [config.emptyText]                  shown when a query matches nothing ('' = just close)
   * @param {boolean} [config.highlight]                 wrap the matched substring in <mark>
   */
  constructor({ owner, root, input, emptyText = '', highlight = true }) {
    this.owner = owner;
    this.root = root;
    this.input = input;
    this.emptyText = emptyText;
    this.highlight = highlight;

    /** @type {Array<{ value: string, label: string, disabled?: boolean }>} */
    this.items = [];
    this.activeIndex = -1;
    this.isOpen = false;
    this.uid = uid('lf-listbox');

    this.element = root.querySelector('.listbox');
    if (!this.element) {
      this.element = document.createElement('ul');
      this.element.className = 'listbox';
      root.appendChild(this.element);
    }
    if (!this.element.id) this.element.id = this.uid;
    this.element.setAttribute('role', 'listbox');
    this.element.hidden = true;

    input.setAttribute('aria-controls', this.element.id);
    input.setAttribute('aria-expanded', 'false');
    if (!input.hasAttribute('aria-autocomplete')) input.setAttribute('aria-autocomplete', 'list');

    // mousedown, not click: the field must not lose focus, or the blur handler
    // would close the list before the click ever lands on an option.
    owner.on(this.element, 'mousedown', (event) => event.preventDefault());
  }

  /** @param {(item: { value: string, label: string }) => void} handler */
  onPick(handler) {
    this.owner.on(this.element, 'click', (event) => {
      const li = event.target.closest('.listbox-option');
      if (!li || li.getAttribute('aria-disabled') === 'true') return;
      const item = this.items[Number(li.dataset.index)];
      if (item) handler(item);
    });
  }

  /**
   * @param {Array<{ value: string, label: string, disabled?: boolean }>} items
   * @param {{ query?: string, selectedValue?: string|null, keepActive?: boolean }} [options]
   */
  render(items, { query = '', selectedValue = null, keepActive = false } = {}) {
    this.items = items;
    this.activeIndex = keepActive ? Math.min(this.activeIndex, items.length - 1) : items.length ? 0 : -1;

    this.element.replaceChildren();

    if (!items.length) {
      if (this.emptyText) {
        const empty = document.createElement('li');
        empty.className = 'listbox-empty';
        empty.textContent = this.emptyText;
        this.element.appendChild(empty);
      }
      this.input.removeAttribute('aria-activedescendant');
      return;
    }

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'listbox-option';
      li.id = `${this.uid}-option-${index}`;
      li.dataset.index = String(index);
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', item.value);
      li.setAttribute('aria-selected', String(selectedValue !== null && item.value === selectedValue));
      if (item.disabled) li.setAttribute('aria-disabled', 'true');
      this.#label(li, item.label, this.highlight ? query : '');
      this.element.appendChild(li);
    });

    this.#syncActive();
  }

  /** Highlight the match without ever routing option text through innerHTML. */
  #label(li, label, query) {
    const needle = query.trim();
    const at = needle ? label.toLowerCase().indexOf(needle.toLowerCase()) : -1;
    if (at === -1) {
      li.textContent = label;
      return;
    }
    const mark = document.createElement('mark');
    // Slice from the label, not the query, to keep the original casing.
    mark.textContent = label.slice(at, at + needle.length);
    li.append(label.slice(0, at), mark, label.slice(at + needle.length));
  }

  #optionElements() {
    return [...this.element.querySelectorAll('.listbox-option')];
  }

  #syncActive() {
    const options = this.#optionElements();
    options.forEach((li, index) => li.classList.toggle('is-active', index === this.activeIndex));

    const active = options[this.activeIndex];
    if (active) {
      this.input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView?.({ block: 'nearest' });
    } else {
      this.input.removeAttribute('aria-activedescendant');
    }
  }

  /** @returns {{ value: string, label: string, disabled?: boolean } | null} */
  get activeItem() {
    return this.items[this.activeIndex] ?? null;
  }

  /** @param {number} delta wraps around both ends */
  move(delta) {
    if (!this.items.length) return;
    const last = this.items.length - 1;
    let next = this.activeIndex + delta;
    if (next < 0) next = last;
    if (next > last) next = 0;
    this.activeIndex = next;
    this.#syncActive();
  }

  /** @param {number} index */
  setActive(index) {
    if (index < 0 || index >= this.items.length) return;
    this.activeIndex = index;
    this.#syncActive();
  }

  first() {
    this.setActive(0);
  }

  last() {
    this.setActive(this.items.length - 1);
  }

  /** @returns {boolean} true when the state changed */
  open() {
    if (this.isOpen) return false;
    this.isOpen = true;
    this.element.hidden = false;
    this.input.setAttribute('aria-expanded', 'true');
    this.#syncActive();
    return true;
  }

  /** @returns {boolean} true when the state changed */
  close() {
    if (!this.isOpen) return false;
    this.isOpen = false;
    this.activeIndex = this.items.length ? 0 : -1;
    this.element.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
    this.input.removeAttribute('aria-activedescendant');
    return true;
  }
}
