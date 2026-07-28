/**
 * Base UI module: scoped listeners, timers and per-element state that all go away
 * on `destroy()`, plus optional lazy mounting.
 *
 * A subclass sets `static id` — the component's name in kebab-case. That single
 * string drives the whole public contract, so a module can't drift from the naming
 * convention:
 *   `static id = 'quantity'`
 *     → out events  `this.emit(el, 'changed', detail)`  → `changed.lf.quantity`
 *     → in commands `this.commands(el, { set: fn })`    → `lf:quantity:set`
 *     → mount guard `this.mountOnce(sel, setup)`        → `data-quantity-ready`
 *
 * Put `data-lf-lazy` on a component root to defer its setup until it nears the viewport.
 */
import { commandName, emit, eventName } from './events.js';

export class Module {
  /** Component id in kebab-case (`'tag-input'`). Subclasses must set this. */
  static id = '';

  /**
   * @param {ParentNode} [root=document]
   */
  constructor(root = document) {
    this.root = root;
    this._controller = new AbortController();
    this.signal = this._controller.signal;
    /** @type {IntersectionObserver[]} */
    this._lazyObservers = [];
    /** @type {Set<number>} */
    this._timers = new Set();
    /** @type {Set<number>} */
    this._frames = new Set();
    /** Roots claimed by `mountOnce`, released on destroy. @type {Set<Element>} */
    this._mounted = new Set();
    /** Per-element state, so instances never leak DOM references. @type {WeakMap<Element, any>} */
    this.states = new WeakMap();
  }

  /** @returns {string} */
  get id() {
    return /** @type {typeof Module} */ (this.constructor).id;
  }

  /**
   * @param {EventTarget} target
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {AddEventListenerOptions|boolean} [options]
   */
  on(target, type, listener, options = {}) {
    const opts = typeof options === 'boolean' ? { capture: options } : options;
    target.addEventListener(type, listener, { ...opts, signal: this.signal });
  }

  /**
   * Dispatch `<verb>.lf.<id>`, bubbling.
   * @param {EventTarget} target
   * @param {string} verb  past tense for "done" (`changed`), present for cancelable "about to" (`close`)
   * @param {unknown} [detail]
   * @param {{ cancelable?: boolean }} [options]
   * @returns {boolean} false when a listener called preventDefault()
   */
  emit(target, verb, detail = undefined, options = {}) {
    return emit(target, eventName(verb, this.id), detail, options);
  }

  /**
   * Listen for `lf:<id>:<action>` commands on `el`.
   * @param {EventTarget} el
   * @param {Record<string, (event: CustomEvent) => void>} map action → handler
   */
  commands(el, map) {
    for (const [action, handler] of Object.entries(map)) {
      this.on(el, commandName(this.id, action), handler);
    }
  }

  /**
   * setTimeout tied to this instance — cleared by `destroy()`, so a pending
   * callback can never touch a torn-down component.
   * @param {() => void} fn @param {number} [ms] @returns {number} timer id
   */
  timeout(fn, ms = 0) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      fn();
    }, ms);
    this._timers.add(id);
    return id;
  }

  /** @param {number|null|undefined} id */
  clearTimer(id) {
    if (id === null || id === undefined) return;
    clearTimeout(id);
    this._timers.delete(id);
  }

  /**
   * requestAnimationFrame tied to this instance (see `timeout`).
   * @param {FrameRequestCallback} fn @returns {number}
   */
  raf(fn) {
    const id = requestAnimationFrame((time) => {
      this._frames.delete(id);
      fn(time);
    });
    this._frames.add(id);
    return id;
  }

  /**
   * Run `setup` now, or when `el` (with `data-lf-lazy`) intersects the viewport.
   * @param {Element} el
   * @param {(el: Element) => void} setup
   * @param {IntersectionObserverInit} [observerOptions]
   */
  mount(el, setup, observerOptions = { rootMargin: '100px' }) {
    if (!(el instanceof Element)) return;

    const lazy = el.hasAttribute('data-lf-lazy') || el.closest('[data-lf-lazy]');
    if (!lazy) {
      setup(el);
      return;
    }

    // `IntersectionObserver` never fires for an element with no box (display:none —
    // an unopened <dialog>/.offcanvas panel, or anything inside a hidden tab/
    // accordion panel). Lazy-loading would then permanently skip setup, so fall
    // back to eager init: it can't get any worse than not using data-lf-lazy at all.
    if (el.getClientRects().length === 0) {
      setup(el);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      this._lazyObservers = this._lazyObservers.filter((o) => o !== io);
      setup(el);
    }, observerOptions);

    this._lazyObservers.push(io);
    io.observe(el);
    this.signal.addEventListener('abort', () => io.disconnect(), { once: true });
  }

  /**
   * @param {string} selector
   * @param {(el: Element) => void} setup
   */
  mountAll(selector, setup) {
    this.root.querySelectorAll(selector).forEach((el) => this.mount(el, setup));
  }

  /**
   * Like `mountAll`, but marks each root with `data-<id>-ready` and skips elements
   * that already carry it.
   *
   * Needed by every module that *generates* markup: `refreshModules(container)` on
   * an overlapping root, or a second component whose selector matches the same
   * node, would otherwise build the inner DOM twice (duplicate buttons, doubled
   * option lists) and bind a second set of listeners to it.
   *
   * The flag means "a live instance owns this element", so `destroy()` clears it —
   * otherwise the init half of a `refreshModules()` would skip the element and
   * leave dead markup with no listeners behind.
   *
   * @param {string} selector
   * @param {(el: Element) => void} setup
   */
  mountOnce(selector, setup) {
    const flag = this.readyAttr;
    this.mountAll(selector, (el) => {
      if (el.hasAttribute(flag)) return;
      el.setAttribute(flag, '');
      this._mounted.add(el);
      setup(el);
    });
  }

  /** @returns {string} `data-<id>-ready` */
  get readyAttr() {
    return `data-${this.id}-ready`;
  }

  /**
   * Resolve the state of a component from any element inside it — callers hold
   * whatever they wrote in the markup (often an inner `<input>` or the source
   * `<select>`), not the root the state is keyed by.
   * @param {Element} el
   */
  stateFor(el) {
    if (!el) return null;
    if (this.states.has(el)) return this.states.get(el);
    const root = el.closest?.(`[${this.readyAttr}]`);
    return root ? this.states.get(root) || null : null;
  }

  destroy() {
    for (const el of this._mounted) el.removeAttribute(this.readyAttr);
    this._mounted.clear();
    for (const io of this._lazyObservers) io.disconnect();
    this._lazyObservers = [];
    for (const timer of this._timers) clearTimeout(timer);
    this._timers.clear();
    for (const frame of this._frames) cancelAnimationFrame(frame);
    this._frames.clear();
    this._controller.abort();
  }
}
