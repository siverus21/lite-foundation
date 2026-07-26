import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Modal } from '../js/modules/modal.js';
import { resetScrollLock } from '../js/core/scroll-lock.js';

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
});
