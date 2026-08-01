/**
 * Serve every `/docs/*.html` URL from the single shell `docs/index.html`.
 * The browser pathname stays e.g. `/docs/button.html` so `boot.jsx` can
 * resolve `entries/button.jsx`.
 */

/** @param {{ url?: string }} req */
export function rewriteDocsHtml(req) {
  const url = req.url || '';
  const q = url.indexOf('?');
  const pathname = q === -1 ? url : url.slice(0, q);
  const search = q === -1 ? '' : url.slice(q);

  if (!pathname.startsWith('/docs/') || !pathname.endsWith('.html')) return;
  if (pathname === '/docs/index.html') return;

  req.url = `/docs/index.html${search}`;
}

export function docsShellPlugin() {
  return {
    name: 'lf-docs-shell',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteDocsHtml(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteDocsHtml(req);
        next();
      });
    },
  };
}
