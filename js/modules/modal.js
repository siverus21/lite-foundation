/**
 * Native <dialog> modal.
 * Open:  [data-dialog-open="dialogId"]
 * Close: [data-dialog-close] inside dialog, Esc, click on backdrop
 */
export class Modal {
  constructor(root = document) {
    this.root = root;
    this.#mountDialogs();
    this.#bind();
  }

  #mountDialogs() {
    this.root.querySelectorAll('dialog.modal').forEach((dialog) => {
      if (dialog.parentElement !== document.body) {
        document.body.appendChild(dialog);
      }
      dialog.addEventListener('close', () => this.#unlockScroll());
    });
  }

  #bind() {
    this.root.addEventListener('click', (event) => this.#onClick(event));
  }

  #onClick(event) {
    const openBtn = event.target.closest('[data-dialog-open]');
    if (openBtn) {
      event.preventDefault();
      const id = openBtn.getAttribute('data-dialog-open');
      const dialog = document.getElementById(id);
      if (!dialog || typeof dialog.showModal !== 'function' || dialog.open) return;
      this.#lockScroll();
      dialog.showModal();
      return;
    }

    const closeBtn = event.target.closest('[data-dialog-close]');
    if (closeBtn) {
      event.preventDefault();
      const dialog = closeBtn.closest('dialog');
      if (dialog && typeof dialog.close === 'function') dialog.close();
      return;
    }

    const dialog = event.target.closest('dialog.modal');
    if (dialog && event.target === dialog) {
      dialog.close();
    }
  }

  #lockScroll() {
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = String(scrollY);
    document.body.classList.add('is-modal-open');
    document.body.style.top = `-${scrollY}px`;
  }

  #unlockScroll() {
    const scrollY = Number(document.body.dataset.scrollY || 0);
    document.body.classList.remove('is-modal-open');
    document.body.style.top = '';
    delete document.body.dataset.scrollY;
    window.scrollTo(0, scrollY);
  }
}
