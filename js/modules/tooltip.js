/**
 * Tooltip a11y helpers (visuals are pure CSS via .has-tip[data-tip]).
 * Attribute is data-tip on purpose — Foundation still watches [data-tooltip].
 */
export class Tooltip {
  constructor(root = document) {
    root.querySelectorAll('.has-tip[data-tip]').forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
      el.setAttribute('aria-label', el.getAttribute('data-tip') || '');
    });
  }
}
