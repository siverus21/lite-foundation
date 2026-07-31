import { describe, it, expect } from 'vitest';
import {
  resolveBuild,
  emptyFeatures,
  generateModulesIndex,
  generateVendorsJs,
  generateBuildScssSource,
  featuresPlugin,
  STYLE_FOLDERS,
  SCRIPT_MODULES,
} from '../scripts/sync-features.js';
import { buildOutputNames, splitBuildConfig, getBuildKind } from '../config/features.js';

describe('sync-features helpers', () => {
  it('splitBuildConfig strips kind meta from feature flags', () => {
    const { kind, features } = splitBuildConfig({
      kind: 'library',
      vendors: { swiper: true },
      styles: { slider: true },
    });
    expect(kind).toBe('library');
    expect(features.kind).toBeUndefined();
    expect(features.vendors.swiper).toBe(true);
  });
});

describe('buildOutputNames', () => {
  it('maps full / page / library names', () => {
    expect(buildOutputNames('full').css).toBe('app.css');
    expect(buildOutputNames('full').js).toBe('lib.js');
    expect(buildOutputNames('about')).toMatchObject({
      css: 'app-about.css',
      js: 'lib-about.js',
    });
    expect(getBuildKind('swiper')).toBe('library');
    expect(buildOutputNames('swiper')).toMatchObject({
      css: 'lib-swiper.css',
      js: 'lib-swiper.js',
    });
  });

  it('swiper library resolve enables only slider-related flags', () => {
    const swiper = resolveBuild('swiper');
    expect(swiper.vendors.swiper).toBe(true);
    expect(swiper.styles.slider).toBe(true);
    expect(swiper.scripts.slider).toBe(true);
    expect(swiper.styles.modal).toBe(false);
    expect(swiper.vendors.cash).toBe(false);
  });
});

describe('emptyFeatures', () => {
  it('turns every known style/script/vendor flag off', () => {
    const empty = emptyFeatures();
    expect(empty.utilities).toBe(false);
    expect(Object.keys(empty.styles).sort()).toEqual(Object.keys(STYLE_FOLDERS).sort());
    expect(Object.values(empty.styles).every((v) => v === false)).toBe(true);
    expect(Object.keys(empty.scripts).sort()).toEqual(Object.keys(SCRIPT_MODULES).sort());
    expect(Object.values(empty.scripts).every((v) => v === false)).toBe(true);
    expect(empty.vendors).toEqual({ cash: false, swiper: false, animate: false });
  });
});

describe('generateModulesIndex', () => {
  it('emits an import + class registration per enabled script, none for disabled', () => {
    const features = emptyFeatures();
    features.scripts.modal = true;
    features.scripts.tabs = true;
    const js = generateModulesIndex(features);
    expect(js).toContain("import { Modal } from '/js/modules/modal.js';");
    expect(js).toContain("import { Tabs } from '/js/modules/tabs.js';");
    expect(js).toContain('Modal,');
    expect(js).toContain('Tabs,');
    expect(js).not.toContain('Offcanvas');
    expect(js).toContain('export const initModules = runtime.init;');
    expect(js).toContain('export function createLF(root = document)');
    expect(js).toContain('createLFRuntime');
  });

  it('throws on an unknown scripts.* flag instead of silently dropping it', () => {
    const features = emptyFeatures();
    features.scripts.totallyMadeUp = true;
    expect(() => generateModulesIndex(features)).toThrow(/Unknown script flag "totallyMadeUp"/);
  });
});

describe('generateVendorsJs', () => {
  it('wires up cash-dom as a global when vendors.cash is on', () => {
    const features = emptyFeatures();
    features.vendors.cash = true;
    const js = generateVendorsJs(features);
    expect(js).toContain("import $ from 'cash-dom';");
    expect(js).toContain('window.$ = $;');
  });

  it('emits nothing extra for swiper/animate (styling handled via CSS layer)', () => {
    const features = emptyFeatures();
    features.vendors.swiper = true;
    features.vendors.animate = true;
    const js = generateVendorsJs(features);
    expect(js).not.toContain('cash-dom');
  });

  it('throws on an unknown vendors.* flag', () => {
    const features = emptyFeatures();
    features.vendors.notReal = true;
    expect(() => generateVendorsJs(features)).toThrow(/Unknown vendor flag "notReal"/);
  });
});

