/**
 * Combobox / autocomplete — searchable single-select with full keyboard support.
 *
 * Two ways in. Preferred (works without JS — the native select still submits):
 *   <select data-combobox name="city">
 *     <option value="">— город —</option>
 *     <option value="msk">Москва</option>
 *   </select>
 *
 * Or bring your own markup:
 *   <div class="combobox" data-combobox data-combobox-name="city">
 *     <input class="input combobox-input" type="text">
 *     <ul class="listbox" hidden>
 *       <li data-value="msk">Москва</li>
 *     </ul>
 *   </div>
 *
 * An empty-value `<option>` is treated as a placeholder, not a choice: its text
 * becomes the input's placeholder.
 *
 * Settings (attributes on the root, or on the `<select>` — they are copied over):
 *   data-combobox-filter="contains|starts|none"   'none' = the server filters
 *   data-combobox-min-chars="2"                   don't open before N characters
 *   data-combobox-debounce="250"                  delay for `input.lf.combobox` (ms)
 *   data-combobox-strict                          only listed values are accepted
 *   data-combobox-empty="Ничего не найдено"       empty-state text
 *   data-combobox-name="city"                     name for the generated hidden input
 *
 * Events on the root:
 *   input.lf.combobox    debounced typing, detail { query } — feed async sources
 *   changed.lf.combobox  selection, detail { value, label, reason }
 *   opened.lf.combobox / closed.lf.combobox
 *
 * Command events on the root:
 *   lf:combobox:options  { options: [{ value, label, disabled? }], keepOpen? }
 *   lf:combobox:set      { value }
 *   lf:combobox:loading  { loading }
 *   lf:combobox:open / lf:combobox:close
 *
 * Instance API (accepts the `.combobox` root or the source `<select>`):
 *   selection(el), set(el, value), setOptions(el, options),
 *   open(el), close(el), loading(el, boolean)
 */
import { Module } from '../core/Module.js';
import { t } from '../core/i18n.js';
import { Listbox } from '../core/listbox.js';
import { bool, num, str } from '../core/attrs.js';
import { debounce } from '../core/events.js';

/**
 * An empty-value <option> is a placeholder ("— выберите —"), not a choice, so it
 * becomes the input's placeholder instead of a list entry.
 */
function optionsFromSelect(select) {
  return [...select.options]
    .filter((option) => option.value !== '')
    .map((option) => ({
      value: option.value,
      label: option.textContent.trim(),
      disabled: option.disabled,
    }));
}

function placeholderFromSelect(select) {
  const empty = [...select.options].find((option) => option.value === '');
  const text = empty?.textContent.trim() || '';
  return text === '—' || text === '-' ? '' : text;
}

function optionsFromList(listbox) {
  return [...listbox.querySelectorAll('li')].map((li) => ({
    value: li.getAttribute('data-value') ?? li.textContent.trim(),
    label: li.textContent.trim(),
    disabled: li.getAttribute('aria-disabled') === 'true',
  }));
}

export class Combobox extends Module {
  static id = 'combobox';
  static lazySelector = '[data-combobox]';

