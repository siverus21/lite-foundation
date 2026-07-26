import { defineConfig } from 'vite';
import path from 'node:path';
import { featuresPlugin } from './scripts/sync-features.js';
import { lintTokens } from './scripts/lint-tokens.js';

const loadPaths = [path.resolve('node_modules')];

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
 * (named builds → app.css / app-about.css / lib.js / lib-about.js).
 */
export default defineConfig({
  publicDir: false,
  plugins: [featuresPlugin(), tokenLintPlugin()],
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
  server: {
    open: '/index.html',
  },
});
