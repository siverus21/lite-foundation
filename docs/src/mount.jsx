import { render } from 'preact';
import { DocsPage } from './components/DocsPage.jsx';

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

  await import(`/js/load-build.js?build=${build}`);
  for (const extra of extraBuilds) {
    await import(`/js/load-build.js?build=${extra}`);
  }
  await onReady?.();
}
