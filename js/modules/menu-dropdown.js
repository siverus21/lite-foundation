/**
 * Dropdown menu (data-menu="dropdown").
 */
import { Module } from '../core/Module.js';
import { markSubmenus } from './menu-utils.js';
import { onEscape } from '../core/global-events.js';

function closeAllMenus() {
  document.querySelectorAll('[data-menu="dropdown"] > li.is-open').forEach((li) => {
    li.classList.remove('is-open');
    li.setAttribute('aria-expanded', 'false');
  });
}

export class MenuDropdown extends Module {
  constructor(root = document) {
    super(root);
    if (!root.querySelector('[data-menu="dropdown"]')) return;

    this.mountAll('[data-menu="dropdown"]', (menu) => {
      markSubmenus(menu);

      this.on(menu, 'click', (event) => {
        const link = event.target.closest('a');
        if (!link || !menu.contains(link)) return;

        const item = link.parentElement;
        if (!item?.classList.contains('has-submenu')) return;

        event.preventDefault();
        const willOpen = !item.classList.contains('is-open');
        menu.querySelectorAll(':scope > li.is-open').forEach((li) => {
          li.classList.remove('is-open');
          li.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          item.setAttribute('aria-expanded', 'true');
        }
      });
    });

    this.on(document, 'click', (event) => {
      if (event.target.closest('[data-menu="dropdown"]')) return;
      closeAllMenus();
    });

    onEscape(this.signal, closeAllMenus);
  }
}
