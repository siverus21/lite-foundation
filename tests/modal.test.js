import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Modal } from '../js/modules/modal.js';
import { resetScrollLock } from '../js/core/scroll-lock.js';

/** happy-dom may stub dialog APIs differently across versions. */
function stubDialog(dialog) {
  if (typeof dialog.showModal !== 'function') {
    dialog.showModal = function showModal() {
      this.open = true;
    };
  }
  if (typeof dialog.close !== 'function' || !dialog.close.__lfStub) {
    dialog.close = function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
    dialog.close.__lfStub = true;
  }
}

describe('Modal', () => {
  beforeEach(() => {
    resetScrollLock();
    document.body.innerHTML = `
      <button type="button" data-dialog-open="m1">Open</button>
      <dialog class="modal" id="m1">
        <button type="button" data-dialog-close>Close</button>
        <p>Hi</p>
      </dialog>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    resetScrollLock();
  });

  it('opens native dialog via data-dialog-open', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    if (typeof dialog.showModal !== 'function') {
      // happy-dom may stub dialog APIs differently across versions
      dialog.showModal = function showModal() {
        this.open = true;
      };
      dialog.close = function close() {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      };
    }

    document.querySelector('[data-dialog-open="m1"]').click();
    expect(dialog.open).toBe(true);

    modal.destroy();
  });

  it('does not stack document listeners after destroy', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    dialog.showModal =
      dialog.showModal ||
      function showModal() {
        this.open = true;
      };
    dialog.close =
      dialog.close ||
      function close() {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      };

    modal.destroy();
    document.querySelector('[data-dialog-open="m1"]').click();
    expect(dialog.open).toBeFalsy();
  });

  it('moves a dialog that is not already a direct child of body', () => {
    const dialog = document.getElementById('m1');
    const wrapper = document.createElement('div');
    dialog.parentElement.insertBefore(wrapper, dialog);
    wrapper.appendChild(dialog);
    expect(dialog.parentElement).toBe(wrapper);

    const modal = new Modal(document);
    expect(dialog.parentElement).toBe(document.body);
    modal.destroy();
  });

  it('closes via [data-dialog-close] inside the dialog', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    stubDialog(dialog);

    document.querySelector('[data-dialog-open="m1"]').click();
    expect(dialog.open).toBe(true);

    document.querySelector('[data-dialog-close]').click();
    expect(dialog.open).toBe(false);

    modal.destroy();
  });

  it('closes on a click that lands directly on the dialog (backdrop click)', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    stubDialog(dialog);

    document.querySelector('[data-dialog-open="m1"]').click();
    expect(dialog.open).toBe(true);

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.open).toBe(false);

    modal.destroy();
  });

  it('does not close when the click lands on content inside the dialog', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    stubDialog(dialog);

    document.querySelector('[data-dialog-open="m1"]').click();
    dialog.querySelector('p').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.open).toBe(true);

    modal.destroy();
  });

  it('on close: unlocks scroll, drops is-modal-open, and restores focus to the opener', async () => {
    vi.useFakeTimers();
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    stubDialog(dialog);
    const opener = document.querySelector('[data-dialog-open="m1"]');

    opener.click();
    expect(document.body.classList.contains('is-modal-open')).toBe(true);
    expect(document.body.classList.contains('is-scroll-locked')).toBe(true);

    dialog.close();
    expect(document.body.classList.contains('is-modal-open')).toBe(false);
    expect(document.body.classList.contains('is-scroll-locked')).toBe(false);

    await vi.runAllTimersAsync();
    expect(document.activeElement).toBe(opener);

    modal.destroy();
    vi.useRealTimers();
  });

  it('ignores data-dialog-open for an unknown id or an already-open dialog', () => {
    const modal = new Modal(document);
    const dialog = document.getElementById('m1');
    stubDialog(dialog);

    document.querySelector('[data-dialog-open="m1"]').setAttribute('data-dialog-open', 'missing');
    document.querySelector('[data-dialog-open="missing"]').click();
    expect(dialog.open).toBeFalsy();

    document.querySelector('[data-dialog-open="missing"]').setAttribute('data-dialog-open', 'm1');
    dialog.showModal();
    document.querySelector('[data-dialog-open="m1"]').click();
    // already open — click handler bails out, showModal isn't called again
    expect(dialog.open).toBe(true);

    modal.destroy();
  });
});
