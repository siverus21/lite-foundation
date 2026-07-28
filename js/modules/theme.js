/**
 * Colour-scheme switch (light / dark / auto).
 *
 * CSS side: scss/settings/css-variables/_dark.scss flips the --lf-* tokens for
 * `prefers-color-scheme: dark` and for `[data-theme='dark']`. This module only
 * writes the attribute on <html> and remembers the choice.
 *
 * Markup:
 *   <button data-theme-toggle>            → flips light ⇄ dark
 *   <button data-theme-set="auto">        → pins a specific mode
 *
 * Static API (no instance needed): Theme.set('dark'), Theme.toggle(),
 * Theme.mode(), Theme.resolved().
 * Commands on document:
 *   lf:theme:set     { mode: 'dark' | 'light' | 'auto' }
 *   lf:theme:toggle
 * Change event: `changed.lf.theme` on document, detail { mode, resolved }.
 *
 * Note on the first paint: this module runs with the page bundle, so a stored
 * choice that disagrees with the OS preference applies a frame late. Pages that
 * care should inline the attribute in <head> (see docs/dark-mode.html).
 */
import { Module } from '../core/Module.js';
import { emit, eventName } from '../core/events.js';

const STORAGE_KEY = 'lf-theme';
const MODES = ['light', 'dark', 'auto'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** localStorage throws in Safari private mode / sandboxed iframes — never fatal here. */
function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return MODES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStored(mode) {
  try {
    if (mode === 'auto') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore — the attribute still applies for this page view
  }
}

export class Theme extends Module {
  static id = 'theme';

  constructor(root = document) {
    super(root);

    Theme.set(Theme.mode(), { persist: false, silent: true });
    this.#syncControls();

    this.on(document, 'click', (event) => {
      const setter = event.target.closest('[data-theme-set]');
      if (setter) {
        Theme.set(setter.getAttribute('data-theme-set'));
        return;
      }
      if (event.target.closest('[data-theme-toggle]')) Theme.toggle();
    });

    this.commands(document, {
      set: (event) => {
        const mode = event.detail?.mode;
        if (mode) Theme.set(mode);
      },
      toggle: () => Theme.toggle(),
    });

    this.on(document, 'changed.lf.theme', () => this.#syncControls());

    // Follow the OS while in `auto` so the controls' pressed state stays honest.
    window.matchMedia?.(DARK_QUERY)?.addEventListener?.(
      'change',
      () => {
        if (Theme.mode() === 'auto') this.#syncControls();
      },
      { signal: this.signal },
    );
  }

  /** Stored preference, or 'auto' when the visitor never chose. */
  static mode() {
    return readStored() || 'auto';
  }

  /** The scheme actually rendering right now: 'dark' | 'light'. */
  static resolved() {
    const mode = Theme.mode();
    if (mode !== 'auto') return mode;
    return window.matchMedia?.(DARK_QUERY)?.matches ? 'dark' : 'light';
  }

  /**
   * @param {'light'|'dark'|'auto'} mode
   * @param {{ persist?: boolean, silent?: boolean }} [options]
   */
  static set(mode, { persist = true, silent = false } = {}) {
    const next = MODES.includes(mode) ? mode : 'auto';
    const html = document.documentElement;

    if (next === 'auto') html.removeAttribute('data-theme');
    else html.setAttribute('data-theme', next);

    if (persist) writeStored(next);
    if (silent) return next;

    emit(document, eventName('changed', Theme.id), {
      mode: next,
      resolved: Theme.resolved(),
    });
    return next;
  }

  /** Flip to the opposite of what is on screen (leaves `auto` behind on purpose). */
  static toggle() {
    return Theme.set(Theme.resolved() === 'dark' ? 'light' : 'dark');
  }

  #syncControls() {
    const mode = Theme.mode();
    const resolved = Theme.resolved();

    this.root.querySelectorAll('[data-theme-set]').forEach((el) => {
      el.setAttribute('aria-pressed', String(el.getAttribute('data-theme-set') === mode));
    });

    this.root.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      el.setAttribute('aria-pressed', String(resolved === 'dark'));
      const label = el.getAttribute(`data-theme-label-${resolved}`);
      if (label) el.textContent = label;
    });
  }
}
