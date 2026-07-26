import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MenuDropdown } from '../js/modules/menu-dropdown.js';
import { MenuAccordion } from '../js/modules/menu-accordion.js';
import { MenuDrilldown } from '../js/modules/menu-drilldown.js';
import { Dropdown } from '../js/modules/dropdown.js';

describe('MenuDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="dropdown menu" data-menu="dropdown">
        <li><a href="#">One</a></li>
        <li>
          <a href="#">Parent</a>
          <ul class="menu">
            <li><a href="#">Child</a></li>
          </ul>
        </li>
      </ul>
      <button type="button" id="outside">Outside</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('marks submenu parents and toggles dropdown menu', () => {
    const menus = new MenuDropdown(document);
    const parent = document.querySelector('[data-menu="dropdown"] li:nth-child(2)');
    expect(parent.classList.contains('has-submenu')).toBe(true);

    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(true);
    expect(parent.getAttribute('aria-expanded')).toBe('true');

    document.getElementById('outside').click();
    expect(parent.classList.contains('is-open')).toBe(false);
    menus.destroy();
  });

  it('skips document listeners when no dropdown menus', () => {
    document.body.innerHTML = '<p>empty</p>';
    const menus = new MenuDropdown(document);
    expect(menus._menus?.length ?? 0).toBe(0);
    menus.destroy();
  });

  it('closes on Escape', () => {
    const menus = new MenuDropdown(document);
    const parent = document.querySelector('[data-menu="dropdown"] li:nth-child(2)');

    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(parent.classList.contains('is-open')).toBe(false);
    expect(parent.getAttribute('aria-expanded')).toBe('false');

    menus.destroy();
  });
});

describe('MenuAccordion', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="vertical menu accordion-menu" data-menu="accordion">
        <li>
          <a href="#">Acc parent</a>
          <ul class="menu vertical nested">
            <li><a href="#">Acc child</a></li>
          </ul>
        </li>
      </ul>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('toggles accordion menu and wraps nested list in submenu-panel', () => {
    const menus = new MenuAccordion(document);
    const parent = document.querySelector('[data-menu="accordion"] li.has-submenu');
    expect(parent.querySelector(':scope > .submenu-panel')).toBeTruthy();

    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(true);
    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(false);
    menus.destroy();
  });
});

describe('MenuDrilldown', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="vertical menu drilldown" data-menu="drilldown" id="drill">
        <li>
          <a href="#">Drill parent</a>
          <ul class="menu vertical nested">
            <li><a href="#">Drill child</a></li>
          </ul>
        </li>
      </ul>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('wraps drilldown in is-drilldown and adds back link', () => {
    const menus = new MenuDrilldown(document);
    const menu = document.getElementById('drill');
    expect(menu.parentElement.classList.contains('is-drilldown')).toBe(true);
    expect(menu.querySelector('.js-drilldown-back')).toBeTruthy();
    expect(menu.querySelector('.is-drilldown-submenu')).toBeTruthy();
    menus.destroy();
  });

  it('opens drilldown submenu on parent click', () => {
    const menus = new MenuDrilldown(document);
    const menu = document.getElementById('drill');
    const parent = menu.querySelector('li.has-submenu');
    const submenu = parent.querySelector('.is-drilldown-submenu');

    parent.querySelector(':scope > a').click();
    expect(submenu.classList.contains('is-active')).toBe(true);
    expect(submenu.getAttribute('aria-hidden')).toBe('false');
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    menus.destroy();
  });
});

describe('Dropdown early-return', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing when no dropdown markup', () => {
    document.body.innerHTML = '<p>no panes</p>';
    const dropdown = new Dropdown(document);
    expect(dropdown._lastFocus).toBeNull();
    dropdown.destroy();
  });
});
