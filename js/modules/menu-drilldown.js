/**
 * Drilldown menu (`data-menu="drilldown"`) — nested menus slide in one level at a
 * time, the pattern mobile navigation uses when the tree is too deep for an
 * accordion.
 *
 * Each submenu gets a generated "back" item. Its label comes from
 * `data-drilldown-back` on the menu root and defaults to "Назад".
 *
 * The wrapper's height animates to the visible panel, so the surrounding layout
 * doesn't jump — that measurement is why this module is heavier than its siblings.
 *
 * Events on the submenu panel: `opened.lf.menu-drilldown` /
 * `closed.lf.menu-drilldown`, detail `{ menu, submenu }`.
 */
import { Module } from '../core/Module.js';
import { afterTransition } from '../core/transition.js';
import { str } from '../core/attrs.js';
import { t } from '../core/i18n.js';

export class MenuDrilldown extends Module {
  static id = 'menu-drilldown';

  constructor(root = document) {
    super(root);
    this._instances = [];
    this.mountAll('[data-menu="drilldown"]', (menu) => {
      this._instances.push(new DrilldownMenu(menu, this));
    });
  }

  destroy() {
    this._instances.forEach((d) => d.destroy?.());
    this._instances = [];
    super.destroy();
  }
}

class DrilldownMenu {
  constructor(menu, owner) {
    this.menu = menu;
    this.owner = owner;
    this.wrapper = this.#ensureWrapper();
    this._ro = null;
    this.#setupSubmenus();
    this.#bindMeasure();
    this.#bindClicks();
  }

  #ensureWrapper() {
    let wrapper = this.menu.parentElement;
    if (!wrapper?.classList.contains('is-drilldown')) {
      wrapper = document.createElement('div');
      wrapper.className = 'is-drilldown animate-height';
      this.menu.parentNode.insertBefore(wrapper, this.menu);
      wrapper.appendChild(this.menu);
    } else {
      wrapper.classList.add('animate-height');
    }
    return wrapper;
  }

  #setupSubmenus() {
    this.menu.querySelectorAll('li').forEach((li) => {
      const submenu = li.querySelector(':scope > .menu, :scope > .nested');
      if (!submenu) return;

      li.classList.add('has-submenu', 'is-drilldown-submenu-parent');
      li.setAttribute('aria-expanded', 'false');
      submenu.classList.add(
        'nested',
        'menu',
        'vertical',
        'is-drilldown-submenu',
        'invisible',
      );
      submenu.setAttribute('data-submenu', '');
      submenu.setAttribute('aria-hidden', 'true');
      ensureBackLink(submenu, str(this.menu, 'data-drilldown-back') || t('back'));
    });
  }

  #applyHeight(panel) {
    const width = this.wrapper.offsetWidth || this.menu.offsetWidth || 250;
    this.wrapper.style.width = `${width}px`;
    setDrilldownHeight(this.wrapper, panel, width);
  }

  #scheduleHeight(panel) {
    this.#applyHeight(panel);
    requestAnimationFrame(() => this.#applyHeight(panel));
  }

  #remeasureActive = () => {
    const active = this.menu.querySelector('.is-drilldown-submenu.is-active:not(.is-closing)');
    this.#scheduleHeight(active ?? this.menu);
  };

  #bindMeasure() {
    this.#scheduleHeight(this.menu);

    // Web fonts change line heights after first paint, so re-measure once they
    // land — but not if the module was destroyed in the meantime.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (this.owner.signal.aborted) return;
        this.#remeasureActive();
      });
    }
    this.owner.on(window, 'load', this.#remeasureActive, { once: true });

    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.#remeasureActive());
      this._ro.observe(this.menu);
      this.menu.querySelectorAll(':scope > li > a').forEach((link) => this._ro.observe(link));
    }

    this.owner.on(window, 'resize', () => {
      this.wrapper.style.width = '';
      this.#remeasureActive();
    });
  }

  #bindClicks() {
    this.owner.on(this.menu, 'click', (event) => {
      const backLink = event.target.closest('.js-drilldown-back > a');
      if (backLink && this.menu.contains(backLink)) {
        event.preventDefault();
        const submenu = backLink.closest('.is-drilldown-submenu');
        this.#hideSubmenu(submenu);
        return;
      }

      const link = event.target.closest('a');
      if (!link || !this.menu.contains(link)) return;

      const item = link.closest('li');
      if (!item || !this.menu.contains(item)) return;
      if (!item.classList.contains('is-drilldown-submenu-parent')) return;
      if (link.parentElement !== item) return;

      event.preventDefault();
      const submenu = item.querySelector(':scope > .is-drilldown-submenu');
      if (submenu) this.#showSubmenu(submenu);
    });
  }

  #showSubmenu(submenu) {
    const parentMenu = submenu.parentElement?.parentElement;
    parentMenu?.classList.add('invisible');
    submenu.classList.add('is-active');
    submenu.classList.remove('is-closing', 'invisible');
    submenu.setAttribute('aria-hidden', 'false');
    submenu.parentElement?.setAttribute('aria-expanded', 'true');
    this.#scheduleHeight(submenu);
    this.owner.emit(submenu, 'opened', { menu: this.menu, submenu });
  }

  #hideSubmenu(submenu) {
    if (!submenu) return;

    const parentMenu = submenu.parentElement?.parentElement;
    parentMenu?.classList.remove('invisible');
    submenu.parentElement?.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    submenu.classList.add('is-closing');

    this.#scheduleHeight(parentMenu ?? this.menu);
    this.owner.emit(submenu, 'closed', { menu: this.menu, submenu });

    afterTransition(
      submenu,
      () => {
        submenu.classList.remove('is-active', 'is-closing');
        submenu.classList.add('invisible');
      },
      { property: 'transform', fallback: 200, signal: this.owner.signal },
    );
  }

  destroy() {
    this._ro?.disconnect();
  }
}

