/**
 * Shared document-level Escape dispatcher.
 *
 * Offcanvas / Dropdown / menu-dropdown all want "close me on Escape" — instead of
 * each module adding its own `document.addEventListener('keydown', …)` (which all
 * fire, and all re-query the DOM, on every single keypress on the page), they
 * register a handler here and share one listener.
 */
const escapeHandlers = new Set();
let bound = false;

function handleKeydown(event) {
  if (event.key !== 'Escape') return;
  for (const handler of escapeHandlers) handler(event);
}

function ensureBound() {
  if (bound) return;
  bound = true;
  document.addEventListener('keydown', handleKeydown);
}

/**
 * Run `handler` on every Escape keydown until `signal` aborts.
 * @param {AbortSignal} signal
 * @param {(event: KeyboardEvent) => void} handler
 */
export function onEscape(signal, handler) {
  ensureBound();
  escapeHandlers.add(handler);
  signal.addEventListener('abort', () => escapeHandlers.delete(handler), { once: true });
}

/** Test helper — drop every registered handler and unbind the listener. */
export function resetGlobalEvents() {
  escapeHandlers.clear();
  if (bound) document.removeEventListener('keydown', handleKeydown);
  bound = false;
}
