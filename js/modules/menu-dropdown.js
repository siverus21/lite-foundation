/**
 * Dropdown menu (`data-menu="dropdown"`).
 *
 *   <ul class="dropdown menu" data-menu="dropdown">
 *     <li>
 *       <a href="#">Parent</a>
 *       <ul class="menu">…</ul>
 *     </li>
 *   </ul>
 *
 * Opening one top-level item closes siblings. Escape closes every open item
 * owned by this instance (scoped to `this.root`).
 *
 * Events on the toggled `<li>`, bubbling:
 *   opened.lf.menu-dropdown  detail { menu, item }
 *   closed.lf.menu-dropdown  detail { menu, item }
 */
import { Module } from '../core/Module.js';
import { markSubmenus } from './menu-utils.js';
import { onEscape } from '../core/global-events.js';

/** Close open items only inside `root` — never tear down another instance's menus. */
function closeAllMenus(root, emitClosed) {
  root.querySelectorAll('[data-menu="dropdown"] > li.is-open').forEach((li) => {
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
      closeAllMenus(this.root, (li) =>
        this.emit(li, 'closed', { menu: li.closest('[data-menu="dropdown"]'), item: li }),
      );
    });

    onEscape(this.signal, () => {
      closeAllMenus(this.root, (li) =>
        this.emit(li, 'closed', { menu: li.closest('[data-menu="dropdown"]'), item: li }),
      );
    });
  }
}
