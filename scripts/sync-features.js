import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import features, { required } from '../config/features.js';

const __filename = fileURLToPath(import.meta.url);

/** Map style feature → scss/components folder name */
const STYLE_FOLDERS = {
  modal: 'modal',
  slider: 'slider',
  sticky: 'sticky',
  tabs: 'tabs',
  accordion: 'accordion',
  offcanvas: 'offcanvas',
  dropdown: 'dropdown',
  tooltip: 'tooltip',
  menu: 'menu',
  breadcrumbs: 'breadcrumbs',
  pagination: 'pagination',
  mediaObject: 'media-object',
  thumbnail: 'thumbnail',
  responsiveEmbed: 'responsive-embed',
  callout: 'callout',
  card: 'card',
  label: 'label',
  badge: 'badge',
  progress: 'progress',
  meter: 'meter',
  table: 'table',
  button: 'button',
  forms: 'forms',
};

/** Extra settings folders pulled in with a style feature */
const STYLE_SETTINGS = {
  modal: ['modal'],
  slider: [],
  sticky: [],
  tabs: ['tabs'],
  accordion: ['accordion'],
  offcanvas: ['offcanvas'],
  dropdown: ['dropdown'],
  tooltip: ['tooltip'],
  menu: ['menu', 'accordion-menu', 'drilldown', 'dropdown-menu'],
  breadcrumbs: ['breadcrumbs'],
  pagination: ['pagination'],
  mediaObject: ['media-object'],
  thumbnail: ['thumbnail'],
  responsiveEmbed: ['responsive-embed'],
  callout: ['callout'],
  card: ['card'],
  label: ['label'],
  badge: ['badge'],
  progress: ['progress'],
  meter: ['meter'],
  table: ['table'],
  button: ['button'],
  forms: ['forms'],
};

/** Map script feature → { className, file } */
const SCRIPT_MODULES = {
  modal: { file: './modal.js', className: 'Modal' },
  slider: { file: './slider.js', className: 'Slider' },
  formSlider: { file: './form-slider.js', className: 'FormSlider' },
  animations: { file: './animations.js', className: 'Animations' },
  tabs: { file: './tabs.js', className: 'Tabs' },
  accordion: { file: './accordion.js', className: 'Accordion' },
  offcanvas: { file: './offcanvas.js', className: 'Offcanvas' },
  dropdown: { file: './dropdown.js', className: 'Dropdown' },
  tooltip: { file: './tooltip.js', className: 'Tooltip' },
  menus: { file: './menus.js', className: 'Menus' },
};

function enabledEntries(map = {}) {
  return Object.entries(map).filter(([, on]) => on);
}

function generateSettingsIndex() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
    '// Project settings. Load order matters.',
    '// Required core (see config/features.js → required.settings)',
  ];

  const core = required.settings.filter((s) => s !== 'css-variables');
  for (const folder of core) {
    lines.push(`@import '${folder}';`);
  }

  const settings = new Set();
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    for (const folder of STYLE_SETTINGS[key] || []) {
      settings.add(folder);
    }
  }

  if (features.layout?.titleBar) settings.add('title-bar');
  if (features.layout?.topBar) settings.add('top-bar');

  // Stable-ish order: forms/button early (used widely), then the rest alpha
  const preferred = ['forms', 'button', 'menu', 'accordion-menu', 'drilldown', 'dropdown-menu'];
  const ordered = [
    ...preferred.filter((s) => settings.has(s)),
    ...[...settings].filter((s) => !preferred.includes(s)).sort(),
  ];

  for (const folder of ordered) {
    lines.push(`@import '${folder}';`);
  }

  if (features.utilities) {
    lines.push("@import 'utilities';");
  }

  if (required.settings.includes('css-variables')) {
    lines.push("@import 'css-variables';");
  }

  lines.push('');
  return lines.join('\n');
}

function generateComponentsIndex() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
  ];

  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) lines.push(`@import '${folder}';`);
  }

  lines.push('');
  return lines.join('\n');
}

function generateVendorsIndex() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
  ];
  if (features.vendors?.swiper) lines.push("@import 'swiper';");
  if (features.vendors?.animate) lines.push("@import 'animate';");
  lines.push('');
  return lines.join('\n');
}

