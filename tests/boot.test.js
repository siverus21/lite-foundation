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
});
