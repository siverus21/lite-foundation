/**
 * Shared Dart Sass / Vite SCSS options.
 *
 * All partials use `@use`/`@forward` (no `@import` left in scss/) — `import` is
 * not in the silence list, so a stray `@import` will surface as a deprecation warning.
 * `scss/` is on loadPaths so virtual / compileString entries can resolve `core/…`, `settings/vars`, etc.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const sassLoadPaths = [path.join(root, 'scss'), path.join(root, 'node_modules')];

export const sassSilenceDeprecations = ['global-builtin', 'color-functions', 'if-function'];

/** Options for sass.compile() */
export function dartSassCompileOptions(extra = {}) {
  return {
    loadPaths: sassLoadPaths,
    style: 'compressed',
    sourceMap: true,
    sourceMapIncludeSources: true,
    quietDeps: true,
    silenceDeprecations: sassSilenceDeprecations,
    ...extra,
  };
}

/** Vite css.preprocessorOptions.scss */
export const viteScssOptions = {
  loadPaths: sassLoadPaths,
  quietDeps: true,
  silenceDeprecations: sassSilenceDeprecations,
};