  constructor(root = document) {
    super(root);
    // A <select> source gets wrapped in a generated `.combobox` root — mountOnce
    // keeps a second init from wrapping it twice.
    this.mountOnce('[data-combobox]:not([data-combobox-source])', (el) => this.#setup(el));
  }

  #setup(el) {
    const state = this.#build(el);
    if (!state) return;

    // Keyed by the generated root, which may not be the element mountOnce marked.
    this.states.set(state.root, state);
    if (state.root !== el) {
      el.removeAttribute(this.readyAttr);
      state.root.setAttribute(this.readyAttr, '');
      this._mounted.add(state.root);
    }

    const { root, input, list } = state;

    this.on(input, 'input', () => {
      state.query = input.value;
      state.typed = true;
      this.#filter(state);
      if (state.query.length >= state.minChars) this.#open(state);
      else this.#close(state);
      state.emitQuery();
      this.#syncClear(state);
    });

    this.on(input, 'keydown', (event) => this.#onKeydown(state, event));
    this.on(input, 'focus', () => {
      if (!state.minChars) this.#open(state);
    });
    this.on(input, 'blur', () => {
      // Deferred: a click on an option fires blur first, and the pick must win.
      this.timeout(() => this.#onBlur(state), 0);
    });

    list.onPick((item) => this.#select(state, item.value, 'click'));

    if (state.clear) {
      this.on(state.clear, 'click', () => {
        this.#select(state, '', 'clear');
        input.focus();
      });
    }

    this.commands(root, {
      options: (event) => {
        const detail = event.detail || {};
        state.options = (detail.options || []).map((option) => ({
          value: String(option.value ?? option.label ?? ''),
          label: String(option.label ?? option.value ?? ''),
          disabled: Boolean(option.disabled),
        }));
        this.#filter(state);
        if (detail.keepOpen !== false && state.typed) this.#open(state);
      },
      set: (event) => this.#select(state, event.detail?.value, 'api'),
      open: () => this.#open(state),
      close: () => this.#close(state),
      loading: (event) => root.toggleAttribute('data-loading', event.detail?.loading !== false),
    });

    this.#filter(state);
    this.#syncClear(state);
  }

  /** Normalise both markup flavours into one state object. */
  #build(el) {
    const isSelect = el.tagName === 'SELECT';
    const root = isSelect ? document.createElement('div') : el;
    const select = isSelect ? el : el.querySelector('select');

    if (isSelect) {
      root.className = 'combobox';
      root.setAttribute('data-combobox', '');
      // Copy the settings over so `data-combobox-*` can be authored on the select.
      for (const { name, value } of [...el.attributes]) {
        if (name.startsWith('data-combobox-')) root.setAttribute(name, value);
      }
      el.parentNode?.insertBefore(root, el);
      root.appendChild(el);
    }

    // Marks the select as "already handled" so the mount selector skips it.
    if (select) select.setAttribute('data-combobox-source', '');

    let input = root.querySelector('input:not([type="hidden"])');
    if (!input) {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'combobox-input';
      root.insertBefore(input, root.firstChild);
    }
    input.classList.add('combobox-input');
    input.autocomplete = 'off';
    input.setAttribute('role', 'combobox');
    const label = select?.getAttribute('aria-label');
    if (label) input.setAttribute('aria-label', label);
    if (select && !input.placeholder) input.placeholder = placeholderFromSelect(select);

    const listEl = root.querySelector('.listbox');
    const options = select ? optionsFromSelect(select) : listEl ? optionsFromList(listEl) : [];
    if (!options.length) return null;

    const list = new Listbox({
      owner: this,
      root,
      input,
      emptyText: str(root, 'data-combobox-empty') || t('empty'),
    });

    // Value carrier: the original <select>, or a hidden input when the widget was
    // hand-authored with a name.
    let hidden = null;
    const name = str(root, 'data-combobox-name');
    if (!select && name) {
      hidden = root.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        root.appendChild(hidden);
      }
      hidden.name = name;
    }

    let clear = root.querySelector('.combobox-clear');
    if (!clear) {
      clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'combobox-clear';
      clear.setAttribute('aria-label', t('clear'));
      clear.hidden = true;
      root.appendChild(clear);
    }

    const state = {
      root,
      input,
      list,
      select,
      hidden,
      clear,
      options,
      filtered: options,
      query: '',
      typed: false,
      value: '',
      label: '',
      filterMode: str(root, 'data-combobox-filter') || 'contains',
      minChars: num(root, 'data-combobox-min-chars', 0),
      strict: bool(root, 'data-combobox-strict'),
    };

    // Debounced so one request per pause, not per keystroke.
    state.emitQuery = debounce(
      () => this.emit(root, 'input', { query: state.query }),
      num(root, 'data-combobox-debounce', 0),
    );
    this.signal.addEventListener('abort', () => state.emitQuery.cancel(), { once: true });

    // Preselected value: the select's own selection, or the hidden input's.
    const initial = select ? select.value : hidden?.value || '';
    const preselected = options.find((option) => option.value === initial);
    if (preselected) {
      state.value = preselected.value;
      state.label = preselected.label;
      input.value = preselected.label;
    }

    return state;
  }

  #filter(state) {
    const query = state.query.trim().toLowerCase();

    if (!query || state.filterMode === 'none') {
      state.filtered = state.options;
    } else {
      state.filtered = state.options.filter((option) => {
        const label = option.label.toLowerCase();
        return state.filterMode === 'starts' ? label.startsWith(query) : label.includes(query);
      });
    }

    state.list.render(state.filtered, {
      query: state.filterMode === 'none' ? '' : state.query,
      selectedValue: state.value,
    });
  }

