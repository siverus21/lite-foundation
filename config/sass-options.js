/**
 * Shared Dart Sass / Vite SCSS options.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const sassLoadPaths = [path.join(root, 'node_modules')];

export const sassSilenceDeprecations = [
  'import',
  'global-builtin',
  'color-functions',
  'if-function',
];

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
