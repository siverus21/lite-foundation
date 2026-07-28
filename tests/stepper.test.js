import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Stepper } from '../js/modules/stepper.js';

function markup(extraAttrs = 'data-clickable') {
  return `
    <div class="stepper-wrap">
      <ol class="stepper" data-stepper ${extraAttrs}>
        <li class="stepper-step is-active" data-stepper-step><span class="stepper-step-marker" data-index="1"></span><span class="stepper-step-label">Cart</span></li>
        <li class="stepper-step" data-stepper-step><span class="stepper-step-marker" data-index="2"></span><span class="stepper-step-label">Shipping</span></li>
        <li class="stepper-step" data-stepper-step><span class="stepper-step-marker" data-index="3"></span><span class="stepper-step-label">Payment</span></li>
      </ol>
      <div class="stepper-actions">
        <button type="button" data-stepper-prev>Prev</button>
        <button type="button" data-stepper-next>Next</button>
      </div>
    </div>
  `;
}

describe('Stepper', () => {
  beforeEach(() => {
    document.body.innerHTML = markup();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets aria-current="step" on the initially active step at mount', () => {
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');
    expect(steps[0].getAttribute('aria-current')).toBe('step');
    expect(steps[1].hasAttribute('aria-current')).toBe(false);
    stepper.destroy();
  });

  it('jumps to a clicked step (data-clickable) and marks earlier steps complete', () => {
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');

    steps[2].click();

    expect(steps[0].classList.contains('is-complete')).toBe(true);
    expect(steps[1].classList.contains('is-complete')).toBe(true);
    expect(steps[2].classList.contains('is-active')).toBe(true);
    expect(steps[2].getAttribute('aria-current')).toBe('step');
    stepper.destroy();
  });

  it('ignores step clicks when data-clickable is absent', () => {
    document.body.innerHTML = markup('');
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');

    steps[2].click();

    expect(steps[0].classList.contains('is-active')).toBe(true);
    expect(steps[2].classList.contains('is-active')).toBe(false);
    stepper.destroy();
  });

  it('[data-stepper-next] advances one step and [data-stepper-prev] goes back', () => {
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');

    document.querySelector('[data-stepper-next]').click();
    expect(steps[0].classList.contains('is-complete')).toBe(true);
    expect(steps[1].classList.contains('is-active')).toBe(true);

    document.querySelector('[data-stepper-prev]').click();
    expect(steps[0].classList.contains('is-active')).toBe(true);
    expect(steps[1].classList.contains('is-complete')).toBe(false);

    stepper.destroy();
  });

  it('does not advance past the last step', () => {
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');
    const next = document.querySelector('[data-stepper-next]');

    next.click();
    next.click();
    next.click();
    next.click();

    expect(steps[2].classList.contains('is-active')).toBe(true);
    stepper.destroy();
  });

  it('does not go before the first step', () => {
    const stepper = new Stepper(document);
    const steps = document.querySelectorAll('[data-stepper-step]');
    document.querySelector('[data-stepper-prev]').click();

    expect(steps[0].classList.contains('is-active')).toBe(true);
    stepper.destroy();
  });

  it('jumps to an absolute step via the lf:stepper:goto command event', () => {
    const stepper = new Stepper(document);
    const stepperEl = document.querySelector('[data-stepper]');
    const steps = document.querySelectorAll('[data-stepper-step]');

    stepperEl.dispatchEvent(new CustomEvent('lf:stepper:goto', { detail: { index: 2 } }));

    expect(steps[0].classList.contains('is-complete')).toBe(true);
    expect(steps[1].classList.contains('is-complete')).toBe(true);
    expect(steps[2].classList.contains('is-active')).toBe(true);
    stepper.destroy();
  });

  it('advances/retreats via lf:stepper:next / lf:stepper:prev command events', () => {
    const stepper = new Stepper(document);
    const stepperEl = document.querySelector('[data-stepper]');
    const steps = document.querySelectorAll('[data-stepper-step]');

    stepperEl.dispatchEvent(new CustomEvent('lf:stepper:next'));
    expect(steps[1].classList.contains('is-active')).toBe(true);

    stepperEl.dispatchEvent(new CustomEvent('lf:stepper:prev'));
    expect(steps[0].classList.contains('is-active')).toBe(true);
    stepper.destroy();
  });

  it('ignores lf:stepper:goto with a non-numeric or missing index', () => {
    const stepper = new Stepper(document);
    const stepperEl = document.querySelector('[data-stepper]');
    const steps = document.querySelectorAll('[data-stepper-step]');

    stepperEl.dispatchEvent(new CustomEvent('lf:stepper:goto', { detail: { index: 'two' } }));
    stepperEl.dispatchEvent(new CustomEvent('lf:stepper:goto'));

    expect(steps[0].classList.contains('is-active')).toBe(true);
    stepper.destroy();
  });

  it('dispatches changed.lf.stepper with the new index', () => {
    const stepper = new Stepper(document);
    const stepperEl = document.querySelector('[data-stepper]');
    const spy = [];
    stepperEl.addEventListener('changed.lf.stepper', (event) => spy.push(event.detail.index));

    document.querySelector('[data-stepper-next]').click();
    expect(spy).toEqual([1]);

    stepper.destroy();
  });
});
