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
 *
 * Key order: styles.* and scripts.* are alphabetical (stable diffs / reviews).
 * Keep the same order in `STYLE_FOLDERS` / `SCRIPT_MODULES` (scripts/sync-features.js).
 */

/**
 * Always compiled into page builds. Not flags — cannot be turned off.
 * Library builds skip this layer (CSS is addon-only).
 * Keys are `scss/core/` cascade layers; values are partial names in that folder.
 */
export const required = {
  core: {
    'lf-reset': ['reset'],
    'lf-base': ['typography'],
    'lf-layout': ['containers', 'grid'],
  },
};

/** Full kitchen-sink page preset (also the `full` build). Swiper is a separate library build. */
export default {
  vendors: {
    animate: true,
    cash: false,
    swiper: false,
  },

  utilities: true,

  styles: {
    accordion: true,
    avatar: true,
    badge: true,
    breadcrumbs: true,
    button: true,
    callout: true,
    card: true,
    chip: true,
    combobox: true,
    copy: true,
    dropdown: true,
    forms: true,
    label: true,
    listbox: true,
    mediaObject: true,
    menu: true,
    meter: true,
    modal: true,
    offcanvas: true,
    otp: true,
    pagination: true,
    popover: true,
    progress: true,
    quantity: true,
    rating: true,
    responsiveEmbed: true,
    segmented: true,
    slider: false,
    spinner: true,
    stepper: true,
    sticky: true,
    table: true,
    tabs: true,
    tagInput: true,
    thumbnail: true,
    timeline: true,
    titleBar: true,
    toast: true,
    tooltip: true,
    topBar: true,
  },

  scripts: {
    accordion: true,
    animations: true,
    charCounter: true,
    combobox: true,
    copy: true,
    dismiss: true,
    dropdown: true,
    formSlider: true,
    inputRecipes: true,
    menuAccordion: true,
    menuDrilldown: true,
    menuDropdown: true,
    modal: true,
    offcanvas: true,
    otp: true,
    passwordStrength: true,
    popover: true,
    quantity: true,
    rating: true,
    slider: false,
    stepper: true,
    tableSort: true,
    tabs: true,
    tagInput: true,
    theme: true,
    toast: true,
    tooltip: true,
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
      animate: false,
      cash: false,
      swiper: false,
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
