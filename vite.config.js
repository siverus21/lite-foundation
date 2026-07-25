import { defineConfig } from 'vite';
import path from 'node:path';
import { mkdirSync, rmSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import * as sass from 'sass';
import { featuresPlugin, syncFeatures } from './scripts/sync-features.js';
import { lintTokens } from './scripts/lint-tokens.js';

const loadPaths = [path.resolve('node_modules')];
const distDir = path.resolve('dist');

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

/** After a successful build: OK notices first, then dist file sizes. */
function reportBuildSummary() {
  const files = ['app.css', 'lib.js'];

  console.log('');
  console.log(`${ansi.bold}${ansi.green}✓ build ok${ansi.reset} — dist ready`);

  for (const name of files) {
    const file = path.join(distDir, name);
    try {
      const buf = readFileSync(file);
      const raw = buf.length;
      const gzip = gzipSync(buf).length;
      console.log(
        `  ${ansi.cyan}${name.padEnd(10)}${ansi.reset} ${formatKb(raw).padStart(10)}  ${ansi.dim}gzip ${formatKb(gzip)}${ansi.reset}`,
      );
    } catch {
      console.log(`  ${ansi.cyan}${name.padEnd(10)}${ansi.reset} ${ansi.dim}missing${ansi.reset}`);
    }
  }
  console.log('');
}

/**
 * Emit stable dist/app.css (+ map). Strip Vite junk so dist stays flat:
 *   dist/app.css
 *   dist/lib.js
 */
function distBuild() {
  return {
    name: 'dist-build',
    apply: 'build',
    closeBundle() {
      mkdirSync(distDir, { recursive: true });
      syncFeatures();

      const result = sass.compile(path.resolve('scss/app.scss'), {
        loadPaths,
        style: 'compressed',
        sourceMap: true,
        sourceMapIncludeSources: true,
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      });

      writeFileSync(
        path.join(distDir, 'app.css'),
        `${result.css}\n/*# sourceMappingURL=app.css.map */\n`,
      );
      writeFileSync(
        path.join(distDir, 'app.css.map'),
        JSON.stringify(result.sourceMap),
      );

      for (const name of readdirSync(distDir)) {
        if (name === 'app.css' || name === 'app.css.map') continue;
        if (name === 'lib.js' || name === 'lib.js.map') continue;
        rmSync(path.join(distDir, name), { recursive: true, force: true });
      }

      // Notices first (token lint / critical), then sizes
      lintTokens();
      reportBuildSummary();
    },
  };
}

/** Dev-only: lint on server start (build runs lint once at the end). */
function tokenLintPlugin() {
  return {
    name: 'lf-token-lint',
    apply: 'serve',
    buildStart() {
      lintTokens();
    },
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [featuresPlugin(), tokenLintPlugin(), distBuild()],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        loadPaths,
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    reportCompressedSize: false,
    rollupOptions: {
      input: path.resolve('js/lib.js'),
      output: {
        entryFileNames: 'lib.js',
        assetFileNames: '[name][extname]',
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    open: '/index.html',
  },
});
