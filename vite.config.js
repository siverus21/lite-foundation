import { defineConfig } from 'vite';
import { featuresPlugin } from './scripts/sync-features.js';
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
  plugins: [featuresPlugin(), tokenLintPlugin()],
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
