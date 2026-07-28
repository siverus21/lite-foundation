import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dismiss } from '../js/modules/dismiss.js';

describe('Dismiss', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="callout" data-closable>
        <button type="button" data-close aria-label="Close">×</button>
        <p>Hello</p>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('removes closable parent on data-close click', () => {
    const dismiss = new Dismiss(document);
    expect(document.querySelector('.callout')).toBeTruthy();
    document.querySelector('[data-close]').click();
    expect(document.querySelector('.callout')).toBeNull();
    dismiss.destroy();
  });

  it('dispatches a cancelable close.lf.dismiss with the trigger before removing', () => {
    const dismiss = new Dismiss(document);
    const target = document.querySelector('.callout');
    const trigger = document.querySelector('[data-close]');
    let received = null;
    target.addEventListener('close.lf.dismiss', (event) => {
      received = event.detail.trigger;
    });

    trigger.click();

    expect(received).toBe(trigger);
    dismiss.destroy();
  });

  it('reports closed.lf.dismiss on the parent once the element is gone', () => {
    const dismiss = new Dismiss(document);
    const target = document.querySelector('.callout');
    let detail = null;
    document.body.addEventListener('closed.lf.dismiss', (event) => {
      detail = event.detail;
    });

    document.querySelector('[data-close]').click();

    expect(detail.target).toBe(target);
    expect(target.isConnected).toBe(false);
    dismiss.destroy();
  });

  it('keeps the element when a listener calls event.preventDefault()', () => {
    const dismiss = new Dismiss(document);
    const target = document.querySelector('.callout');
    target.addEventListener('close.lf.dismiss', (event) => event.preventDefault());

    document.querySelector('[data-close]').click();

    expect(document.querySelector('.callout')).toBeTruthy();
    dismiss.destroy();
  });
});
