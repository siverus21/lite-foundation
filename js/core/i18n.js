/**
 * Tiny message catalog for runtime UI strings (aria-labels, empty states, …).
 *
 * Defaults are English for generic chrome labels; a few product strings that
 * were already Russian in the codebase stay Russian until overridden.
 *
 *   import { t, setMessages } from '../core/i18n.js';
 *   setMessages({ close: 'Закрыть', clear: 'Очистить' });
 *   closeBtn.setAttribute('aria-label', t('close'));
 */

/** @typedef {string | ((...args: any[]) => string)} Message */

/** @type {Record<string, Message>} */
const defaults = {
  close: 'Close',
  clear: 'Clear',
  empty: 'Ничего не найдено',
  back: 'Назад',
  copied: 'Скопировано',
  copyFailed: 'Не удалось',
  /** @param {number} index 1-based @param {number} total */
  otpDigit: (index, total) => `Digit ${index} of ${total}`,
};

/** @type {Record<string, Message>} */
let catalog = { ...defaults };

/**
 * Resolve a message key. Functions receive the extra args from `t(key, …args)`.
 * @param {string} key
 * @param {...any} args
 * @returns {string}
 */
export function t(key, ...args) {
  const value = catalog[key] ?? defaults[key] ?? key;
  return typeof value === 'function' ? String(value(...args)) : String(value);
}

/**
 * Merge overrides into the active catalog (shallow).
 * @param {Record<string, Message>} partial
 */
export function setMessages(partial = {}) {
  catalog = { ...catalog, ...partial };
}

/** Restore built-in defaults (tests / teardown). */
export function resetMessages() {
  catalog = { ...defaults };
}

/** @returns {Readonly<Record<string, Message>>} */
export function messages() {
  return catalog;
}
