import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import defaultFeatures, {
  required,
  builds,
  buildOutputNames,
  splitBuildConfig,
  getBuildKind,
} from '../config/features.js';

const __filename = fileURLToPath(import.meta.url);

/** Map style feature → scss/components folder name */
export const STYLE_FOLDERS = {
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

/** Map script feature → { className, file relative to js/builds/{name}/ } */
export const SCRIPT_MODULES = {
  modal: { file: '../../modules/modal.js', className: 'Modal' },
  slider: { file: '../../modules/slider.js', className: 'Slider' },
  formSlider: { file: '../../modules/form-slider.js', className: 'FormSlider' },
  animations: { file: '../../modules/animations.js', className: 'Animations' },
  tabs: { file: '../../modules/tabs.js', className: 'Tabs' },
  accordion: { file: '../../modules/accordion.js', className: 'Accordion' },
  offcanvas: { file: '../../modules/offcanvas.js', className: 'Offcanvas' },
  dropdown: { file: '../../modules/dropdown.js', className: 'Dropdown' },
  tooltip: { file: '../../modules/tooltip.js', className: 'Tooltip' },
  menus: { file: '../../modules/menus.js', className: 'Menus' },
};

function enabledEntries(map = {}) {
  return Object.entries(map).filter(([, on]) => on);
}

function deepMerge(base, override = {}) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Empty feature set — everything off. */
export function emptyFeatures() {
  return {
    vendors: { cash: false, swiper: false, animate: false },
    layout: { titleBar: false, topBar: false },
    utilities: false,
    styles: Object.fromEntries(Object.keys(STYLE_FOLDERS).map((k) => [k, false])),
    scripts: Object.fromEntries(Object.keys(SCRIPT_MODULES).map((k) => [k, false])),
  };
}

/**
 * Resolve a named build to a full features object (meta keys like `kind` stripped).
 * `full` → default preset (+ optional feature patch).
 * Other keys → start from empty, apply build config (sparse = only listed flags on).
 */
export function resolveBuild(buildName) {
  const { features: override } = splitBuildConfig(builds[buildName] ?? {});
  if (buildName === 'full') {
    return deepMerge(structuredClone(defaultFeatures), override);
  }
  return deepMerge(emptyFeatures(), override);
}

export function listBuildNames() {
  return Object.keys(builds);
}

function generateSettingsIndex(features) {
  const lines = [
    '// GENERATED — do not edit by hand.',
    '// Project settings. Load order matters.',
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

function generateComponentsIndex(features) {
  const lines = ['// GENERATED — do not edit by hand.'];

  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) lines.push(`@import '${folder}';`);
  }

  lines.push('');
  return lines.join('\n');
}

function generateVendorsIndex(features) {
  const lines = ['// GENERATED — do not edit by hand.'];
  if (features.vendors?.swiper) lines.push("@import 'swiper';");
  if (features.vendors?.animate) lines.push("@import 'animate';");
  lines.push('');
  return lines.join('\n');
}

function generateLayoutIndex(features) {
  const lines = [
    '// GENERATED — do not edit by hand.',
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

function generateUtilitiesIndex(features) {
  const lines = ['// GENERATED — do not edit by hand.'];
  if (features.utilities) {
    lines.push("@import 'flex';");
    lines.push("@import 'visibility';");
  }
  lines.push('');
  return lines.join('\n');
}

function generateModulesIndex(features, { moduleImportPrefix = './' } = {}) {
  const imports = [];
  const classes = [];

  for (const [key, on] of enabledEntries(features.scripts)) {
    const mod = SCRIPT_MODULES[key];
    if (!on || !mod) continue;
    // SCRIPT_MODULES paths are relative to js/builds/{name}/ → ../../modules/
    const file =
      moduleImportPrefix === './'
        ? mod.file.replace('../../modules/', './')
        : mod.file;
    imports.push(`import { ${mod.className} } from '${file}';`);
    classes.push(`    ${mod.className},`);
  }

  const importBlock = imports.length ? `${imports.join('\n')}\n` : '';

  return `${importBlock}
/**
 * Register and run enabled UI modules (see config/features.js builds).
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

function generateVendorsJs(features) {
  const lines = ['// GENERATED — do not edit by hand.'];

  if (features.vendors?.cash) {
    lines.push("import $ from 'cash-dom';");
    lines.push('window.$ = $;');
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

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

/**
 * Self-contained Sass entry for a named build (paths relative to scss/builds/{name}/app.scss).
 * `kind: 'library'` → addon CSS only (vendors + components), no base/layout/critical.
 */
function generateBuildAppScss(features, { kind = 'page' } = {}) {
  if (kind === 'library') {
    return generateLibraryAppScss(features);
  }

  const lines = [
    "@charset 'utf-8';",
    '// GENERATED build entry — do not edit by hand.',
    '',
    "@import '../../abstracts/functions';",
  ];

  const core = required.settings.filter((s) => s !== 'css-variables');
  for (const folder of core) {
    lines.push(`@import '../../settings/${folder}';`);
  }

  const settings = new Set();
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    for (const folder of STYLE_SETTINGS[key] || []) settings.add(folder);
  }
  if (features.layout?.titleBar) settings.add('title-bar');
  if (features.layout?.topBar) settings.add('top-bar');
  if (features.utilities) settings.add('utilities');

  const preferred = ['forms', 'button', 'menu', 'accordion-menu', 'drilldown', 'dropdown-menu'];
  const ordered = [
    ...preferred.filter((s) => settings.has(s)),
    ...[...settings].filter((s) => !preferred.includes(s)).sort(),
  ];
  for (const folder of ordered) {
    lines.push(`@import '../../settings/${folder}';`);
  }
  lines.push("@import '../../settings/css-variables';");
  lines.push("@import '../../abstracts/mixins';");
  lines.push("@import '../../base';");

  if (features.vendors?.swiper) lines.push("@import '../../vendors/swiper';");
  if (features.vendors?.animate) lines.push("@import '../../vendors/animate';");

  lines.push("@import '../../layout/containers';");
  lines.push("@import '../../layout/grid';");
  if (features.layout?.titleBar) lines.push("@import '../../layout/title-bar';");
  if (features.layout?.topBar) lines.push("@import '../../layout/top-bar';");

  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) lines.push(`@import '../../components/${folder}';`);
  }

  if (features.utilities) {
    lines.push("@import '../../utilities/flex';");
    lines.push("@import '../../utilities/visibility';");
  }

  lines.push("@import '../../critical';");
  lines.push('');
  return lines.join('\n');
}

/** Addon library CSS — pair with a page bundle; does not repeat reset/grid/tokens. */
function generateLibraryAppScss(features) {
  const lines = [
    "@charset 'utf-8';",
    '// GENERATED library build — addon CSS (load alongside a page app-*.css).',
    '',
  ];

  const settings = new Set();
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    for (const folder of STYLE_SETTINGS[key] || []) settings.add(folder);
  }

  if (settings.size > 0) {
    lines.push("@import '../../abstracts/functions';");
    lines.push("@import '../../settings/global';");
    for (const folder of [...settings].sort()) {
      lines.push(`@import '../../settings/${folder}';`);
    }
    lines.push("@import '../../abstracts/mixins';");
  }

  if (features.vendors?.swiper) lines.push("@import '../../vendors/swiper';");
  if (features.vendors?.animate) lines.push("@import '../../vendors/animate';");

  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) lines.push(`@import '../../components/${folder}';`);
  }

  lines.push('');
  return lines.join('\n');
}

function generateBuildEntry(buildName) {
  const { css } = buildOutputNames(buildName);
  const scssPath =
    buildName === 'full' ? '../../../scss/app.scss' : `../../../scss/builds/${buildName}/app.scss`;

  // Ternary so production build can tree-shake the Sass import (no CSS-in-JS).
  return `import './vendors.js';
import { initModules } from './modules.js';
import { boot } from '../../boot.js';

boot({
  initModules,
  cssHrefEndsWith: '${css}',
  loadDevScss: import.meta.env.DEV
    ? async () => {
        await import('${scssPath}');
      }
    : undefined,
});
`;
}

function writeFile(root, rel, content) {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** Sync shared indexes used by scss/app.scss (always = full build). */
export function syncFeatures(features = resolveBuild('full')) {
  const root = path.resolve('.');
  const writes = [
    ['scss/settings/_index.scss', generateSettingsIndex(features)],
    ['scss/components/_index.scss', generateComponentsIndex(features)],
    ['scss/vendors/_index.scss', generateVendorsIndex(features)],
    ['scss/layout/_index.scss', generateLayoutIndex(features)],
    ['scss/utilities/_index.scss', generateUtilitiesIndex(features)],
    ['scss/critical/_index.scss', generateCriticalIndex()],
    // Legacy paths still imported by older tooling / docs
    ['js/modules/index.js', generateModulesIndex(features, { moduleImportPrefix: './' })],
    ['js/vendors.js', generateVendorsJs(features)],
  ];

  for (const [rel, content] of writes) {
    writeFile(root, rel, content);
  }
}

/** Generate per-build JS entries + Sass entries for every key in `builds`. */
export function syncAllBuilds() {
  const root = path.resolve('.');
  syncFeatures(resolveBuild('full'));

  for (const name of listBuildNames()) {
    const features = resolveBuild(name);
    const kind = getBuildKind(name);

    writeFile(root, `js/builds/${name}/vendors.js`, generateVendorsJs(features));
    writeFile(
      root,
      `js/builds/${name}/modules.js`,
      generateModulesIndex(features, { moduleImportPrefix: '../../modules/' }),
    );
    writeFile(root, `js/builds/${name}/entry.js`, generateBuildEntry(name));
    writeFile(root, `scss/builds/${name}/app.scss`, generateBuildAppScss(features, { kind }));
  }

  // Keep root lib.js as a thin re-export of full entry for convenience
  writeFile(
    root,
    'js/lib.js',
    `/** @deprecated import js/builds/full/entry.js — kept for BC */\nimport './builds/full/entry.js';\n`,
  );
}

/** Vite plugin: regenerate all build entries when features.js changes. */
export function featuresPlugin() {
  return {
    name: 'lf-features',
    buildStart() {
      syncAllBuilds();
      this.addWatchFile(path.resolve('config/features.js'));
    },
    configureServer(server) {
      syncAllBuilds();
      const file = path.resolve('config/features.js');
      const criticalDir = path.resolve('scss/critical');
      server.watcher.add(file);
      server.watcher.add(criticalDir);
      const refresh = () => {
        syncAllBuilds();
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', (changed) => {
        const resolved = path.resolve(changed);
        if (resolved === file || resolved.startsWith(criticalDir + path.sep)) refresh();
      });
      server.watcher.on('add', (changed) => {
        if (path.resolve(changed).startsWith(criticalDir + path.sep)) refresh();
      });
      server.watcher.on('unlink', (changed) => {
        if (path.resolve(changed).startsWith(criticalDir + path.sep)) refresh();
      });
    },
  };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  syncAllBuilds();
  console.log('Features + builds synced from config/features.js');
  console.log(
    'Builds:',
    listBuildNames()
      .map((name) => `${name}(${getBuildKind(name)})`)
      .join(', '),
  );
}