  #onKeydown(state, event) {
    const { list } = state;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!list.isOpen) this.#open(state);
        else list.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!list.isOpen) this.#open(state);
        else list.move(-1);
        break;
      case 'Home':
        if (!list.isOpen) return;
        event.preventDefault();
        list.first();
        break;
      case 'End':
        if (!list.isOpen) return;
        event.preventDefault();
        list.last();
        break;
      case 'Enter': {
        if (!list.isOpen) return;
        const option = list.activeItem;
        if (!option || option.disabled) return;
        event.preventDefault();
        this.#select(state, option.value, 'keyboard');
        break;
      }
      case 'Escape':
        // First Escape closes the list, a second one clears the field.
        if (list.isOpen) {
          this.#close(state);
          return;
        }
        if (state.input.value) this.#select(state, '', 'escape');
        break;
      case 'Tab':
        this.#close(state);
        break;
      default:
        break;
    }
  }

  #onBlur(state) {
    if (state.root.contains(document.activeElement)) return;
    this.#close(state);

    if (!state.strict) return;
    // Strict mode: free text is only accepted when it names a real option,
    // otherwise the field snaps back to the current selection.
    const match = state.options.find(
      (option) => option.label.toLowerCase() === state.input.value.trim().toLowerCase(),
    );
    if (match) this.#select(state, match.value, 'blur');
    else state.input.value = state.label;
    this.#syncClear(state);
  }

  #syncClear(state) {
    if (state.clear) state.clear.hidden = !state.input.value;
  }

  #open(state) {
    if (state.list.open()) this.emit(state.root, 'opened');
  }

  #close(state) {
    if (state.list.close()) this.emit(state.root, 'closed');
  }

  #select(state, value, reason) {
    const option = state.options.find((item) => item.value === value) || null;

    state.value = option ? option.value : '';
    state.label = option ? option.label : '';
    state.input.value = state.label;
    state.query = state.label;
    state.typed = false;

    if (state.select) state.select.value = state.value;
    if (state.hidden) state.hidden.value = state.value;

    this.#filter(state);
    this.#close(state);
    this.#syncClear(state);

    this.emit(state.root, 'changed', { value: state.value, label: state.label, reason });
  }

  /** @param {Element} el @returns {{ value: string, label: string } | null} */
  selection(el) {
    const state = this.stateFor(el);
    return state ? { value: state.value, label: state.label } : null;
  }

  /** @param {Element} el @param {string} value */
  set(el, value) {
    const state = this.stateFor(el);
    if (state) this.#select(state, value, 'api');
  }

  /** @param {Element} el @param {Array<{ value: string, label?: string, disabled?: boolean }>} options */
  setOptions(el, options = []) {
    const state = this.stateFor(el);
    if (!state) return;
    state.options = options.map((option) => ({
      value: String(option.value ?? option.label ?? ''),
      label: String(option.label ?? option.value ?? ''),
      disabled: Boolean(option.disabled),
    }));
    this.#filter(state);
  }

  /** @param {Element} el */
  open(el) {
    const state = this.stateFor(el);
    if (state) this.#open(state);
  }

  /** @param {Element} el */
  close(el) {
    const state = this.stateFor(el);
    if (state) this.#close(state);
  }

  /** @param {Element} el @param {boolean} [loading] */
  loading(el, loading = true) {
    const state = this.stateFor(el);
    if (state) state.root.toggleAttribute('data-loading', loading);
  }
}
