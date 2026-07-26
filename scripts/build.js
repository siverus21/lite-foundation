/**
 * Production build: all named builds from config/features.js.
 * Parallel per-entry Vite builds (inlineDynamicImports) + parallel Sass.
 */
import path from 'node:path';
import {
  mkdirSync,
  rmSync,
  writeFileSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  existsSync,
} from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
import * as sass from 'sass';
import { syncAllBuilds, listBuildNames, buildScssSource, featuresPlugin, VIRTUAL_ENTRY_PREFIX } from './sync-features.js';
import { buildOutputNames } from '../config/features.js';
import { dartSassCompileOptions } from '../config/sass-options.js';
import { lintTokens } from './lint-tokens.js';
import { pathToFileURL } from 'node:url';

const root = path.resolve('.');
const distDir = path.join(root, 'dist');

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
  const result = sass.compileString(buildScssSource(buildName), {
    ...dartSassCompileOptions(),
    url: pathToFileURL(path.join(root, `virtual/lf-scss/${buildName}.scss`)),
  });
  writeFileSync(path.join(distDir, css), `${result.css}\n/*# sourceMappingURL=${cssMap} */\n`);
  writeFileSync(path.join(distDir, cssMap), JSON.stringify(result.sourceMap));
}

async function buildJs(buildName) {
  const { js } = buildOutputNames(buildName);
  const outDir = path.join(root, `.tmp-dist-${buildName}`);

  rmSync(outDir, { recursive: true, force: true });

  await build({
    configFile: false,
    root,
    publicDir: false,
    logLevel: 'warn',
    // main() already ran syncAllBuilds() once — skip the redundant per-build resync.
    plugins: [featuresPlugin({ syncOnBuild: false })],
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: true,
      reportCompressedSize: false,
      cssCodeSplit: false,
      rollupOptions: {
        input: `${VIRTUAL_ENTRY_PREFIX}${buildName}`,
        output: {
          entryFileNames: js,
          assetFileNames: '[name][extname]',
          inlineDynamicImports: true,
        },
      },
    },
  });

  mkdirSync(distDir, { recursive: true });
  copyFileSync(path.join(outDir, js), path.join(distDir, js));
  const map = `${js}.map`;
  if (existsSync(path.join(outDir, map))) {
    copyFileSync(path.join(outDir, map), path.join(distDir, map));
  }
  rmSync(outDir, { recursive: true, force: true });
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

  // Fail fast: don't spend time building if a component has hardcoded colors/z-index.
  const { ok: tokensOk } = lintTokens({ strict: true });
  if (!tokensOk) {
    console.error('\nBuild aborted — fix the token warnings above (or move the rule into scss/critical/).\n');
    process.exit(1);
  }

  const names = listBuildNames();
  console.log(`Building: ${names.join(', ')}`);

  mkdirSync(distDir, { recursive: true });

  await Promise.all([...names.map((name) => buildJs(name)), ...names.map((name) => Promise.resolve(compileCss(name)))]);

  const keep = new Set();
  for (const name of names) {
    const out = buildOutputNames(name);
    keep.add(out.css);
    keep.add(out.cssMap);
    keep.add(out.js);
    keep.add(out.jsMap);
  }
  cleanupDist(keep);

  reportSummary(names);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
