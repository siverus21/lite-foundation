import { describe, it, expect } from 'vitest';
import { resolveBuild } from '../scripts/sync-features.js';
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
