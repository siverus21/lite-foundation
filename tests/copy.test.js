import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Copy } from '../js/modules/copy.js';

/** navigator.clipboard needs a secure context; both are stubbed here. */
function stubClipboard(impl) {
  const writeText = impl || vi.fn(async () => {});
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
    writable: true,
  });
  return writeText;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Copy', () => {
  let copy;

  beforeEach(() => {
    stubClipboard();
  });

  afterEach(() => {
    copy?.destroy();
    copy = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('copies a literal string from data-copy-text', async () => {
    const writeText = stubClipboard();
    document.body.innerHTML = '<button data-copy-text="npm i lite-foundation">Копировать</button>';
    copy = new Copy(document);
    const button = document.querySelector('button');
    const events = [];
    button.addEventListener('copied.lf.copy', (event) => events.push(event.detail));

    button.click();
    await flush();

    expect(writeText).toHaveBeenCalledWith('npm i lite-foundation');
    expect(events[0]).toEqual({ text: 'npm i lite-foundation' });
  });

  it('copies the text content of a selector target', async () => {
    const writeText = stubClipboard();
    document.body.innerHTML = `
      <pre id="snippet">  npm run build  </pre>
      <button data-copy="#snippet">Копировать</button>
    `;
    copy = new Copy(document);

    document.querySelector('button').click();
    await flush();

    expect(writeText).toHaveBeenCalledWith('npm run build');
  });

  it('copies the value of an input target', async () => {
    const writeText = stubClipboard();
    document.body.innerHTML = `
      <input id="token" value="abc-123">
      <button data-copy="#token">Копировать</button>
    `;
    copy = new Copy(document);

    document.querySelector('button').click();
    await flush();

    expect(writeText).toHaveBeenCalledWith('abc-123');
  });

  it('swaps the label and restores it after the timeout', async () => {
    vi.useFakeTimers();
    stubClipboard();
    document.body.innerHTML =
      '<button data-copy-text="x" data-copy-label="Готово" data-copy-timeout="1000">Копировать</button>';
    copy = new Copy(document);
    const button = document.querySelector('button');

    button.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(button.textContent).toBe('Готово');
    expect(button.classList.contains('is-copied')).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    expect(button.textContent).toBe('Копировать');
    expect(button.classList.contains('is-copied')).toBe(false);
    vi.useRealTimers();
  });

  it('renders a .copy-status message when asked instead of touching the label', async () => {
    stubClipboard();
    document.body.innerHTML = '<button data-copy-text="x" data-copy-status>Копировать</button>';
    copy = new Copy(document);
    const button = document.querySelector('button');

    button.click();
    await flush();

    const status = document.querySelector('.copy-status');
    expect(button.textContent).toBe('Копировать');
    expect(status.textContent).toBe('Скопировано');
    expect(status.classList.contains('is-visible')).toBe(true);
    expect(status.getAttribute('role')).toBe('status');
  });

  it('reports a failure instead of throwing', async () => {
    stubClipboard(
      vi.fn(async () => {
        throw new Error('denied');
      }),
    );
    document.body.innerHTML = '<button data-copy-text="x" data-copy-status>Копировать</button>';
    copy = new Copy(document);
    const button = document.querySelector('button');
    const failures = [];
    button.addEventListener('failed.lf.copy', (event) => failures.push(event.detail));

    button.click();
    await flush();

    expect(failures.length).toBe(1);
    expect(document.querySelector('.copy-status').classList.contains('is-error')).toBe(true);
  });

  it('ignores a data-copy selector that matches nothing', async () => {
    const writeText = stubClipboard();
    document.body.innerHTML = '<button data-copy="#missing">Копировать</button>';
    copy = new Copy(document);

    document.querySelector('button').click();
    await flush();

    expect(writeText).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when the clipboard API is unavailable', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    // happy-dom may not expose execCommand — install the stub the module calls.
    const exec = vi.fn(() => true);
    document.execCommand = exec;

    document.body.innerHTML = '<button data-copy-text="fallback-text">Копировать</button>';
    copy = new Copy(document);
    const events = [];
    document.querySelector('button').addEventListener('copied.lf.copy', (event) => {
      events.push(event.detail.text);
    });

    document.querySelector('button').click();
    await flush();

    expect(exec).toHaveBeenCalledWith('copy');
    expect(events).toEqual(['fallback-text']);
  });
});
