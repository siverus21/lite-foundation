/**
 * Base UI module: AbortController listeners + destroy hook.
 */
export class Module {
  /**
   * @param {ParentNode} [root=document]
   */
  constructor(root = document) {
    this.root = root;
    this._controller = new AbortController();
    this.signal = this._controller.signal;
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

  destroy() {
    this._controller.abort();
  }
}
