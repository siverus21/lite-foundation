/**
 * Tag input — multiselect rendered as chips, submitted as a normal form field.
 *
 * Markup (everything else is generated):
 *   <div class="tag-input" data-tag-input data-tag-input-name="tags[]"
 *        data-tag-input-value="react, vite">
 *     <input class="tag-input-field" type="text" placeholder="Добавить тег…">
 *   </div>
 *
 * Each tag becomes `<input type="hidden" name="tags[]" value="react">`, so the
 * server sees a plain array — no JSON parsing on the backend.
 *
 * Settings (attributes on the root):
 *   data-tag-input-name="tags[]"        name of the hidden inputs
 *   data-tag-input-value="a, b"         initial tags
 *   data-tag-input-max="5"              cap (the field hides when reached)
 *   data-tag-input-separator=","        also splits pasted text
 *   data-tag-input-pattern="^[a-z0-9-]+$"  validation
 *   data-tag-input-lowercase            normalise case
 *   data-tag-input-suggestions="react, vue"  static suggestion list
 *   data-tag-input-hint="Enter — добавить"   helper text under the field
 *
 * Events on the root:
 *   changed.lf.tag-input   detail { tags, added, removed }
 *   rejected.lf.tag-input  detail { value, reason: 'duplicate'|'max'|'pattern'|'empty' }
 *
 * Command events on the root:
 *   lf:tag-input:add          { value }
 *   lf:tag-input:remove       { value }
 *   lf:tag-input:set          { tags }
 *   lf:tag-input:suggestions  { options: string[] }
 *
 * API: tags(el), add(el, value), remove(el, value), set(el, tags).
 */
import { Module } from '../core/Module.js';
import { Listbox } from '../core/listbox.js';
import { bool, num, str } from '../core/attrs.js';

function splitList(value, separator) {
  return String(value || '')
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}

