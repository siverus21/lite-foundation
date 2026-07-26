import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import defaultFeatures, {
  required,
  builds,
  buildOutputNames,
  splitBuildConfig,
  getBuildKind,
} from '../config/features.js';

const __filename = fileURLToPath(import.meta.url);

/** Vite / tooling id: `import 'virtual:lf-scss/full'` → generated Sass string. */
export const VIRTUAL_SCSS_PREFIX = 'virtual:lf-scss/';
/** `import 'virtual:lf-entry/full'` → boot + modules for that build. */
export const VIRTUAL_ENTRY_PREFIX = 'virtual:lf-entry/';
export const VIRTUAL_MODULES_PREFIX = 'virtual:lf-modules/';
export const VIRTUAL_VENDORS_PREFIX = 'virtual:lf-vendors/';

/** Map style feature → scss/components folder name */
export const STYLE_FOLDERS = {
  modal: 'modal',
  slider: 'slider',
  sticky: 'sticky',
  titleBar: 'title-bar',
  topBar: 'top-bar',
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

/** Map script feature → { className, file } (file rewritten to /js/modules/... for virtual entries) */
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
  menuDropdown: { file: '../../modules/menu-dropdown.js', className: 'MenuDropdown' },
  menuAccordion: { file: '../../modules/menu-accordion.js', className: 'MenuAccordion' },
  menuDrilldown: { file: '../../modules/menu-drilldown.js', className: 'MenuDrilldown' },
  dismiss: { file: '../../modules/dismiss.js', className: 'Dismiss' },
};

function enabledEntries(map = {}) {
  return Object.entries(map).filter(([, on]) => on);
}

/** Known `vendors.*` flags — kept as a set (not a file-lookup map) since each has bespoke wiring below. */
export const KNOWN_VENDORS = new Set(['cash', 'swiper', 'animate']);

