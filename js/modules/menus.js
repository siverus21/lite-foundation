/**
 * Menu variants: dropdown, accordion, drilldown.
 * Markup uses data-menu="dropdown|accordion|drilldown".
 */
import { Module } from '../core/Module.js';

export class Menus extends Module {
  constructor(root = document) {
    super(root);
    this._drilldowns = [];
    new DropdownMenu(root, this);
    new AccordionMenu(root, this);
    root.querySelectorAll('[data-menu="drilldown"]').forEach((menu) => {
      this._drilldowns.push(new DrilldownMenu(menu, this));
    });
  }

  destroy() {
    this._drilldowns.forEach((d) => d.destroy?.());
    this._drilldowns = [];
    super.destroy();
  }
}

class DropdownMenu {
  constructor(root, owner) {
    root.querySelectorAll('[data-menu="dropdown"]').forEach((menu) => {
      markSubmenus(menu);

      owner.on(menu, 'click', (event) => {
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

    owner.on(document, 'click', (event) => {
      if (event.target.closest('[data-menu="dropdown"]')) return;
      document.querySelectorAll('[data-menu="dropdown"] > li.is-open').forEach((li) => {
        li.classList.remove('is-open');
        li.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

class AccordionMenu {
  constructor(root, owner) {
    root.querySelectorAll('[data-menu="accordion"]').forEach((menu) => {
      markSubmenus(menu);
      wrapAccordionPanels(menu);

      owner.on(menu, 'click', (event) => {
        const link = event.target.closest('a');
        if (!link || !menu.contains(link)) return;

        const item = link.parentElement;
        if (!item?.classList.contains('has-submenu')) return;

        event.preventDefault();
        const open = item.classList.toggle('is-open');
        item.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }
}

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

function markSubmenus(menu) {
  menu.querySelectorAll('li').forEach((li) => {
    const submenu = li.querySelector(':scope > .menu, :scope > .nested');
    if (!submenu) return;
    li.classList.add('has-submenu');
    if (!li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', 'false');
    submenu.classList.add('nested', 'menu', 'vertical');
  });
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
      ensureBackLink(submenu);
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

    if (document.fonts?.ready) {
      document.fonts.ready.then(this.#remeasureActive);
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
  }

  #hideSubmenu(submenu) {
    if (!submenu) return;

    const parentMenu = submenu.parentElement?.parentElement;
    parentMenu?.classList.remove('invisible');
    submenu.parentElement?.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    submenu.classList.add('is-closing');

    this.#scheduleHeight(parentMenu ?? this.menu);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      submenu.classList.remove('is-active', 'is-closing');
      submenu.classList.add('invisible');
      submenu.removeEventListener('transitionend', onEnd);
    };

    const onEnd = (event) => {
      if (event.target !== submenu) return;
      if (event.propertyName && event.propertyName !== 'transform') return;
      finish();
    };

    submenu.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, 200);
  }

  destroy() {
    this._ro?.disconnect();
  }
}

function ensureBackLink(submenu) {
  if (submenu.querySelector(':scope > .js-drilldown-back')) return;

  const back = document.createElement('li');
  back.className = 'js-drilldown-back';
  back.innerHTML = '<a href="#" tabindex="0">Back</a>';
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
