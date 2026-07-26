import { describe, it, expect } from 'vitest';
import { resolveBuild, listBuildNames } from '../scripts/sync-features.js';
import { buildOutputNames, getBuildKind } from '../config/features.js';

describe('features / builds config', () => {
  it('lists expected builds', () => {
    expect(listBuildNames()).toEqual(expect.arrayContaining(['full', 'about', 'swiper']));
  });

  it('marks swiper as library', () => {
    expect(getBuildKind('swiper')).toBe('library');
    expect(buildOutputNames('swiper')).toEqual({
      css: 'lib-swiper.css',
      js: 'lib-swiper.js',
      cssMap: 'lib-swiper.css.map',
      jsMap: 'lib-swiper.js.map',
    });
  });

  it('full keeps cash and slider off by default', () => {
    const full = resolveBuild('full');
    expect(full.vendors.cash).toBe(false);
    expect(full.vendors.swiper).toBe(false);
    expect(full.scripts.slider).toBe(false);
  });

  it('about is a sparse page build with button/card', () => {
    const about = resolveBuild('about');
    expect(about.styles.button).toBe(true);
    expect(about.styles.card).toBe(true);
    expect(about.styles.modal).toBe(false);
    expect(about.scripts.modal).toBe(false);
  });
});
