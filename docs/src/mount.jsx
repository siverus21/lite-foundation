import { render } from 'preact';
import { DocsPage } from './components/DocsPage.jsx';

/**
 * Load a named build entry. Same constraint as `js/load-build.js`: each
 * `import()` argument must be a static string so Vite can resolve `virtual:lf-*`.
 * @param {string} name
 */
async function loadBuild(name) {
  switch (name) {
    case 'full':
      await import('virtual:lf-entry/full');
      break;
    case 'about':
      await import('virtual:lf-entry/about');
      break;
    case 'swiper':
      await import('virtual:lf-entry/swiper');
      break;
    default:
      throw new Error(`Unknown build "${name}"`);
  }
}

/**
 * Mount a docs page and load the foundation build for live demos.
 *
 * @param {{
 *   file: string,
 *   title: string,
 *   documentTitle?: string,
 *   kicker?: string,
 *   lead?: preact.ComponentChildren,
 *   flags?: string[],
 *   build?: string,
 *   extraBuilds?: string[],
 *   beforeChrome?: preact.ComponentChildren,
 *   outsideMain?: preact.ComponentChildren,
 *   Page: preact.FunctionComponent,
 *   onReady?: () => void | Promise<void>,
 * }} options
 */
export async function mountDocs({
  file,
  title,
  documentTitle,
  kicker,
  lead,
  flags,
  hero = false,
  build = 'full',
  extraBuilds = [],
  beforeChrome,
  outsideMain,
  Page,
  onReady,
}) {
  const root = document.getElementById('app');
  if (!root) throw new Error('docs mount: #app missing');

  render(
    <DocsPage
      file={file}
      title={title}
      documentTitle={documentTitle}
      kicker={kicker}
      lead={lead}
      flags={flags}
      hero={hero}
      beforeChrome={beforeChrome}
      outsideMain={outsideMain}
    >
      <Page />
    </DocsPage>,
    root,
  );

  await loadBuild(build);
  for (const extra of extraBuilds) {
    await loadBuild(extra);
  }
  await onReady?.();
}
