/**
 * Ids for generated markup that ARIA has to reference by id
 * (`aria-controls`, `aria-activedescendant`, `<label for>`).
 */
let counter = 0;

/** @param {string} [prefix] @returns {string} e.g. `lf-combobox-3` */
export function uid(prefix = 'lf') {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Test helper — makes generated ids deterministic per test. */
export function resetUid() {
  counter = 0;
}
