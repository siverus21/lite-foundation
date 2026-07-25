/**
 * Off-canvas drawer.
 * Open:  [data-offcanvas-open="panelId"]
 * Close: [data-offcanvas-close], backdrop, Esc
 *
 * Starts as display:none; opening sets display then slides in.
 * Closing slides out, then display:none after transition.
 */
export class Offcanvas {
  constructor(root = document) {
    this.root = root;
    this.#ensureBackdrop();
    this.#mountPanels();
    this.#bind();
  }

  #ensureBackdrop() {
    if (document.querySelector('.offcanvas-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'offcanvas-backdrop';
    backdrop.setAttribute('data-offcanvas-close', '');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  #mountPanels() {
    this.root.querySelectorAll('.offcanvas').forEach((panel) => {
      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
    });
  }

  #bind() {
    this.root.addEventListener(
      'click',
      (event) => {
        const openBtn = event.target.closest('[data-offcanvas-open]');
        if (openBtn) {
          event.preventDefault();
          event.stopPropagation();
          this.open(openBtn.getAttribute('data-offcanvas-open'));
          return;
        }

        const closeBtn = event.target.closest('[data-offcanvas-close]');
        if (closeBtn) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
          return;
        }

        const navLink = event.target.closest('.offcanvas.is-open a[href^="#"]');
        if (navLink) this.close();
      },
      true,
    );

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
  }

  open(id) {
    const panel = document.getElementById(id);
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (!panel || !id || panel.classList.contains('is-open')) return;

    document.body.classList.add('is-offcanvas-open');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');

    if (backdrop) {
      backdrop.style.pointerEvents = 'none';
      backdrop.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => {
        if (backdrop.classList.contains('is-open')) {
          backdrop.style.pointerEvents = '';
        }
      }, 0);
    }

    requestAnimationFrame(() => {
      panel.classList.add('is-visible');
      backdrop?.classList.add('is-open');
    });
  }

  close() {
    const panels = document.querySelectorAll('.offcanvas.is-open');
    const backdrop = document.querySelector('.offcanvas-backdrop');

    panels.forEach((panel) => {
      panel.classList.remove('is-visible');

      const finish = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        panel.removeEventListener('transitionend', onEnd);
      };

      const onEnd = (event) => {
        if (event.target !== panel || event.propertyName !== 'transform') return;
        finish();
      };

      panel.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 350);
    });

    if (backdrop) {
      backdrop.classList.remove('is-open');
      backdrop.style.pointerEvents = '';
      backdrop.setAttribute('aria-hidden', 'true');
    }

    document.body.classList.remove('is-offcanvas-open');
  }
}
