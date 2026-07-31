/**
 * Accordion menu (`data-menu="accordion"`).
 *
 *   <ul class="vertical menu" data-menu="accordion">
 *     <li>
 *       <a href="#">Section</a>
 *       <ul class="nested menu">…</ul>
 *     </li>
 *   </ul>
 *
 * Nested lists are wrapped in `.submenu-panel` so height can animate. Clicking
 * a parent link toggles `.is-open` / `aria-expanded` on that `<li>` only
 * (siblings stay open — multi-expand).
 *
 * Events on the toggled `<li>`, bubbling:
 *   opened.lf.menu-accordion  detail { menu, item }
 *   closed.lf.menu-accordion  detail { menu, item }
 */
import { Module } from '../core/Module.js';
import { markSubmenus } from './menu-utils.js';

function wrapAccordionPanels(menu) {
  menu.querySelectorAll('li.has-submenu').forEach((li) => {
    const nested = li.querySelector(':scope > .nested, :scope > .menu');
    if (!nested || nested.parentElement?.classList.contains('submenu-panel')) return;

    const panel = document.createElement('div');
    panel.className = 'submenu-panel';
    li.insertBefore(panel, nested);
    panel.appendChild(nested);
  });
}

export class MenuAccordion extends Module {
  static id = 'menu-accordion';
  static lazySelector = '[data-menu="accordion"]';

  constructor(root = document) {
    super(root);
    if (!root.querySelector('[data-menu="accordion"]')) return;

    this.mountAll('[data-menu="accordion"]', (menu) => {
      markSubmenus(menu);
      wrapAccordionPanels(menu);

      this.on(menu, 'click', (event) => {
        const link = event.target.closest('a');
        if (!link || !menu.contains(link)) return;

        const item = link.parentElement;
        if (!item?.classList.contains('has-submenu')) return;

        event.preventDefault();
        const open = item.classList.toggle('is-open');
        item.setAttribute('aria-expanded', open ? 'true' : 'false');
        this.emit(item, open ? 'opened' : 'closed', { menu, item });
      });
    });
  }
}
