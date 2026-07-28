/**
 * "Run this when the CSS transition finishes" — with the fallback timer that a
 * transitionend listener always needs.
 *
 * A transition that never starts (display:none, reduced motion, a zero duration,
 * an interrupted transition) fires no transitionend at all, so every caller needs
 * a timer too. Accordion, Offcanvas, Toast and the drilldown menu each grew their
 * own copy of that pair — and the accordion's copy forgot to clear the timer when
 * the event did arrive, which left a stale callback that re-expanded a closed
 * panel a moment later.
 */

/** True when the user asked the OS to reduce motion (or matchMedia is unavailable). */
export function prefersReducedMotion() {
  return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

/**
 * @param {Element} el
 * @param {() => void} done            runs exactly once
 * @param {object} [options]
 * @param {string} [options.property]  only react to this CSS property
 * @param {number} [options.fallback]  ms before `done` runs anyway (default 350)
 * @param {AbortSignal} [options.signal] abort → `done` never runs
 * @returns {() => void} cancel
 */
export function afterTransition(el, done, options = {}) {
  const { property, fallback = 350, signal } = options;

  let finished = false;
  let timer = null;

  const cleanup = () => {
    el.removeEventListener('transitionend', onEnd);
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    done();
  };

  function onEnd(event) {
    // Transitions of nested children bubble up here too.
    if (event.target !== el) return;
    if (property && event.propertyName !== property) return;
    finish();
  }

  const cancel = () => {
    if (finished) return;
    finished = true;
    cleanup();
  };

  if (signal?.aborted) {
    cancel();
    return cancel;
  }

  if (prefersReducedMotion()) {
    // No transition to wait for — don't hold the UI for `fallback` ms.
    finish();
    return cancel;
  }

  el.addEventListener('transitionend', onEnd);
  timer = setTimeout(finish, fallback);
  signal?.addEventListener('abort', cancel, { once: true });

  return cancel;
}

/**
 * Animate an element's height between its collapsed and natural size.
 * Returns a promise that settles when the transition ends (or immediately under
 * reduced motion).
 *
 * @param {HTMLElement} el
 * @param {'open'|'close'} direction
 * @param {{ fallback?: number, signal?: AbortSignal, measure?: () => number }} [options]
 * @returns {Promise<void>}
 */
export function animateHeight(el, direction, options = {}) {
  const { fallback = 500, signal, measure } = options;
  const opening = direction === 'open';

  if (prefersReducedMotion()) {
    el.style.height = opening ? 'auto' : '0px';
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (opening) {
      el.style.height = '0px';
      // Force a reflow so the browser has a start value to animate from.
      void el.offsetHeight;
      el.style.height = `${measure ? measure() : el.scrollHeight}px`;
    } else {
      const current =
        el.style.height === 'auto' || !el.style.height ? el.scrollHeight : el.offsetHeight;
      el.style.height = `${current}px`;
      void el.offsetHeight;
      el.style.height = '0px';
    }

    afterTransition(
      el,
      () => {
        // `auto` after opening so the panel keeps up with content changes.
        if (opening) el.style.height = 'auto';
        resolve();
      },
      { property: 'height', fallback, signal },
    );
  });
}
