/**
 * Attribute readers with predictable coercion.
 *
 * Every module used to inline its own `Number(el.getAttribute(...)) || fallback`,
 * which silently turns a legitimate 0 into the fallback and an empty/missing
 * attribute into 0 (that combination shipped a real clamping bug in Quantity).
 * These helpers separate "absent" from "present but unparseable" once, here.
 */

/** @param {unknown} value @param {number} fallback */
export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** @param {Element} el @param {string} name @param {string|null} [fallback] */
export function str(el, name, fallback = null) {
  const value = el?.getAttribute?.(name);
  return value === null || value === undefined ? fallback : value;
}

/** @param {Element} el @param {string} name @param {number} [fallback] */
export function num(el, name, fallback = 0) {
  return toNumber(el?.getAttribute?.(name), fallback);
}

/** @param {Element} el @param {string} name @param {number} [fallback] */
export function int(el, name, fallback = 0) {
  return Math.trunc(num(el, name, fallback));
}

/**
 * Presence-or-value flag: `data-x`, `data-x=""`, `data-x="true"` and `data-x="1"`
 * are all true; `data-x="false"` / `data-x="0"` opt out without removing the
 * attribute (handy when markup is generated server-side).
 * @param {Element} el @param {string} name @param {boolean} [fallback]
 */
export function bool(el, name, fallback = false) {
  if (!el?.hasAttribute?.(name)) return fallback;
  const value = el.getAttribute(name).trim().toLowerCase();
  return value !== 'false' && value !== '0' && value !== 'off';
}

/** @param {Element} el @param {string} name @param {string} [separator] @returns {string[]} */
export function list(el, name, separator = ',') {
  const raw = str(el, name, '');
  if (!raw) return [];
  return raw
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Malformed JSON in markup must not take the whole module down with it.
 * @template T @param {Element} el @param {string} name @param {T} fallback @returns {T}
 */
export function json(el, name, fallback) {
  const raw = str(el, name);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

/** @param {number} value @param {number} min @param {number} max */
export function clamp(value, min, max) {
  if (min > max) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Round to a step grid anchored at `min`, then trim float noise.
 * `0.1 + 0.2` style drift is what turns a step=0.1 slider value into
 * `43.371428571428574` in a submitted form field.
 * @param {number} value @param {number} step @param {number} [min]
 */
export function snap(value, step, min = 0) {
  if (!Number.isFinite(step) || step <= 0) return value;
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  // Decimals of the step decide the precision: step 0.25 → 2, step 1 → 0.
  const decimals = (String(step).split('.')[1] || '').length;
  return decimals ? Number(snapped.toFixed(decimals)) : snapped;
}

/**
 * Set several attributes at once; `null`/`undefined` removes instead of writing
 * the string "null".
 * @param {Element} el @param {Record<string, string|number|boolean|null|undefined>} map
 */
export function setAttrs(el, map) {
  for (const [name, value] of Object.entries(map)) {
    if (value === null || value === undefined || value === false) el.removeAttribute(name);
    else if (value === true) el.setAttribute(name, '');
    else el.setAttribute(name, String(value));
  }
}
