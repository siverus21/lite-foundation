/**
 * Event naming and dispatch.
 *
 * Two directions, two shapes — the shape tells you which way the data flows:
 *   out: `<verb-past>.lf.<component>`  e.g. `changed.lf.quantity`, `closed.lf.combobox`
 *   in:  `lf:<component>:<action>`     e.g. `lf:quantity:set`, `lf:combobox:open`
 *
 * A present-tense out-event (`close.lf.dismiss`) is cancelable and fires *before*
 * the action; the past-tense one (`closed.lf.dismiss`) reports it as done.
 *
 * Everything bubbles, so a single delegated listener on a container can watch a
 * whole form's worth of components.
 */

/** `changed` + `quantity` → `changed.lf.quantity` */
export function eventName(verb, id) {
  return `${verb}.lf.${id}`;
}

/** `quantity` + `set` → `lf:quantity:set` */
export function commandName(id, action) {
  return `lf:${id}:${action}`;
}

/**
 * @param {EventTarget} target
 * @param {string} type
 * @param {unknown} [detail]
 * @param {{ cancelable?: boolean, bubbles?: boolean }} [options]
 * @returns {boolean} false when a listener called preventDefault()
 */
export function emit(target, type, detail = undefined, options = {}) {
  const { cancelable = false, bubbles = true } = options;
  return target.dispatchEvent(new CustomEvent(type, { detail, bubbles, cancelable }));
}

/**
 * Trailing-edge debounce. `.cancel()` drops a pending call — modules call it on
 * destroy so a queued "commit" can't fire against a torn-down component.
 * @template {(...args: any[]) => void} T
 * @param {T} fn @param {number} wait
 * @returns {T & { cancel: () => void, flush: () => void }}
 */
export function debounce(fn, wait = 0) {
  let timer = null;
  let lastArgs = null;

  const wrapped = (...args) => {
    lastArgs = args;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const call = lastArgs;
      lastArgs = null;
      fn(...call);
    }, wait);
  };

  wrapped.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  wrapped.flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    const call = lastArgs || [];
    lastArgs = null;
    fn(...call);
  };

  return wrapped;
}
