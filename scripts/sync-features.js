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

const SETTINGS_PREFERRED = [
  'forms',
  'button',
  'menu',
  'accordion-menu',
  'drilldown',
  'dropdown-menu',
];

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
  dismiss: { file: '../../modules/dismiss.js', className: 'Dismiss' },
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

/** Collect optional settings folders for enabled style/layout/utilities flags. */
export function collectSettings(features) {
  const settings = new Set();
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    for (const folder of STYLE_SETTINGS[key] || []) settings.add(folder);
  }
  if (features.layout?.titleBar) settings.add('title-bar');
  if (features.layout?.topBar) settings.add('top-bar');
  if (features.utilities) settings.add('utilities');
  return settings;
}

export function orderSettings(settings) {
  return [
    ...SETTINGS_PREFERRED.filter((s) => settings.has(s)),
    ...[...settings].filter((s) => !SETTINGS_PREFERRED.includes(s)).sort(),
  ];
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

  for (const folder of orderSettings(collectSettings(features))) {
    lines.push(`@import '${folder}';`);
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
  const runtimeImport =
    moduleImportPrefix === './'
      ? "import { createModuleRuntime } from '../core/runtime.js';"
      : "import { createModuleRuntime } from '../../core/runtime.js';";

  const imports = [runtimeImport];
  const classes = [];

  for (const [key, on] of enabledEntries(features.scripts)) {
    const mod = SCRIPT_MODULES[key];
    if (!on || !mod) continue;
    const file =
      moduleImportPrefix === './'
        ? mod.file.replace('../../modules/', './')
        : mod.file;
    imports.push(`import { ${mod.className} } from '${file}';`);
    classes.push(`    ${mod.className},`);
  }

  return `${imports.join('\n')}

/**
 * Register and run enabled UI modules (see config/features.js builds).
 * GENERATED — do not edit by hand.
 */
const runtime = createModuleRuntime([
${classes.join('\n')}
]);

export const initModules = runtime.init;
export const destroyModules = runtime.destroy;
export const refreshModules = runtime.refresh;
export const unmountModules = runtime.unmount;
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
 * Page build: layered CSS with @layer for cascade control.
 * Paths relative to scss/builds/{name}/app.scss.
 */
function generateBuildAppScss(features, { kind = 'page' } = {}) {
  if (kind === 'library') {
    return generateLibraryAppScss(features);
  }

  const p = (rel) => `@import '../../${rel}';`;
  const lines = [
    "@charset 'utf-8';",
    '// GENERATED build entry — do not edit by hand.',
    '',
    '// Cascade layers (critical wins over utilities/components).',
    '@layer lf-reset, lf-base, lf-vendors, lf-layout, lf-components, lf-utilities, lf-critical;',
    '',
    p('abstracts/functions'),
  ];

  const core = required.settings.filter((s) => s !== 'css-variables');
  for (const folder of core) {
    lines.push(p(`settings/${folder}`));
  }
  for (const folder of orderSettings(collectSettings(features))) {
    lines.push(p(`settings/${folder}`));
  }
  lines.push(p('settings/css-variables'));
  lines.push(p('abstracts/mixins'));

  lines.push('');
  // One name per @layer block — `@layer a, b { ... }` is invalid CSS.
  lines.push('@layer lf-base {');
  lines.push(`  ${p('base')}`);
  lines.push('}');

  const vendorImports = [];
  if (features.vendors?.swiper) vendorImports.push(p('vendors/swiper'));
  if (features.vendors?.animate) vendorImports.push(p('vendors/animate'));
  if (vendorImports.length) {
    lines.push('');
    lines.push('@layer lf-vendors {');
    for (const line of vendorImports) lines.push(`  ${line}`);
    lines.push('}');
  }

  lines.push('');
  lines.push('@layer lf-layout {');
  lines.push(`  ${p('layout/containers')}`);
  lines.push(`  ${p('layout/grid')}`);
  if (features.layout?.titleBar) lines.push(`  ${p('layout/title-bar')}`);
  if (features.layout?.topBar) lines.push(`  ${p('layout/top-bar')}`);
  lines.push('}');

  const componentImports = [];
  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) componentImports.push(p(`components/${folder}`));
  }
  if (componentImports.length) {
    lines.push('');
    lines.push('@layer lf-components {');
    for (const line of componentImports) lines.push(`  ${line}`);
    lines.push('}');
  }

  if (features.utilities) {
    lines.push('');
    lines.push('@layer lf-utilities {');
    lines.push(`  ${p('utilities/flex')}`);
    lines.push(`  ${p('utilities/visibility')}`);
    lines.push('}');
  }

  lines.push('');
  lines.push('@layer lf-critical {');
  lines.push(`  ${p('critical')}`);
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

/** Addon library CSS — pair with a page bundle; no base/layout/critical. */
function generateLibraryAppScss(features) {
  const lines = [
    "@charset 'utf-8';",
    '// GENERATED library build — addon CSS (load alongside a page app-*.css).',
    '',
    '@layer lf-vendors, lf-components;',
    '',
  ];

  const settings = collectSettings({
    ...features,
    utilities: false,
    layout: { titleBar: false, topBar: false },
  });
  // library: only STYLE_SETTINGS, not utilities/layout bars
  const styleSettings = new Set();
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    for (const folder of STYLE_SETTINGS[key] || []) styleSettings.add(folder);
  }

  if (styleSettings.size > 0) {
    lines.push("@import '../../abstracts/functions';");
    lines.push("@import '../../settings/global';");
    for (const folder of [...styleSettings].sort()) {
      lines.push(`@import '../../settings/${folder}';`);
    }
    lines.push("@import '../../abstracts/mixins';");
  }

  const vendors = [];
  if (features.vendors?.swiper) vendors.push("@import '../../vendors/swiper';");
  if (features.vendors?.animate) vendors.push("@import '../../vendors/animate';");
  if (vendors.length) {
    lines.push('@layer lf-vendors {');
    for (const v of vendors) lines.push(`  ${v}`);
    lines.push('}');
  }

  const comps = [];
  for (const [key, on] of enabledEntries(features.styles)) {
    const folder = STYLE_FOLDERS[key];
    if (on && folder) comps.push(`@import '../../components/${folder}';`);
  }
  if (comps.length) {
    lines.push('@layer lf-components {');
    for (const c of comps) lines.push(`  ${c}`);
    lines.push('}');
  }

  lines.push('');
  return lines.join('\n');
}

function generateBuildEntry(buildName) {
  const { css } = buildOutputNames(buildName);
  const scssPath = `../../../scss/builds/${buildName}/app.scss`;

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

/** Sync shared indexes (docs / legacy tooling; full build features). */
export function syncFeatures(features = resolveBuild('full')) {
  const root = path.resolve('.');
  const writes = [
    ['scss/settings/_index.scss', generateSettingsIndex(features)],
    ['scss/components/_index.scss', generateComponentsIndex(features)],
    ['scss/vendors/_index.scss', generateVendorsIndex(features)],
    ['scss/layout/_index.scss', generateLayoutIndex(features)],
    ['scss/utilities/_index.scss', generateUtilitiesIndex(features)],
    ['scss/critical/_index.scss', generateCriticalIndex()],
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
}

/**
 * Vite plugin: regenerate build entries when features.js changes.
 * Sync on serve always; on build only when not orchestrated by scripts/build.js.
 */
export function featuresPlugin({ syncOnBuild = false } = {}) {
  return {
    name: 'lf-features',
    apply: syncOnBuild ? undefined : 'serve',
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
