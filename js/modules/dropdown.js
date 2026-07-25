/**
 * Dropdown panes.
 * Toggle: [data-dropdown-open="paneId"]
 * Close: outside click, Esc, second click on trigger
 */
export class Dropdown {
  constructor(root = document) {
    this.root = root;
    this.#bind();
  }

  #bind() {
    this.root.addEventListener(
      'click',
      (event) => {
        const trigger = event.target.closest('[data-dropdown-open]');
        if (trigger) {
          event.preventDefault();
          event.stopPropagation();
          const id = trigger.getAttribute('data-dropdown-open');
          const pane = document.getElementById(id);
          if (!pane) return;

          const willOpen = !pane.classList.contains('is-open');
          this.closeAll();
          if (willOpen) this.#open(pane, trigger);
          return;
        }

        if (!event.target.closest('.dropdown-pane.is-open')) {
          this.closeAll();
        }
      },
      true,
    );

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeAll();
    });
  }

  #open(pane, trigger) {
    pane.classList.add('is-open');
    pane.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
  }

  closeAll() {
    document.querySelectorAll('.dropdown-pane.is-open').forEach((pane) => {
      pane.classList.remove('is-open');
      pane.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('[data-dropdown-open][aria-expanded="true"]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });
  }
}
