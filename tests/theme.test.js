import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Theme } from '../js/modules/theme.js';

const STORAGE_KEY = 'lf-theme';

/**
 * happy-dom exposes a `localStorage` object without the Storage methods, so the
 * tests install a working one. The module treats storage failures as
 * non-fatal (private mode, sandboxed iframes) — see the last test.
 */
const store = new Map();

function useMemoryStorage(impl) {
  Object.defineProperty(window, 'localStorage', {
    value:
      impl ||
      {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
    configurable: true,
    writable: true,
  });
}

describe('Theme', () => {
  let theme;

  beforeEach(() => {
    store.clear();
    useMemoryStorage();
    document.documentElement.removeAttribute('data-theme');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    theme?.destroy();
    theme = null;
    store.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.innerHTML = '';
  });

  it('starts in auto mode without writing an attribute', () => {
    theme = new Theme(document);

    expect(Theme.mode()).toBe('auto');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('set() writes the attribute, persists the choice and announces it', () => {
    theme = new Theme(document);
    const events = [];
    document.addEventListener('changed.lf.theme', (event) => events.push(event.detail));

    Theme.set('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(events[0]).toEqual({ mode: 'dark', resolved: 'dark' });
  });

  it('auto clears both the attribute and the stored value', () => {
    theme = new Theme(document);
    Theme.set('light');
    Theme.set('auto');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(null);
  });

  it('toggle() flips the scheme that is on screen', () => {
    theme = new Theme(document);

    Theme.set('light');
    expect(Theme.toggle()).toBe('dark');
    expect(Theme.toggle()).toBe('light');
  });

  it('restores a stored preference on init', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');
    theme = new Theme(document);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(Theme.resolved()).toBe('dark');
  });

  it('[data-theme-set] buttons apply their mode and reflect aria-pressed', () => {
    document.body.innerHTML = `
      <button data-theme-set="light">Светлая</button>
      <button data-theme-set="dark">Тёмная</button>
      <button data-theme-set="auto">Авто</button>
    `;
    theme = new Theme(document);

    document.querySelector('[data-theme-set="dark"]').click();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.querySelector('[data-theme-set="dark"]').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-theme-set="light"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('[data-theme-toggle] flips and can swap its own label', () => {
    document.body.innerHTML = `
      <button data-theme-toggle data-theme-label-dark="Тёмная" data-theme-label-light="Светлая">Тема</button>
    `;
    theme = new Theme(document);
    const button = document.querySelector('[data-theme-toggle]');

    button.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toBe('Тёмная');

    button.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(button.textContent).toBe('Светлая');
  });

  it('lf:theme:set and lf:theme:toggle drive the theme without an instance reference', () => {
    theme = new Theme(document);

    document.dispatchEvent(new CustomEvent('lf:theme:set', { detail: { mode: 'dark' } }));
    expect(Theme.mode()).toBe('dark');

    document.dispatchEvent(new CustomEvent('lf:theme:toggle'));
    expect(Theme.mode()).toBe('light');
  });

  it('ignores an unknown mode instead of writing garbage', () => {
    theme = new Theme(document);

    Theme.set('sepia');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(Theme.mode()).toBe('auto');
  });

  it('still switches the theme when storage throws (private mode)', () => {
    useMemoryStorage({
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    });

    theme = new Theme(document);
    Theme.set('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(Theme.mode()).toBe('auto');
  });
});
