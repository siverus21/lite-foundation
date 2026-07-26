import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'js/core/**',
        'js/modules/**',
        'js/boot.js',
        'config/features.js',
        'scripts/sync-features.js',
      ],
      exclude: ['js/builds/**', 'js/modules/index.js', 'js/vendors.js'],
    },
  },
});
