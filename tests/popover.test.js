import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Popover, popoverSupport } from '../js/modules/popover.js';
import { resetGlobalEvents } from '../js/core/global-events.js';

/**
 * happy-dom reflects the `popover` attribute but implements neither
 * showPopover() nor the top layer, so these tests exercise the fallback tier —
 * the one that actually contains logic. In a browser with native support the
 * module only forwards `toggle` events.
 */
function mount(panelClass = '') {
  document.body.innerHTML = `
    <button id="trigger" popovertarget="panel">Открыть</button>
    <div id="panel" class="popover ${panelClass}" popover data-popover>
      <p>Содержимое</p>
    </div>
  `;
  return {
    trigger: document.getElementById('trigger'),
    panel: document.getElementById('panel'),
  };
}

describe('Popover (fallback tier)', () => {
  let popover;

  beforeEach(() => {
    resetGlobalEvents();
  });

  afterEach(() => {
    popover?.destroy();
    popover = null;
    resetGlobalEvents();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('reports what the environment supports', () => {
    const support = popoverSupport();
    expect(support).toHaveProperty('native');
    expect(support).toHaveProperty('anchor');
  });

  it('marks the panel as JS-managed and wires aria-expanded', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);

    expect(panel.hasAttribute('data-popover-fallback')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking the trigger opens the panel and fires shown.lf.popover', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);
    const shown = [];
    panel.addEventListener('shown.lf.popover', () => shown.push(true));

    trigger.click();

    expect(panel.classList.contains('is-open')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(shown.length).toBe(1);
  });

  it('a second click closes it again', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);
    const hidden = [];
    panel.addEventListener('hidden.lf.popover', () => hidden.push(true));

    trigger.click();
    trigger.click();

    expect(panel.classList.contains('is-open')).toBe(false);
    expect(hidden.length).toBe(1);
  });

  it('closes on an outside click', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);
    trigger.click();

    document.body.click();

    expect(panel.classList.contains('is-open')).toBe(false);
  });

  it('stays open when the click is inside the panel', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);
    trigger.click();

    panel.querySelector('p').click();

    expect(panel.classList.contains('is-open')).toBe(true);
  });

  it('closes on Escape through the shared dispatcher', () => {
    const { trigger, panel } = mount();
    popover = new Popover(document);
    trigger.click();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(panel.classList.contains('is-open')).toBe(false);
  });

  it('accepts lf:popover:show / hide / toggle commands', () => {
    const { panel } = mount();
    popover = new Popover(document);

    panel.dispatchEvent(new CustomEvent('lf:popover:show'));
    expect(panel.classList.contains('is-open')).toBe(true);

    panel.dispatchEvent(new CustomEvent('lf:popover:hide'));
    expect(panel.classList.contains('is-open')).toBe(false);

    panel.dispatchEvent(new CustomEvent('lf:popover:toggle'));
    expect(panel.classList.contains('is-open')).toBe(true);
  });

  it('positions the panel with inline styles when anchor positioning is missing', () => {
    vi.spyOn(CSS, 'supports').mockImplementation(() => false);
    const { trigger, panel } = mount();
    popover = new Popover(document);

    trigger.click();

    expect(panel.hasAttribute('data-popover-placed')).toBe(true);
    expect(panel.style.top).toMatch(/px$/);
    expect(panel.style.left).toMatch(/px$/);
  });

  it('places a .top panel above the trigger in the fallback path', () => {
    vi.spyOn(CSS, 'supports').mockImplementation(() => false);
    const { trigger, panel } = mount('top');

    // Fake geometry so the placement math has something to work with.
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 230,
      left: 40,
      right: 120,
      width: 80,
      height: 30,
    });
    popover = new Popover(document);
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 80,
      left: 0,
      right: 160,
      width: 160,
      height: 80,
    });

    trigger.click();

    // top ≈ 200 - 80 - 6 = 114
    expect(Number.parseFloat(panel.style.top)).toBeLessThan(200);
    expect(panel.hasAttribute('data-popover-placed')).toBe(true);
  });

  it('generates an id for a panel that has none', () => {
    document.body.innerHTML = '<div class="popover" popover data-popover>x</div>';
    popover = new Popover(document);

    expect(document.querySelector('[data-popover]').id).toMatch(/^lf-popover-/);
  });

  it('only one panel stays open at a time', () => {
    document.body.innerHTML = `
      <button id="t1" popovertarget="p1">1</button>
      <div id="p1" class="popover" popover data-popover>one</div>
      <button id="t2" popovertarget="p2">2</button>
      <div id="p2" class="popover" popover data-popover>two</div>
    `;
    popover = new Popover(document);

    document.getElementById('t1').click();
    document.getElementById('t2').click();

    expect(document.getElementById('p1').classList.contains('is-open')).toBe(false);
    expect(document.getElementById('p2').classList.contains('is-open')).toBe(true);
  });
});
