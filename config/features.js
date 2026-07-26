/**
 * Feature flags + named builds.
 *
 * `export default` — preset for the `full` page build (app.css / lib.js).
 * `builds` — named bundles:
 *   - page (default) → app-{name}.css + lib-{name}.js  (`full` → app.css / lib.js)
 *   - library (`kind: 'library'`) → lib-{name}.css + lib-{name}.js
 *     Addon only: no base/layout/critical. Load alongside a page bundle.
 *
 * Edit, then restart Vite / run `npm run build`.
 */

/**
 * Always compiled into page builds. Not flags — cannot be turned off.
 * Library builds skip this layer (CSS is addon-only).
 */
export const required = {
  abstracts: ['functions', 'mixins'],
  settings: ['global', 'breakpoints', 'grid', 'typography', 'z-index', 'css-variables'],
  base: ['reset', 'typography'],
  layout: ['containers', 'grid'],
};

/** Keys in a `builds` entry that are not feature flags. */
export const BUILD_META_KEYS = ['kind'];

/** Full kitchen-sink page preset (also the `full` build). Swiper is a separate library build. */
export default {
  vendors: {
    cash: true,
    swiper: false,
    animate: true,
  },

  layout: {
    titleBar: true,
    topBar: true,
  },

  utilities: true,

  styles: {
    modal: true,
    slider: false,
    sticky: true,
    tabs: true,
    accordion: true,
    offcanvas: true,
    dropdown: true,
    tooltip: true,
    menu: true,
    breadcrumbs: true,
    pagination: true,
    mediaObject: true,
    thumbnail: true,
    responsiveEmbed: true,
    callout: true,
    card: true,
    label: true,
    badge: true,
    progress: true,
    meter: true,
    table: true,
    button: true,
    forms: true,
  },

  scripts: {
    modal: true,
    slider: false,
    formSlider: true,
    animations: true,
    tabs: true,
    accordion: true,
    offcanvas: true,
    dropdown: true,
    tooltip: true,
    menus: true,
  },
};

/**
 * Named builds. Sparse configs (not `full`) start from “all off”, then apply listed flags.
 * Meta: `kind: 'page' | 'library'` (default `page`).
 */
export const builds = {
  full: {},

  /** Minimal demo page — about.html → app-about.css + lib-about.js */
  about: {
    vendors: {
      cash: true,
      swiper: false,
      animate: false,
    },
    layout: {
      titleBar: false,
      topBar: false,
    },
    utilities: true,
    styles: {
      button: true,
      callout: true,
      card: true,
    },
    scripts: {},
  },

  /**
   * Vendor library addon — lib-swiper.css + lib-swiper.js
   * Pair with a page bundle (e.g. app.css + lib.js) on pages that need a slider.
   */
  swiper: {
    kind: 'library',
    vendors: { swiper: true },
    styles: { slider: true },
    scripts: { slider: true },
  },
};

/** Split meta (`kind`) from feature flags in a builds entry. */
export function splitBuildConfig(raw = {}) {
  const features = {};
  let kind = 'page';
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'kind') kind = value || 'page';
    else features[key] = value;
  }
  return { kind, features };
}

export function getBuildKind(buildName) {
  return splitBuildConfig(builds[buildName]).kind;
}

/** Output file basenames for a build key. */
export function buildOutputNames(buildName) {
  if (buildName === 'full') {
    return { css: 'app.css', js: 'lib.js', cssMap: 'app.css.map', jsMap: 'lib.js.map' };
  }
  if (getBuildKind(buildName) === 'library') {
    return {
      css: `lib-${buildName}.css`,
      js: `lib-${buildName}.js`,
      cssMap: `lib-${buildName}.css.map`,
      jsMap: `lib-${buildName}.js.map`,
    };
  }
  return {
    css: `app-${buildName}.css`,
    js: `lib-${buildName}.js`,
    cssMap: `app-${buildName}.css.map`,
    jsMap: `lib-${buildName}.js.map`,
  };
}
