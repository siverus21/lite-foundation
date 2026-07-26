import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('boot', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('calls initModules when document is already ready (prod path)', async () => {
    vi.stubEnv('DEV', false);
    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
  });

  it('keeps dist stylesheet enabled while loading Sass HMR in DEV', async () => {
    vi.stubEnv('DEV', true);

    const link = document.createElement('link');
    link.setAttribute('href', 'dist/app.css');
    document.head.appendChild(link);

    const initModules = vi.fn();
    const loadDevScss = vi.fn(async () => {});
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css', loadDevScss });
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(loadDevScss).toHaveBeenCalledTimes(1));
    expect(Boolean(link.disabled)).toBe(false);
  });

  it('logs a warning (but still inits modules) when loadDevScss rejects', async () => {
    vi.stubEnv('DEV', true);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const initModules = vi.fn();
    const failure = new Error('boom');
    const loadDevScss = vi.fn(async () => {
      throw failure;
    });
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css', loadDevScss });
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith('[lite-foundation] dev Sass HMR failed', failure),
    );
  });

  it('waits for DOMContentLoaded before calling initModules when the document is still loading', async () => {
    vi.stubEnv('DEV', false);
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });

    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(initModules).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));

    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
  });

  it('resolves immediately when the matching stylesheet already has a sheet', async () => {
    vi.stubEnv('DEV', false);
    const link = document.createElement('link');
    link.setAttribute('href', 'dist/app.css');
    Object.defineProperty(link, 'sheet', { value: {}, configurable: true });
    document.head.appendChild(link);

    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
  });

  it('resolves once the matching stylesheet fires a load event', async () => {
    vi.stubEnv('DEV', false);
    const link = document.createElement('link');
    link.setAttribute('href', 'dist/app.css');
    document.head.appendChild(link);

    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(initModules).not.toHaveBeenCalled();

    link.dispatchEvent(new Event('load'));
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
  });

  it('resolves once the matching stylesheet fires an error event (bad CSS shouldn\'t block boot)', async () => {
    vi.stubEnv('DEV', false);
    const link = document.createElement('link');
    link.setAttribute('href', 'dist/app.css');
    document.head.appendChild(link);

    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    link.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(initModules).toHaveBeenCalledTimes(1));
  });

  it('falls back to a 2s timeout when the stylesheet never loads or errors', async () => {
    vi.stubEnv('DEV', false);
    vi.useFakeTimers();

    const link = document.createElement('link');
    link.setAttribute('href', 'dist/app.css');
    document.head.appendChild(link);

    const initModules = vi.fn();
    const { boot } = await import('../js/boot.js');

    boot({ initModules, cssHrefEndsWith: 'app.css' });
    await vi.advanceTimersByTimeAsync(2000);
    expect(initModules).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
