/**
 * Base UI module: AbortController listeners + destroy hook + optional lazy mount.
 *
 * Put `data-lf-lazy` on a component root to defer its setup until it nears the viewport.
 */
export class Module {
  /**
   * @param {ParentNode} [root=document]
   */
  constructor(root = document) {
    this.root = root;
    this._controller = new AbortController();
    this.signal = this._controller.signal;
    /** @type {IntersectionObserver[]} */
    this._lazyObservers = [];
  }

  /**
   * @param {EventTarget} target
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {AddEventListenerOptions} [options]
   */
  on(target, type, listener, options = {}) {
    target.addEventListener(type, listener, { ...options, signal: this.signal });
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

  destroy() {
    for (const io of this._lazyObservers) io.disconnect();
    this._lazyObservers = [];
    this._controller.abort();
  }
}
