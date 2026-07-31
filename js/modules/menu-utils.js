/**
 * Shared helpers for menu-* modules (dropdown / accordion / drilldown).
 *
 * `markSubmenus(menu)` walks each `<li>`, finds a nested `.menu` / `.nested`,
 * and stamps `has-submenu` + `aria-expanded="false"` (when missing) so CSS and
 * the menu modules share one markup contract:
 *
 *   <ul class="menu" data-menu="dropdown">
 *     <li>
 *       <a href="#">Parent</a>
 *       <ul class="menu">…</ul>
 *     </li>
 *   </ul>
 *
 * After mark: the `<li>` has `.has-submenu`, the nested list gets
 * `.nested.menu.vertical`. Callers own open/close and events.
 */

export function markSubmenus(menu) {
  menu.querySelectorAll('li').forEach((li) => {
    const submenu = li.querySelector(':scope > .menu, :scope > .nested');
    if (!submenu) return;
    li.classList.add('has-submenu');
    if (!li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', 'false');
    submenu.classList.add('nested', 'menu', 'vertical');
  });
}
