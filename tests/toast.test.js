import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Toast } from '../js/modules/toast.js';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('creates a single stack, reused across toasts', async () => {
    const toast = new Toast(document);
    toast.show({ message: 'first' });
    toast.show({ message: 'second' });

    expect(document.querySelectorAll('.toast-stack').length).toBe(1);
    expect(document.querySelectorAll('.toast').length).toBe(2);

    toast.destroy();
  });

  it('shows title, message and variant class from lf:toast:show event detail', async () => {
    const toast = new Toast(document);
    document.dispatchEvent(
      new CustomEvent('lf:toast:show', {
        detail: { title: 'Saved', message: 'All good', variant: 'success' },
      }),
    );

    const toastEl = document.querySelector('.toast');
    expect(toastEl).not.toBeNull();
    expect(toastEl.classList.contains('success')).toBe(true);
    expect(toastEl.querySelector('.toast-title').textContent).toBe('Saved');
    expect(toastEl.querySelector('.toast-message').textContent).toBe('All good');

    await vi.advanceTimersByTimeAsync(16);
    expect(toastEl.classList.contains('is-visible')).toBe(true);

    toast.destroy();
  });

  it('shows a toast from a declarative [data-toast-trigger] click', () => {
    document.body.innerHTML = `
      <button type="button" data-toast-trigger data-toast-variant="warning" data-toast-title="Heads up">Notify</button>
    `;
    const toast = new Toast(document);
    document.querySelector('[data-toast-trigger]').click();

    const toastEl = document.querySelector('.toast');
    expect(toastEl.classList.contains('warning')).toBe(true);
    expect(toastEl.querySelector('.toast-title').textContent).toBe('Heads up');

    toast.destroy();
  });

  it('auto-dismisses after the default duration', async () => {
    const toast = new Toast(document);
    toast.show({ message: 'bye' });
    expect(document.querySelectorAll('.toast').length).toBe(1);

    await vi.advanceTimersByTimeAsync(4000 + 350);
    expect(document.querySelectorAll('.toast').length).toBe(0);

    toast.destroy();
  });

  it('does not auto-dismiss when duration is 0 (sticky)', async () => {
    const toast = new Toast(document);
    toast.show({ message: 'sticky', duration: 0 });

    await vi.advanceTimersByTimeAsync(10000);
    expect(document.querySelectorAll('.toast').length).toBe(1);

    toast.destroy();
  });

  it('closes on [data-close] click inside the toast', async () => {
    const toast = new Toast(document);
    toast.show({ message: 'closable' });
    const closeBtn = document.querySelector('.toast [data-close]');

    closeBtn.click();
    await vi.advanceTimersByTimeAsync(350);
    expect(document.querySelectorAll('.toast').length).toBe(0);

    toast.destroy();
  });

  it('renders an action button and calls onClick, then dismisses by default', async () => {
    const toast = new Toast(document);
    const onClick = vi.fn();
    toast.show({ message: 'Товар добавлен', action: { label: 'Открыть корзину', onClick } });

    const actionBtn = document.querySelector('.toast-action');
    expect(actionBtn).not.toBeNull();
    expect(actionBtn.textContent).toBe('Открыть корзину');

    actionBtn.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(350);
    expect(document.querySelectorAll('.toast').length).toBe(0);

    toast.destroy();
  });

  it('keeps the toast open when action.dismissOnClick is false', async () => {
    const toast = new Toast(document);
    const onClick = vi.fn();
    toast.show({ message: 'x', action: { label: 'Retry', onClick, dismissOnClick: false } });

    document.querySelector('.toast-action').click();
    expect(onClick).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(350);
    expect(document.querySelectorAll('.toast').length).toBe(1);

    toast.destroy();
  });

  it('caps the stack: a burst of sticky toasts pushes the oldest out instead of piling up', async () => {
    const toast = new Toast(document);
    for (let i = 1; i <= 9; i += 1) toast.show({ message: `sticky ${i}`, duration: 0 });

    await vi.advanceTimersByTimeAsync(350);

    const left = [...document.querySelectorAll('.toast')];
    expect(left.length).toBe(5);
    expect(left.map((el) => el.querySelector('.toast-message').textContent)).toEqual([
      'sticky 5',
      'sticky 6',
      'sticky 7',
      'sticky 8',
      'sticky 9',
    ]);

    toast.destroy();
  });

  it('falls back to the default duration when data-toast-duration is not a number', async () => {
    document.body.innerHTML = `
      <button type="button" data-toast-trigger data-toast-duration="4s">Notify</button>
    `;
    const toast = new Toast(document);
    document.querySelector('[data-toast-trigger]').click();
    expect(document.querySelectorAll('.toast').length).toBe(1);

    await vi.advanceTimersByTimeAsync(4000 + 350);
    expect(document.querySelectorAll('.toast').length).toBe(0);

    toast.destroy();
  });

  it('ignores a repeated dismiss of the same toast', async () => {
    const toast = new Toast(document);
    const toastEl = toast.show({ message: 'once' });

    toast.dismiss(toastEl);
    toast.dismiss(toastEl);

    await vi.advanceTimersByTimeAsync(350);
    expect(document.querySelectorAll('.toast').length).toBe(0);

    toast.destroy();
  });

  it('clears pending timers on destroy so a dismissed toast never gets force-removed twice', async () => {
    const toast = new Toast(document);
    const toastEl = toast.show({ message: 'x' });
    toast.destroy();

    // no timers left registered by Toast itself; advancing shouldn't throw
    await vi.advanceTimersByTimeAsync(10000);
    expect(toastEl.isConnected).toBe(true);
  });
});
