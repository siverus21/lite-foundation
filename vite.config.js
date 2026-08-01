import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { featuresPlugin } from './scripts/sync-features.js';
import { docsShellPlugin } from './scripts/docs-shell-plugin.js';
import { lintTokens } from './scripts/lint-tokens.js';
import { viteScssOptions } from './config/sass-options.js';

/** Dev-only: lint on server start (production lint runs in scripts/build.js). */
function tokenLintPlugin() {
  return {
    name: 'lf-token-lint',
    apply: 'serve',
    buildStart() {
      lintTokens();
    },
  };
}

/**
 * Dev server config. Production: `npm run build` → scripts/build.js
 */
export default defineConfig({
  publicDir: false,
  // Preact is docs-only (JSX pages under docs/). Library runtime stays vanilla.
  plugins: [
    preact({ include: [/\/docs\/src\/.*\.[tj]sx?$/] }),
    featuresPlugin(),
    docsShellPlugin(),
    tokenLintPlugin(),
  ],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: viteScssOptions,
    },
  },
  server: {
    open: '/index.html',
  },
});
