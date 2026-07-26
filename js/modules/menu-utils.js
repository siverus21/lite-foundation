/**
 * Shared helpers for menu-* modules.
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
