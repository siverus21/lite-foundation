/**
 * Feature flags — single source of truth for SCSS + JS includes.
 * Edit optional flags below, then restart Vite / run `npm run build`.
 *
 * `styles`     → component stylesheets (+ their settings)
 * `scripts`    → JS modules to bundle and init
 * `vendors`    → Swiper / Animate.css CSS + jQuery JS (bundled into lib.js)
 * `layout`     → optional chrome (title-bar / top-bar); core layout is required
 * `utilities`  → flex + visibility helpers
 */

/**
 * Always compiled. Not flags — cannot be turned off.
 * Wired in `scss/app.scss` and regenerated indexes (`scripts/sync-features.js`).
 */
export const required = {
  abstracts: ['functions', 'mixins'],
  settings: ['global', 'breakpoints', 'grid', 'typography', 'z-index', 'css-variables'],
  base: ['reset', 'typography'],
  layout: ['containers', 'grid'],
};

/** Optional includes — set any value to `false` to drop from the build. */
export default {
  vendors: {
    jquery: true, // JS → lib.js (window.jQuery / window.$)
    swiper: true, // CSS + JS (via scripts.slider)
    animate: true, // CSS only
  },

  // Extra layout chrome (core containers + grid always load — see `required.layout`)
  layout: {
    titleBar: true,
    topBar: true,
  },

  utilities: true,

  styles: {
    modal: true,
    slider: true,
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
    slider: true,
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
