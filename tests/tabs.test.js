import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tabs } from '../js/modules/tabs.js';

describe('Tabs', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="tabs" data-tabs id="t1" role="tablist">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" id="tab-a" aria-controls="panel-a" aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" id="tab-b" aria-controls="panel-b" aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content" data-tabs-content="t1">
        <div class="tabs-panel is-active" id="panel-a" role="tabpanel">A</div>
        <div class="tabs-panel" id="panel-b" role="tabpanel" hidden>B</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function keydown(el, key) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('activates panel on tab click', () => {
    const tabs = new Tabs(document);
    document.getElementById('tab-b').click();

    expect(document.getElementById('tab-b').getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('panel-b').classList.contains('is-active')).toBe(true);
    expect(document.getElementById('panel-a').hasAttribute('hidden')).toBe(true);

    tabs.destroy();
  });

  it('sets aria-orientation and uses ArrowUp/Down when vertical', () => {
    document.body.innerHTML = `
      <ul class="tabs vertical" data-tabs id="tv" role="tablist">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" id="tab-a" aria-controls="panel-a" aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" id="tab-b" aria-controls="panel-b" aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content" data-tabs-content="tv">
        <div class="tabs-panel is-active" id="panel-a" role="tabpanel">A</div>
        <div class="tabs-panel" id="panel-b" role="tabpanel" hidden>B</div>
      </div>
    `;
    const tabs = new Tabs(document);
    const tablist = document.getElementById('tv');
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical');

    const tabA = document.getElementById('tab-a');
    const tabB = document.getElementById('tab-b');
    keydown(tabA, 'ArrowDown');
    expect(document.activeElement).toBe(tabB);
    expect(tabB.getAttribute('aria-selected')).toBe('true');

    keydown(tabB, 'ArrowRight');
    expect(document.activeElement).toBe(tabB);

    tabs.destroy();
  });

  it('ArrowRight moves focus + activation to the next tab, wrapping around', () => {
    const tabs = new Tabs(document);
    const tabA = document.getElementById('tab-a');
    const tabB = document.getElementById('tab-b');

    keydown(tabA, 'ArrowRight');
    expect(document.activeElement).toBe(tabB);
    expect(tabB.getAttribute('aria-selected')).toBe('true');

    keydown(tabB, 'ArrowRight');
    expect(document.activeElement).toBe(tabA);
    expect(tabA.getAttribute('aria-selected')).toBe('true');

    tabs.destroy();
  });

  it('ArrowLeft moves focus + activation to the previous tab, wrapping around', () => {
    const tabs = new Tabs(document);
    const tabA = document.getElementById('tab-a');
    const tabB = document.getElementById('tab-b');

    keydown(tabA, 'ArrowLeft');
    expect(document.activeElement).toBe(tabB);
    expect(tabB.getAttribute('aria-selected')).toBe('true');

    tabs.destroy();
  });

  it('Home/End jump to the first/last tab', () => {
    const tabs = new Tabs(document);
    const tabA = document.getElementById('tab-a');
    const tabB = document.getElementById('tab-b');

    keydown(tabA, 'End');
    expect(document.activeElement).toBe(tabB);
    expect(tabB.getAttribute('aria-selected')).toBe('true');

    keydown(tabB, 'Home');
    expect(document.activeElement).toBe(tabA);
    expect(tabA.getAttribute('aria-selected')).toBe('true');

    tabs.destroy();
  });

  it('ignores unrelated keys', () => {
    const tabs = new Tabs(document);
    const tabA = document.getElementById('tab-a');

    keydown(tabA, 'a');
    expect(tabA.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('tab-b').getAttribute('aria-selected')).toBe('false');

    tabs.destroy();
  });

  it('ignores groups without a matching tabs-content root', () => {
    document.body.innerHTML += `<ul data-tabs id="orphan"><li role="tab" aria-controls="none">X</li></ul>`;
    expect(() => {
      const tabs = new Tabs(document);
      tabs.destroy();
    }).not.toThrow();
  });

  it('select() / activeIndex() and lf:tabs commands work', () => {
    const tabs = new Tabs(document);
    const tablist = document.getElementById('t1');
    const changed = [];
    tablist.addEventListener('changed.lf.tabs', (event) => changed.push(event.detail.index));

    expect(tabs.activeIndex(tablist)).toBe(0);
    tabs.select(tablist, 1);
    expect(tabs.activeIndex(tablist)).toBe(1);
    expect(document.getElementById('tab-b').getAttribute('aria-selected')).toBe('true');
    expect(changed).toEqual([1]);

    tablist.dispatchEvent(new CustomEvent('lf:tabs:prev'));
    expect(tabs.activeIndex(tablist)).toBe(0);

    tablist.dispatchEvent(new CustomEvent('lf:tabs:next'));
    expect(tabs.activeIndex(tablist)).toBe(1);

    tablist.dispatchEvent(new CustomEvent('lf:tabs:select', { detail: { id: 'panel-a' } }));
    expect(tabs.activeIndex(tablist)).toBe(0);

    tabs.destroy();
  });

  it('falls back to the next sibling .tabs-content when the tablist has no id', () => {
    document.body.innerHTML = `
      <ul class="tabs" data-tabs role="tablist">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" aria-controls="p1" aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" aria-controls="p2" aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content">
        <div class="tabs-panel is-active" id="p1" role="tabpanel">A</div>
        <div class="tabs-panel" id="p2" role="tabpanel" hidden>B</div>
      </div>
    `;
    const tabs = new Tabs(document);
    document.querySelector('[aria-controls="p2"]').click();
    expect(document.getElementById('p2').classList.contains('is-active')).toBe(true);
    tabs.destroy();
  });
});