export class TagInput extends Module {
  static id = 'tag-input';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-tag-input]', (el) => this.#setup(el));
  }

  #setup(el) {
    const separator = str(el, 'data-tag-input-separator') || ',';
    const patternSource = str(el, 'data-tag-input-pattern');

    let field = el.querySelector('input:not([type="hidden"])');
    if (!field) {
      field = document.createElement('input');
      field.type = 'text';
      el.appendChild(field);
    }
    field.classList.add('tag-input-field');
    field.autocomplete = 'off';
    field.setAttribute('role', 'combobox');

    const list = new Listbox({ owner: this, root: el, input: field });

    const hint = document.createElement('p');
    hint.className = 'tag-input-hint';
    hint.textContent = str(el, 'data-tag-input-hint') || '';
    hint.hidden = !hint.textContent;
    el.appendChild(hint);

    const state = {
      root: el,
      field,
      list,
      hint,
      separator,
      name: str(el, 'data-tag-input-name') || '',
      max: num(el, 'data-tag-input-max', Infinity) || Infinity,
      lowercase: bool(el, 'data-tag-input-lowercase'),
      pattern: patternSource ? new RegExp(patternSource) : null,
      suggestions: splitList(str(el, 'data-tag-input-suggestions'), separator),
      tags: [],
    };
    this.states.set(el, state);

    splitList(str(el, 'data-tag-input-value'), separator).forEach((tag) =>
      this.#add(state, tag, { silent: true }),
    );
    this.#render(state);

    // Clicking the padding area should focus the field, like a real input.
    this.on(el, 'click', (event) => {
      if (event.target === el) field.focus();
      const close = event.target.closest('[data-tag-remove]');
      if (close) this.#remove(state, close.getAttribute('data-tag-remove'));
    });

    list.onPick((item) => {
      this.#add(state, item.value);
      field.value = '';
      this.#closeList(state);
      field.focus();
    });

    this.on(field, 'keydown', (event) => this.#onKeydown(state, event));
    this.on(field, 'input', () => this.#filter(state));
    this.on(field, 'blur', () => this.timeout(() => this.#closeList(state), 0));

    this.on(field, 'paste', (event) => {
      const text = event.clipboardData?.getData('text') || '';
      if (!text.includes(separator)) return;
      event.preventDefault();
      splitList(text, separator).forEach((tag) => this.#add(state, tag));
    });

    this.commands(el, {
      add: (event) => this.#add(state, event.detail?.value),
      remove: (event) => this.#remove(state, event.detail?.value),
      set: (event) => this.set(el, event.detail?.tags || []),
      suggestions: (event) => {
        state.suggestions = (event.detail?.options || []).map(String);
        this.#filter(state);
      },
    });
  }

  #onKeydown(state, event) {
    const { field, list } = state;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!list.items.length) return;
      event.preventDefault();
      if (!list.isOpen) list.open();
      list.move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const active = list.isOpen ? list.activeItem : null;
      if (this.#add(state, active ? active.value : field.value)) {
        field.value = '';
        this.#closeList(state);
      }
      return;
    }

    if (event.key === state.separator) {
      event.preventDefault();
      if (this.#add(state, field.value)) field.value = '';
      return;
    }

    if (event.key === 'Escape' && list.isOpen) {
      event.preventDefault();
      this.#closeList(state);
      return;
    }

    // Backspace on an empty field removes the last chip — the expected shortcut.
    if (event.key === 'Backspace' && !field.value && state.tags.length) {
      this.#remove(state, state.tags[state.tags.length - 1]);
    }
  }

  #normalise(state, raw) {
    const value = String(raw ?? '').trim();
    return state.lowercase ? value.toLowerCase() : value;
  }

  #reject(state, value, reason) {
    this.emit(state.root, 'rejected', { value, reason });
    return false;
  }

  #add(state, raw, { silent = false } = {}) {
    const value = this.#normalise(state, raw);
    if (!value) return this.#reject(state, value, 'empty');
    if (state.tags.length >= state.max) return this.#reject(state, value, 'max');
    if (state.tags.includes(value)) return this.#reject(state, value, 'duplicate');
    if (state.pattern && !state.pattern.test(value)) return this.#reject(state, value, 'pattern');

    state.tags.push(value);
    if (!silent) {
      this.#render(state);
      this.#emitChange(state, { added: value });
    }
    return true;
  }

  #remove(state, raw) {
    const value = this.#normalise(state, raw);
    const index = state.tags.indexOf(value);
    if (index === -1) return false;

    state.tags.splice(index, 1);
    this.#render(state);
    this.#emitChange(state, { removed: value });
    return true;
  }

  #emitChange(state, { added = null, removed = null } = {}) {
    this.emit(state.root, 'changed', { tags: [...state.tags], added, removed });
  }

  #render(state) {
    state.root.querySelectorAll('[data-tag-chip]').forEach((chip) => chip.remove());
    state.root
      .querySelectorAll('input[type="hidden"][data-tag-value]')
      .forEach((el) => el.remove());

    state.tags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.setAttribute('data-tag-chip', '');
      chip.textContent = tag;

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'chip-close';
      close.setAttribute('data-tag-remove', tag);
      close.setAttribute('aria-label', `Remove ${tag}`);
      chip.appendChild(close);

      state.root.insertBefore(chip, state.field);

      if (state.name) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = state.name;
        hidden.value = tag;
        hidden.setAttribute('data-tag-value', '');
        state.root.appendChild(hidden);
      }
    });

    state.root.toggleAttribute('data-full', state.tags.length >= state.max);
  }

  #filter(state) {
    const query = state.field.value.trim().toLowerCase();
    const matches = state.suggestions
      .filter((option) => !state.tags.includes(option) && option.toLowerCase().includes(query))
      .map((option) => ({ value: option, label: option }));

    if (!query || !matches.length) {
      state.list.render([]);
      this.#closeList(state);
      return;
    }

    state.list.render(matches, { query: state.field.value });
    state.list.open();
  }

  #closeList(state) {
    state.list.close();
  }

  /** @param {Element} el root or any element inside it */
  tags(el) {
    return this.stateFor(el)?.tags.slice() ?? null;
  }

  /** @param {Element} el @param {string} value */
  add(el, value) {
    const state = this.stateFor(el);
    return state ? this.#add(state, value) : false;
  }

  /** @param {Element} el @param {string} value */
  remove(el, value) {
    const state = this.stateFor(el);
    return state ? this.#remove(state, value) : false;
  }

  /** @param {Element} el @param {string[]} tags */
  set(el, tags) {
    const state = this.stateFor(el);
    if (!state) return null;
    state.tags = [];
    (tags || []).forEach((tag) => this.#add(state, tag, { silent: true }));
    this.#render(state);
    this.#emitChange(state);
    return state.tags.slice();
  }
}
