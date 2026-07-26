/**
 * Production build: named bundles from config/features.js → builds.
 * Page: app.css / lib.js, app-{name}.css / lib-{name}.js
 * Library (kind: 'library'): lib-{name}.css / lib-{name}.js
 */
import path from 'node:path';
import { mkdirSync, rmSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
import * as sass from 'sass';
import {
  syncAllBuilds,
  listBuildNames,
  featuresPlugin,
} from './sync-features.js';
import { buildOutputNames } from '../config/features.js';
import { lintTokens } from './lint-tokens.js';

const root = path.resolve('.');
const distDir = path.join(root, 'dist');
const loadPaths = [path.join(root, 'node_modules')];

const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function formatKb(bytes) {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

function compileCss(buildName) {
  const { css, cssMap } = buildOutputNames(buildName);
  const entry =
    buildName === 'full'
      ? path.join(root, 'scss/app.scss')
      : path.join(root, `scss/builds/${buildName}/app.scss`);

  const result = sass.compile(entry, {
    loadPaths,
    style: 'compressed',
    sourceMap: true,
    sourceMapIncludeSources: true,
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
  });

  writeFileSync(path.join(distDir, css), `${result.css}\n/*# sourceMappingURL=${cssMap} */\n`);
  writeFileSync(path.join(distDir, cssMap), JSON.stringify(result.sourceMap));
}

async function buildJs(buildName, { emptyOutDir }) {
  const { js } = buildOutputNames(buildName);
  const entry = path.join(root, `js/builds/${buildName}/entry.js`);

  await build({
    configFile: false,
    root,
    publicDir: false,
    logLevel: 'warn',
    plugins: [featuresPlugin()],
    build: {
      outDir: 'dist',
      emptyOutDir,
      sourcemap: true,
      reportCompressedSize: false,
      cssCodeSplit: false,
      rollupOptions: {
        input: entry,
        output: {
          entryFileNames: js,
          assetFileNames: '[name][extname]',
          inlineDynamicImports: true,
        },
      },
    },
  });
}

function reportSummary(buildNames) {
  const files = [];
  for (const name of buildNames) {
    const { css, js } = buildOutputNames(name);
    files.push(css, js);
  }

  console.log('');
  console.log(`${ansi.bold}${ansi.green}✓ build ok${ansi.reset} — dist ready`);

  for (const name of files) {
    const file = path.join(distDir, name);
    try {
      const buf = readFileSync(file);
      console.log(
        `  ${ansi.cyan}${name.padEnd(20)}${ansi.reset} ${formatKb(buf.length).padStart(10)}  ${ansi.dim}gzip ${formatKb(gzipSync(buf).length)}${ansi.reset}`,
      );
    } catch {
      console.log(`  ${ansi.cyan}${name.padEnd(20)}${ansi.reset} ${ansi.dim}missing${ansi.reset}`);
    }
  }
  console.log('');
}

function cleanupDist(keep) {
  mkdirSync(distDir, { recursive: true });
  for (const name of readdirSync(distDir)) {
    if (keep.has(name)) continue;
    rmSync(path.join(distDir, name), { recursive: true, force: true });
  }
}

async function main() {
  syncAllBuilds();
  const names = listBuildNames();
  console.log(`Building: ${names.join(', ')}`);

  mkdirSync(distDir, { recursive: true });

  let first = true;
  for (const name of names) {
    await buildJs(name, { emptyOutDir: first });
    first = false;
    compileCss(name);
  }

  const keep = new Set();
  for (const name of names) {
    const out = buildOutputNames(name);
    keep.add(out.css);
    keep.add(out.cssMap);
    keep.add(out.js);
    keep.add(out.jsMap);
  }
  cleanupDist(keep);

  lintTokens();
  reportSummary(names);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