function ensureBackLink(submenu, label) {
  if (submenu.querySelector(':scope > .js-drilldown-back')) return;

  const back = document.createElement('li');
  back.className = 'js-drilldown-back';
  const link = document.createElement('a');
  link.href = '#';
  link.tabIndex = 0;
  link.textContent = label;
  back.appendChild(link);
  submenu.insertBefore(back, submenu.firstChild);
}

function setDrilldownHeight(wrapper, panel, width) {
  if (!wrapper || !panel) return;

  const w = width || wrapper.offsetWidth || 250;
  let live = 0;

  for (const li of panel.children) {
    if (!(li instanceof HTMLElement)) continue;
    const link = li.querySelector(':scope > a');
    const h = link ? link.offsetHeight : li.offsetHeight;
    if (h > 0) live += h;
  }

  const cloned = measureDrilldownPanel(panel, w);
  const height = Math.max(live, cloned);
  if (!height) return;
  wrapper.style.height = `${height}px`;
}

function measureDrilldownPanel(panel, width) {
  const shell = document.createElement('div');
  shell.className = 'is-drilldown';
  shell.style.cssText = [
    'position:absolute',
    'inset-inline-start:-99999px',
    'top:0',
    'visibility:hidden',
    'pointer-events:none',
    `width:${width}px`,
  ].join(';');

  const clone = panel.cloneNode(true);
  clone.querySelectorAll('.is-drilldown-submenu').forEach((node) => node.remove());
  clone.classList.remove('invisible', 'is-closing', 'is-active');
  clone.style.cssText = [
    'position:static',
    'inset-inline-start:auto',
    'top:auto',
    'transform:none',
    'visibility:visible',
    'height:auto',
    'width:100%',
    'margin:0',
    'z-index:auto',
  ].join(';');

  shell.appendChild(clone);
  document.body.appendChild(shell);
  const height = Math.ceil(clone.getBoundingClientRect().height);
  shell.remove();
  return height;
}
