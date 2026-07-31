/**
 * Copy to clipboard.
 *
 *   <button class="button" data-copy="#snippet">Копировать</button>
 *   <button class="button" data-copy-text="npm i lite-foundation">Копировать</button>
 *
 * `data-copy` takes a selector: the element's `value` (inputs) or text content is
 * copied. `data-copy-text` copies a literal string.
 *
 * Settings (attributes on the button):
 *   data-copy-label="Скопировано"   temporary button label
 *   data-copy-status                render a `.copy-status` message next to it
 *   data-copy-timeout="1500"        how long the feedback stays (ms)
 *
 * Events on the button:
 *   copied.lf.copy  detail { text }
 *   failed.lf.copy  detail { error }
 *
 * navigator.clipboard needs a secure context (https or localhost). Outside one
 * — plain http staging, file:// — this falls back to a hidden textarea plus
 * document.execCommand('copy'), which is deprecated but still the only option
 * there. If both fail, `failed.lf.copy` lets you show your own message.
 */
import { Module } from '../core/Module.js';
import { num, str } from '../core/attrs.js';
import { t } from '../core/i18n.js';

const DEFAULT_TIMEOUT = 1500;

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('aria-hidden', 'true');
  area.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand?.('copy');
  area.remove();
  if (!ok) throw new Error('Clipboard unavailable');
}

export class Copy extends Module {
  static id = 'copy';

  constructor(root = document) {
    super(root);
    /** Feedback timers per button, so a re-click restarts instead of stacking. @type {WeakMap<Element, number>} */
    this.feedbackTimers = new WeakMap();

    if (!root.querySelector?.('[data-copy], [data-copy-text]')) return;

    this.on(root, 'click', (event) => {
      const button = event.target.closest('[data-copy], [data-copy-text]');
      if (button) this.copy(button);
    });
  }

  /** @param {Element} button */
  async copy(button) {
    const text = Copy.#textFor(button);
    if (text === null) return;

    try {
      await writeClipboard(text);
      this.#feedback(button, str(button, 'data-copy-label') || t('copied'));
      this.emit(button, 'copied', { text });
    } catch (error) {
      this.#feedback(button, t('copyFailed'), true);
      this.emit(button, 'failed', { error });
    }
  }

  static #textFor(button) {
    if (button.hasAttribute('data-copy-text')) return button.getAttribute('data-copy-text');

    const selector = button.getAttribute('data-copy');
    if (!selector) return null;
    // Same tree as the button first (subtree / ShadowRoot), then document.
    const tree = button.getRootNode?.() ?? document;
    const target =
      (typeof tree.querySelector === 'function' && tree.querySelector(selector)) ||
      document.querySelector(selector);
    if (!target) return null;
    return 'value' in target && target.value !== undefined
      ? String(target.value)
      : (target.textContent || '').trim();
  }

  #feedback(button, message, isError = false) {
    const timeout = num(button, 'data-copy-timeout', DEFAULT_TIMEOUT);
    this.clearTimer(this.feedbackTimers.get(button));

    if (button.hasAttribute('data-copy-status')) {
      let status = button.nextElementSibling;
      if (!status?.classList.contains('copy-status')) {
        status = document.createElement('span');
        status.className = 'copy-status';
        status.setAttribute('role', 'status');
        button.insertAdjacentElement('afterend', status);
      }
      status.textContent = message;
      status.classList.toggle('is-error', isError);
      status.classList.add('is-visible');
      this.feedbackTimers.set(
        button,
        this.timeout(() => status.classList.remove('is-visible'), timeout),
      );
      return;
    }

    // No status element requested → swap the label, then put it back.
    if (button.dataset.copyOriginal === undefined) {
      button.dataset.copyOriginal = button.textContent || '';
    }
    button.textContent = message;
    button.classList.add('is-copied');
    this.feedbackTimers.set(
      button,
      this.timeout(() => {
        button.textContent = button.dataset.copyOriginal || '';
        button.classList.remove('is-copied');
      }, timeout),
    );
  }

  /**
   * A pending "Скопировано" label must not be restored onto a button whose
   * module was destroyed — but if we tear down mid-feedback, the label would be
   * stuck. Restore it eagerly instead.
   */
  destroy() {
    this.root.querySelectorAll?.('[data-copy].is-copied, [data-copy-text].is-copied').forEach(
      (button) => {
        if (button.dataset.copyOriginal !== undefined) {
          button.textContent = button.dataset.copyOriginal;
        }
        button.classList.remove('is-copied');
      },
    );
    super.destroy();
  }
}