describe('generateBuildScssSource', () => {
  it('page build: includes reset/base/layout always, vendors/utilities/components only when enabled', () => {
    const features = emptyFeatures();
    const css = generateBuildScssSource(features, { kind: 'page' });
    expect(css).toContain('@layer lf-reset {');
    expect(css).toContain('@layer lf-base {');
    expect(css).toContain('@layer lf-layout {');
    expect(css).toContain('@layer lf-critical {');
    expect(css).not.toContain('@layer lf-vendors {');
    expect(css).not.toContain('@layer lf-utilities {');
    expect(css).not.toContain('@layer lf-components {');

    features.vendors.animate = true;
    features.utilities = true;
    features.styles.modal = true;
    const full = generateBuildScssSource(features, { kind: 'page' });
    expect(full).toContain('@layer lf-vendors {');
    expect(full).toContain("meta.load-css('vendors/animate')");
    expect(full).toContain('@layer lf-utilities {');
    expect(full).toContain('@layer lf-components {');
    expect(full).toContain("meta.load-css('components/modal')");
  });

  it('full preset wires titleBar/topBar through styles.* into component CSS loads', () => {
    const features = resolveBuild('full');
    expect(features.layout).toBeUndefined();
    expect(features.styles.titleBar).toBe(true);
    expect(features.styles.topBar).toBe(true);
    const css = generateBuildScssSource(features, { kind: 'page' });
    expect(css).toContain("meta.load-css('components/title-bar')");
    expect(css).toContain("meta.load-css('components/top-bar')");
  });

  it('about preset keeps titleBar/topBar off', () => {
    const features = resolveBuild('about');
    expect(features.styles.titleBar).toBe(false);
    expect(features.styles.topBar).toBe(false);
    const css = generateBuildScssSource(features, { kind: 'page' });
    expect(css).not.toContain("meta.load-css('components/title-bar')");
    expect(css).not.toContain("meta.load-css('components/top-bar')");
  });

  it('library build: no core/critical layers, only vendors + components', () => {
    const features = emptyFeatures();
    features.vendors.swiper = true;
    features.styles.slider = true;
    const css = generateBuildScssSource(features, { kind: 'library' });
    expect(css).not.toContain('@layer lf-reset');
    expect(css).not.toContain('@layer lf-critical');
    expect(css).toContain('@layer lf-vendors {');
    expect(css).toContain("meta.load-css('vendors/swiper')");
    expect(css).toContain('@layer lf-components {');
    expect(css).toContain("meta.load-css('components/slider')");
  });
});

describe('featuresPlugin virtual module resolution', () => {
  const plugin = featuresPlugin({ syncOnBuild: false });

  it('resolveId maps each virtual prefix to its internal (\\0-prefixed) id', () => {
    expect(plugin.resolveId('virtual:lf-scss/full')).toBe('\0virtual:lf-scss/full.scss');
    expect(plugin.resolveId('virtual:lf-entry/full')).toBe('\0virtual:lf-entry/full');
    expect(plugin.resolveId('virtual:lf-modules/full')).toBe('\0virtual:lf-modules/full');
    expect(plugin.resolveId('virtual:lf-vendors/full')).toBe('\0virtual:lf-vendors/full');
    // Vite sometimes normalizes bare specifiers with a leading slash.
    expect(plugin.resolveId('/virtual:lf-entry/about')).toBe('\0virtual:lf-entry/about');
  });

  it('resolveId returns null for unrelated ids', () => {
    expect(plugin.resolveId('/js/boot.js')).toBeNull();
    expect(plugin.resolveId('some-package')).toBeNull();
  });

  it('load returns generated sources for known builds, throws for unknown ones', () => {
    const entry = plugin.load('\0virtual:lf-entry/full');
    expect(entry).toContain("from '/js/boot.js'");
    expect(entry).toContain('createLF');
    expect(entry).toContain('export { initModules, destroyModules, refreshModules, unmountModules, createLF }');
    expect(plugin.load('\0virtual:lf-modules/full')).toContain('createModuleRuntime');
    expect(plugin.load('\0virtual:lf-vendors/full')).toContain('GENERATED');
    expect(plugin.load('\0virtual:lf-scss/full.scss')).toContain('@charset');

    expect(() => plugin.load('\0virtual:lf-entry/nope')).toThrow(/Unknown build "nope"/);
    expect(() => plugin.load('\0virtual:lf-modules/nope')).toThrow(/Unknown build "nope"/);
    expect(() => plugin.load('\0virtual:lf-vendors/nope')).toThrow(/Unknown build "nope"/);
    expect(() => plugin.load('\0virtual:lf-scss/nope.scss')).toThrow(/Unknown build "nope"/);
  });

  it('load returns null for ids it does not own', () => {
    expect(plugin.load('/js/boot.js')).toBeNull();
  });
});
