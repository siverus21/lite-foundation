import { describe, it, expect } from 'vitest';
import {
  collectSettings,
  orderSettings,
  emptyFeatures,
  resolveBuild,
} from '../scripts/sync-features.js';
import { buildOutputNames, splitBuildConfig, getBuildKind } from '../config/features.js';

describe('sync-features helpers', () => {
  it('collectSettings pulls style + layout + utilities folders', () => {
    const features = emptyFeatures();
    features.styles.button = true;
    features.styles.menu = true;
    features.layout.titleBar = true;
    features.utilities = true;

    const set = collectSettings(features);
    expect(set.has('button')).toBe(true);
    expect(set.has('menu')).toBe(true);
    expect(set.has('accordion-menu')).toBe(true);
    expect(set.has('title-bar')).toBe(true);
    expect(set.has('utilities')).toBe(true);
  });

  it('orderSettings puts preferred folders first', () => {
    const ordered = orderSettings(new Set(['card', 'button', 'forms', 'zzz']));
    expect(ordered.slice(0, 2)).toEqual(['forms', 'button']);
    expect(ordered.at(-1)).toBe('zzz');
  });

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