function generateLayoutIndex() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
    '// Required core (see config/features.js → required.layout)',
  ];
  for (const folder of required.layout) {
    lines.push(`@import '${folder}';`);
  }
  if (features.layout?.titleBar) lines.push("@import 'title-bar';");
  if (features.layout?.topBar) lines.push("@import 'top-bar';");
  lines.push('');
  return lines.join('\n');
}

function generateUtilitiesIndex() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
  ];
  if (features.utilities) {
    lines.push("@import 'flex';");
    lines.push("@import 'visibility';");
  }
  lines.push('');
  return lines.join('\n');
}

function generateModulesIndex() {
  const imports = [];
  const classes = [];

  for (const [key, on] of enabledEntries(features.scripts)) {
    const mod = SCRIPT_MODULES[key];
    if (!on || !mod) continue;
    imports.push(`import { ${mod.className} } from '${mod.file}';`);
    classes.push(`    ${mod.className},`);
  }

  return `${imports.join('\n')}

/**
 * Register and run enabled UI modules (see config/features.js).
 * GENERATED — do not edit by hand.
 */
export function initModules() {
  const modules = [
${classes.join('\n')}
  ];

  modules.forEach((Module) => {
    try {
      new Module();
    } catch (error) {
      console.error('[lite-foundation] module init failed:', Module.name, error);
    }
  });
}
`;
}

/**
 * JS vendor side-effects bundled into lib.js (jQuery → window.$).
 * Swiper is imported by modules/slider.js when scripts.slider is on.
 */
function generateVendorsJs() {
  const lines = [
    '// GENERATED from config/features.js — do not edit by hand.',
  ];

  if (features.vendors?.jquery) {
    lines.push("import $ from 'jquery';");
    lines.push('window.jQuery = window.$ = $;');
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

/** Auto-import non-empty `_*.scss` partials in scss/critical/ (except `_index`). */
function generateCriticalIndex() {
  const dir = path.resolve('scss/critical');
  mkdirSync(dir, { recursive: true });

  let partials = [];
  try {
    partials = readdirSync(dir)
      .filter((name) => /^_(?!index).+\.scss$/i.test(name))
      .filter((name) => readFileSync(path.join(dir, name), 'utf8').trim().length > 0)
      .map((name) => name.replace(/^_/, '').replace(/\.scss$/i, ''))
      .sort();
  } catch {
    partials = [];
  }

  return [
    '// GENERATED — partials in scss/critical/ (not token-linted).',
    '// Move these into components/settings when you can.',
    ...partials.map((name) => `@import '${name}';`),
    '',
  ].join('\n');
}

export function syncFeatures() {
  const root = path.resolve('.');
  const writes = [
    ['scss/settings/_index.scss', generateSettingsIndex()],
    ['scss/components/_index.scss', generateComponentsIndex()],
    ['scss/vendors/_index.scss', generateVendorsIndex()],
    ['scss/layout/_index.scss', generateLayoutIndex()],
    ['scss/utilities/_index.scss', generateUtilitiesIndex()],
    ['scss/critical/_index.scss', generateCriticalIndex()],
    ['js/modules/index.js', generateModulesIndex()],
    ['js/vendors.js', generateVendorsJs()],
  ];

  for (const [rel, content] of writes) {
    const file = path.join(root, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
}

/** Vite plugin: regenerate include lists whenever features.js changes. */
export function featuresPlugin() {
  return {
    name: 'lf-features',
    buildStart() {
      syncFeatures();
      this.addWatchFile(path.resolve('config/features.js'));
    },
    configureServer(server) {
      syncFeatures();
      const file = path.resolve('config/features.js');
      const criticalDir = path.resolve('scss/critical');
      server.watcher.add(file);
      server.watcher.add(criticalDir);
      server.watcher.on('change', (changed) => {
        const resolved = path.resolve(changed);
        if (resolved === file || resolved.startsWith(criticalDir + path.sep)) {
          syncFeatures();
          server.ws.send({ type: 'full-reload' });
        }
      });
      server.watcher.on('add', (changed) => {
        if (path.resolve(changed).startsWith(criticalDir + path.sep)) {
          syncFeatures();
          server.ws.send({ type: 'full-reload' });
        }
      });
      server.watcher.on('unlink', (changed) => {
        if (path.resolve(changed).startsWith(criticalDir + path.sep)) {
          syncFeatures();
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  syncFeatures();
  console.log('Features synced from config/features.js');
}
