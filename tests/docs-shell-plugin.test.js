import { describe, it, expect } from 'vitest';
import { rewriteDocsHtml } from '../scripts/docs-shell-plugin.js';

describe('docsShellPlugin rewriteDocsHtml', () => {
  it('rewrites component docs URLs to the single shell', () => {
    const req = { url: '/docs/button.html' };
    rewriteDocsHtml(req);
    expect(req.url).toBe('/docs/index.html');
  });

  it('preserves query string', () => {
    const req = { url: '/docs/lifecycle.html?x=1' };
    rewriteDocsHtml(req);
    expect(req.url).toBe('/docs/index.html?x=1');
  });

  it('leaves the shell itself alone', () => {
    const req = { url: '/docs/index.html' };
    rewriteDocsHtml(req);
    expect(req.url).toBe('/docs/index.html');
  });

  it('ignores non-docs and non-html', () => {
    const a = { url: '/index.html' };
    const b = { url: '/docs/assets/docs.css' };
    rewriteDocsHtml(a);
    rewriteDocsHtml(b);
    expect(a.url).toBe('/index.html');
    expect(b.url).toBe('/docs/assets/docs.css');
  });
});