function assertKnownVendor(key) {
  if (!KNOWN_VENDORS.has(key)) {
    throw new Error(`Unknown vendor flag "${key}" — no entry in KNOWN_VENDORS (scripts/sync-features.js)`);
  }
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

/** Stylesheet load line for scss/critical partials (only remaining on-disk GENERATED index). */
function scssImport(rel, indent = '') {
  return `${indent}@import '${rel}';`;
}

/**
 * Virtual JS entries only — imports are always root-absolute (`/js/...`).
 * Throws on an unknown flag instead of silently dropping it — a typo'd/renamed
 * key here used to disable a whole module's behavior with no build-time signal.
 */
export function generateModulesIndex(features) {
  const imports = ["import { createModuleRuntime } from '/js/core/runtime.js';"];
  const classes = [];

  for (const [key, on] of enabledEntries(features.scripts)) {
    if (!on) continue;
    const mod = SCRIPT_MODULES[key];
    if (!mod) {
      throw new Error(`Unknown script flag "${key}" — no entry in SCRIPT_MODULES (scripts/sync-features.js)`);
    }
    const file = mod.file.replace('../../modules/', '/js/modules/');
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

/** Throws on an unknown `vendors.*` flag — same guard as styles/scripts above. */
export function generateVendorsJs(features) {
  const lines = ['// GENERATED — do not edit by hand.'];
  for (const [key] of enabledEntries(features.vendors)) {
    assertKnownVendor(key);
    if (key === 'cash') {
      lines.push("import $ from 'cash-dom';");
      lines.push('window.$ = $;');
    }
  }
  lines.push('');
  return lines.join('\n');
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
    ...partials.map((name) => scssImport(name)),
    '',
  ].join('\n');
}

/** `@include meta.load-css('rel');` — shared by page + library build sources. */
function loadCss(rel, indent = '  ') {
  return `${indent}@include meta.load-css('${rel}');`;
}

/**
 * Enabled vendor CSS loads (shared by page + library build sources).
 * Throws on an unknown `vendors.*` flag — same guard as styles/scripts below.
 */
function vendorLoads(features) {
  const loads = [];
  for (const [key] of enabledEntries(features.vendors)) {
    assertKnownVendor(key);
    if (key === 'swiper') loads.push(loadCss('vendors/swiper'));
    if (key === 'animate') loads.push(loadCss('vendors/animate'));
  }
  return loads;
}

/**
 * Enabled component CSS loads, in `styles.*` flag order (shared by page + library build sources).
 * Throws on an unknown flag instead of silently dropping it — a typo'd/renamed
 * key here used to disable a whole component's CSS with no build-time signal.
 */
function componentLoads(features) {
  const loads = [];
  for (const [key, on] of enabledEntries(features.styles)) {
    if (!on) continue;
    const folder = STYLE_FOLDERS[key];
    if (!folder) {
      throw new Error(`Unknown style flag "${key}" — no entry in STYLE_FOLDERS (scripts/sync-features.js)`);
    }
    loads.push(loadCss(`components/${folder}`));
  }
  return loads;
}

/**
 * Full Sass source for a named build (no files under scss/builds/).
 * `@use` + `meta.load-css` — partials pull members via `@use 'settings/vars'`.
 */
export function generateBuildScssSource(features, { kind = 'page' } = {}) {
  if (kind === 'library') {
    return generateLibraryAppScss(features);
  }

  const core = required.core || {};
  const layerOrder = [
    'lf-reset',
    'lf-base',
    'lf-vendors',
    'lf-layout',
    'lf-components',
    'lf-utilities',
    'lf-critical',
  ];

  const lines = [
    "@charset 'utf-8';",
    '// GENERATED build entry — @use + meta.load-css.',
    '',
    "@use 'sass:meta';",
    "@use 'settings/vars' as *;",
    "@use 'settings/css-variables';",
    '',
    '// Cascade layers (critical wins over utilities/components).',
    `@layer ${layerOrder.join(', ')};`,
    '',
  ];

  const resetPartials = core['lf-reset'] || [];
  if (resetPartials.length) {
    lines.push('@layer lf-reset {');
    for (const name of resetPartials) lines.push(loadCss(`core/${name}`));
    lines.push('}', '');
  }

  const basePartials = core['lf-base'] || [];
  if (basePartials.length) {
    lines.push('@layer lf-base {');
    for (const name of basePartials) lines.push(loadCss(`core/${name}`));
    lines.push('}');
  }

  const vendors = vendorLoads(features);
  if (vendors.length) {
    lines.push('', '@layer lf-vendors {', ...vendors, '}');
  }

  const layoutPartials = core['lf-layout'] || [];
  lines.push('', '@layer lf-layout {');
  for (const name of layoutPartials) lines.push(loadCss(`core/${name}`));
  lines.push('}');

  const components = componentLoads(features);
  if (components.length) {
    lines.push('', '@layer lf-components {', ...components, '}');
  }

  if (features.utilities) {
    lines.push(
      '',
      '@layer lf-utilities {',
      loadCss('utilities/flex'),
      loadCss('utilities/visibility'),
      '}',
    );
  }

  lines.push('', '@layer lf-critical {', loadCss('critical'), '}', '');
  return lines.join('\n');
}

/** Addon library CSS — pair with a page bundle; no core/critical. */
function generateLibraryAppScss(features) {
  const lines = [
    "@charset 'utf-8';",
    '// GENERATED library build — addon CSS (load alongside a page app-*.css).',
    '',
    "@use 'sass:meta';",
    "@use 'settings/vars' as *;",
    '',
    '@layer lf-vendors, lf-components;',
    '',
  ];

  const vendors = vendorLoads(features);
  if (vendors.length) {
    lines.push('@layer lf-vendors {', ...vendors, '}');
  }

  const components = componentLoads(features);
  if (components.length) {
    lines.push('@layer lf-components {', ...components, '}');
  }

  lines.push('');
  return lines.join('\n');
}

/** Resolve Sass source for a build key in `builds`. */
export function buildScssSource(buildName) {
  const features = resolveBuild(buildName);
  const kind = getBuildKind(buildName);
  return generateBuildScssSource(features, { kind });
}

function generateBuildEntry(buildName) {
  const { css } = buildOutputNames(buildName);

  return `import '${VIRTUAL_VENDORS_PREFIX}${buildName}';
import { initModules } from '${VIRTUAL_MODULES_PREFIX}${buildName}';
import { boot } from '/js/boot.js';

boot({
  initModules,
  cssHrefEndsWith: '${css}',
  loadDevScss: import.meta.env.DEV
    ? async () => {
        await import('${VIRTUAL_SCSS_PREFIX}${buildName}');
      }
    : undefined,
});
`;
}

/**
 * Skip the write when content is unchanged. `scss/critical/` is watched by
 * configureServer() to re-sync on change — an unconditional write would touch
 * the file's mtime every sync, re-trigger that watcher, and loop forever.
 */
function writeFile(root, rel, content) {
  const file = path.join(root, rel);
  try {
    if (readFileSync(file, 'utf8') === content) return;
  } catch {
    // file doesn't exist yet — fall through and create it
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/**
 * Dev/prod HTML entry: /js/load-build.js?build=full
 *
 * MUST use a static string literal per `import()` call — Vite's import-analysis
 * can't resolve `import(\`virtual:lf-entry/${build}\`)` (a template literal), so
 * the browser is left to fetch the literal string `virtual:lf-entry/full` as a
 * URL, which fails (`virtual:` isn't a registered protocol scheme). A `switch`
 * over the known build names keeps every `import()` argument statically analyzable.
 */
function generateLoadBuildJs() {
  const names = listBuildNames();
  return [
    '// GENERATED — do not edit by hand.',
    '// Dev/prod HTML entry: /js/load-build.js?build=full',
    "const build = new URL(import.meta.url).searchParams.get('build') || 'full';",
    '',
    'switch (build) {',
    ...names.map((name) => `  case '${name}': await import('${VIRTUAL_ENTRY_PREFIX}${name}'); break;`),
    '  default:',
    "    throw new Error(`Unknown build \"${build}\"`);",
    '}',
    '',
  ].join('\n');
}

/**
 * Sync the on-disk GENERATED files: scss/critical/_index.scss (real partials,
 * not virtual) and js/load-build.js (needs static per-build `import()` calls).
 * Everything else (settings, core, components, utilities, vendors, JS modules)
 * is resolved directly by name (`meta.load-css('core/reset')`, `settings/vars`,
 * `virtual:lf-modules/{build}`) — no aggregator index files needed.
 */
export function syncFeatures() {
  const root = path.resolve('.');
  writeFile(root, 'scss/critical/_index.scss', generateCriticalIndex());
  writeFile(root, 'js/load-build.js', generateLoadBuildJs());
}

/** Sync indexes only — JS/CSS entries are virtual (no js/builds or scss/builds). */
export function syncAllBuilds() {
  const root = path.resolve('.');
  syncFeatures();
  rmSync(path.join(root, 'scss/builds'), { recursive: true, force: true });
  rmSync(path.join(root, 'js/builds'), { recursive: true, force: true });
}

function resolveVirtualBuildId(id, prefix) {
  if (!id.startsWith(prefix) && !id.startsWith(`/${prefix}`)) return null;
  const raw = id.startsWith('/') ? id.slice(1) : id;
  if (!raw.startsWith(prefix)) return null;
  return raw.slice(prefix.length).replace(/\.(js|scss)$/, '');
}

/**
 * Vite plugin: virtual CSS/JS build entries + sync indexes when features.js changes.
 * `syncOnBuild: false` — skip the buildStart() sync (caller already synced once,
 * e.g. scripts/build.js runs 3 parallel per-name Vite builds off one `syncAllBuilds()`).
 */
export function featuresPlugin({ syncOnBuild = true } = {}) {
  return {
    name: 'lf-features',
    // runs on serve + build (virtual modules)
    resolveId(id) {
      const scssName = resolveVirtualBuildId(id, VIRTUAL_SCSS_PREFIX);
      if (scssName) return `\0${VIRTUAL_SCSS_PREFIX}${scssName}.scss`;

      const entryName = resolveVirtualBuildId(id, VIRTUAL_ENTRY_PREFIX);
      if (entryName) return `\0${VIRTUAL_ENTRY_PREFIX}${entryName}`;

      const modulesName = resolveVirtualBuildId(id, VIRTUAL_MODULES_PREFIX);
      if (modulesName) return `\0${VIRTUAL_MODULES_PREFIX}${modulesName}`;

      const vendorsName = resolveVirtualBuildId(id, VIRTUAL_VENDORS_PREFIX);
      if (vendorsName) return `\0${VIRTUAL_VENDORS_PREFIX}${vendorsName}`;

      return null;
    },
    load(id) {
      if (id.startsWith(`\0${VIRTUAL_SCSS_PREFIX}`) && id.endsWith('.scss')) {
        const name = id.slice(`\0${VIRTUAL_SCSS_PREFIX}`.length, -'.scss'.length);
        if (!listBuildNames().includes(name)) {
          throw new Error(`Unknown build "${name}" for ${VIRTUAL_SCSS_PREFIX}`);
        }
        return buildScssSource(name);
      }

      if (id.startsWith(`\0${VIRTUAL_ENTRY_PREFIX}`)) {
        const name = id.slice(`\0${VIRTUAL_ENTRY_PREFIX}`.length);
        if (!listBuildNames().includes(name)) {
          throw new Error(`Unknown build "${name}" for ${VIRTUAL_ENTRY_PREFIX}`);
        }
        return generateBuildEntry(name);
      }

      if (id.startsWith(`\0${VIRTUAL_MODULES_PREFIX}`)) {
        const name = id.slice(`\0${VIRTUAL_MODULES_PREFIX}`.length);
        if (!listBuildNames().includes(name)) {
          throw new Error(`Unknown build "${name}" for ${VIRTUAL_MODULES_PREFIX}`);
        }
        return generateModulesIndex(resolveBuild(name));
      }

      if (id.startsWith(`\0${VIRTUAL_VENDORS_PREFIX}`)) {
        const name = id.slice(`\0${VIRTUAL_VENDORS_PREFIX}`.length);
        if (!listBuildNames().includes(name)) {
          throw new Error(`Unknown build "${name}" for ${VIRTUAL_VENDORS_PREFIX}`);
        }
        return generateVendorsJs(resolveBuild(name));
      }

      return null;
    },
    buildStart() {
      if (syncOnBuild) syncAllBuilds();
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
