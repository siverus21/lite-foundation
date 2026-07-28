import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Quantity } from '../js/modules/quantity.js';

function mount(attrs = '', inner = '<input type="number" value="1">') {
  document.body.innerHTML = `<div class="quantity" data-quantity ${attrs}>${inner}</div>`;
  return document.querySelector('[data-quantity]');
}

describe('Quantity', () => {
  let quantity;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    quantity?.destroy();
    quantity = null;
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('builds − / + buttons around an existing input', () => {
    const el = mount();
    quantity = new Quantity(document);

    expect(el.querySelector('[data-quantity-decrease]')).toBeTruthy();
    expect(el.querySelector('[data-quantity-increase]')).toBeTruthy();
    expect(el.querySelector('input').classList.contains('quantity-input')).toBe(true);
    // Decrease button order: before the field.
    expect(el.firstElementChild.hasAttribute('data-quantity-decrease')).toBe(true);
  });

  it('generates the input when only the root is present', () => {
    const el = mount('data-quantity-name="qty" data-quantity-value="3"', '');
    quantity = new Quantity(document);

    const input = el.querySelector('input');
    expect(input.name).toBe('qty');
    expect(input.value).toBe('3');
  });

  it('increments and decrements by the step and dispatches changed.lf.quantity', () => {
    const el = mount('data-quantity-step="5"');
    quantity = new Quantity(document);
    const seen = [];
    el.addEventListener('changed.lf.quantity', (event) => seen.push(event.detail));

    el.querySelector('[data-quantity-increase]').click();
    expect(el.querySelector('input').value).toBe('6');
    expect(seen[0]).toMatchObject({ value: 6, previous: 1, reason: 'increase' });

    el.querySelector('[data-quantity-decrease]').click();
    expect(el.querySelector('input').value).toBe('1');
    expect(seen[1].reason).toBe('decrease');
  });

  it('clamps to min/max and disables the button at the bound', () => {
    const el = mount('data-quantity-min="1" data-quantity-max="2"');
    quantity = new Quantity(document);
    const decrease = el.querySelector('[data-quantity-decrease]');
    const increase = el.querySelector('[data-quantity-increase]');

    expect(decrease.disabled).toBe(true);

    increase.click();
    expect(el.querySelector('input').value).toBe('2');
    expect(increase.disabled).toBe(true);

    increase.click();
    expect(el.querySelector('input').value).toBe('2');
  });

  it('wraps from max to min with data-quantity-wrap', () => {
    const el = mount('data-quantity-min="1" data-quantity-max="3" data-quantity-wrap');
    quantity = new Quantity(document);
    quantity.set(el, 3);

    el.querySelector('[data-quantity-increase]').click();
    expect(el.querySelector('input').value).toBe('1');
  });

  it('keeps float steps free of binary rounding noise', () => {
    const el = mount('data-quantity-step="0.1"', '<input type="number" value="0.2">');
    quantity = new Quantity(document);

    el.querySelector('[data-quantity-increase]').click();
    expect(el.querySelector('input').value).toBe('0.3');
  });

  it('debounces committed.lf.quantity into one event per burst', () => {
    const el = mount('data-quantity-debounce="300"');
    quantity = new Quantity(document);
    const changed = [];
    const commits = [];
    el.addEventListener('changed.lf.quantity', (event) => changed.push(event.detail.value));
    el.addEventListener('committed.lf.quantity', (event) => commits.push(event.detail.value));

    const increase = el.querySelector('[data-quantity-increase]');
    increase.click();
    increase.click();
    increase.click();

    expect(changed).toEqual([2, 3, 4]);
    expect(commits).toEqual([]);

    vi.advanceTimersByTime(300);
    expect(commits).toEqual([4]);
  });

  it('accepts command events for set / increase / decrease', () => {
    const el = mount();
    quantity = new Quantity(document);

    el.dispatchEvent(new CustomEvent('lf:quantity:set', { detail: { value: 10 } }));
    expect(quantity.value(el)).toBe(10);

    el.dispatchEvent(new CustomEvent('lf:quantity:increase', { detail: { by: 5 } }));
    expect(quantity.value(el)).toBe(15);

    el.dispatchEvent(new CustomEvent('lf:quantity:decrease', {}));
    expect(quantity.value(el)).toBe(14);
  });

  it('lf:quantity:limits re-clamps the value when stock drops', () => {
    const el = mount('data-quantity-max="99"');
    quantity = new Quantity(document);
    quantity.set(el, 20);

    el.dispatchEvent(new CustomEvent('lf:quantity:limits', { detail: { max: 5 } }));

    expect(quantity.value(el)).toBe(5);
    expect(el.querySelector('[data-quantity-increase]').disabled).toBe(true);
  });

  it('lf:quantity:busy locks the control', () => {
    const el = mount();
    quantity = new Quantity(document);

    el.dispatchEvent(new CustomEvent('lf:quantity:busy', { detail: { busy: true } }));
    expect(el.hasAttribute('data-busy')).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');

    el.dispatchEvent(new CustomEvent('lf:quantity:busy', { detail: { busy: false } }));
    expect(el.hasAttribute('data-busy')).toBe(false);
  });

  it('hold-to-repeat keeps firing after the delay while the pointer is down', () => {
    const el = mount('data-quantity-hold data-quantity-max="20"');
    quantity = new Quantity(document);
    const increase = el.querySelector('[data-quantity-increase]');

    increase.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    // Hold starts after HOLD_DELAY (400ms); first interval tick is HOLD_INTERVAL (90ms) later.
    expect(quantity.value(el)).toBe(1);

    vi.advanceTimersByTime(400);
    expect(quantity.value(el)).toBe(1);

    vi.advanceTimersByTime(90);
    expect(quantity.value(el)).toBe(2);

    vi.advanceTimersByTime(90 * 3);
    expect(quantity.value(el)).toBe(5);

    increase.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    const stopped = quantity.value(el);
    vi.advanceTimersByTime(500);
    expect(quantity.value(el)).toBe(stopped);
  });

  it('wraps from min to max when decreasing at the lower bound', () => {
    const el = mount('data-quantity-min="1" data-quantity-max="3" data-quantity-wrap');
    quantity = new Quantity(document);
    quantity.set(el, 1);

    el.querySelector('[data-quantity-decrease]').click();
    expect(el.querySelector('input').value).toBe('3');
  });

  it('clamps typed input on change', () => {
    const el = mount('data-quantity-max="10"');
    quantity = new Quantity(document);
    const input = el.querySelector('input');

    input.value = '999';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(input.value).toBe('10');
  });
});
