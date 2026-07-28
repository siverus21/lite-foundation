/**
 * Dropdown menu (data-menu="dropdown").
 *
 * Events on the open/closed `<li>` (bubble): `opened.lf.menu-dropdown`,
 * `closed.lf.menu-dropdown`, detail `{ menu, item }`.
 */
import { Module } from '../core/Module.js';
import { markSubmenus } from './menu-utils.js';
import { onEscape } from '../core/global-events.js';

function closeAllMenus(emitClosed) {
  document.querySelectorAll('[data-menu="dropdown"] > li.is-open').forEach((li) => {
    li.classList.remove('is-open');
    li.setAttribute('aria-expanded', 'false');
    emitClosed?.(li);
  });
}

export class MenuDropdown extends Module {
  static id = 'menu-dropdown';

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
          this.emit(li, 'closed', { menu, item: li });
        });
        if (willOpen) {
          item.classList.add('is-open');
          item.setAttribute('aria-expanded', 'true');
          this.emit(item, 'opened', { menu, item });
        }
      });
    });

    this.on(document, 'click', (event) => {
      if (event.target.closest('[data-menu="dropdown"]')) return;
      closeAllMenus((li) =>
        this.emit(li, 'closed', { menu: li.closest('[data-menu="dropdown"]'), item: li }),
      );
    });

    onEscape(this.signal, () => {
      closeAllMenus((li) =>
        this.emit(li, 'closed', { menu: li.closest('[data-menu="dropdown"]'), item: li }),
      );
    });
  }
}
