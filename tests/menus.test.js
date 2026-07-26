import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Menus } from '../js/modules/menus.js';

describe('Menus', () => {
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
      <ul class="vertical menu accordion-menu" data-menu="accordion">
        <li>
          <a href="#">Acc parent</a>
          <ul class="menu vertical nested">
            <li><a href="#">Acc child</a></li>
          </ul>
        </li>
      </ul>
      <ul class="vertical menu drilldown" data-menu="drilldown" id="drill">
        <li>
          <a href="#">Drill parent</a>
          <ul class="menu vertical nested">
            <li><a href="#">Drill child</a></li>
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
    const menus = new Menus(document);
    const parent = document.querySelector('[data-menu="dropdown"] li:nth-child(2)');
    expect(parent.classList.contains('has-submenu')).toBe(true);

    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(true);
    expect(parent.getAttribute('aria-expanded')).toBe('true');

    document.getElementById('outside').click();
    expect(parent.classList.contains('is-open')).toBe(false);
    menus.destroy();
  });

  it('toggles accordion menu and wraps nested list in submenu-panel', () => {
    const menus = new Menus(document);
    const parent = document.querySelector('[data-menu="accordion"] li.has-submenu');
    expect(parent.querySelector(':scope > .submenu-panel')).toBeTruthy();

    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(true);
    parent.querySelector(':scope > a').click();
    expect(parent.classList.contains('is-open')).toBe(false);
    menus.destroy();
  });

  it('wraps drilldown in is-drilldown and adds back link', () => {
    const menus = new Menus(document);
    const menu = document.getElementById('drill');
    expect(menu.parentElement.classList.contains('is-drilldown')).toBe(true);
    expect(menu.querySelector('.js-drilldown-back')).toBeTruthy();
    expect(menu.querySelector('.is-drilldown-submenu')).toBeTruthy();
    menus.destroy();
  });

  it('opens drilldown submenu on parent click', () => {
    const menus = new Menus(document);
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
