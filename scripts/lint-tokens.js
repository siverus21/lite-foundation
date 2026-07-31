/**
 * Lint SCSS for hardcoded colors / z-index that must use CSS variables.
 *
 * Scans: scss/{components,core,utilities}
 * Skips: scss/critical/ (emergency overrides) — only notifies that files exist
 *
 * Allows: var(--lf-…), and Sass fallbacks inside var(--lf-x, #{$sass-var})
 *
 * Usage: node scripts/lint-tokens.js
 * Exit 0 always (warnings only) unless --strict
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

const SCAN_DIRS = ['scss/components', 'scss/core', 'scss/utilities'];
const CRITICAL_DIR = 'scss/critical';

const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
/** Numeric rgb()/hsl() — e.g. `rgba(0, 0, 0, 0.5)`. */
const RGB = /\b(?:rgba?|hsla?)\(\s*\d/gi;
/** Sass-variable rgb()/hsl() — e.g. `rgba($black, 0.08)` (previously bypassed RGB). */
const RGB_SASS = /\b(?:rgba?|hsla?)\(\s*\$[\w-]+/gi;
const Z_INDEX = /z-index\s*:\s*-?\d+/gi;

const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  yellow: '\x1b[93m',
  magenta: '\x1b[95m',
  redBg: '\x1b[41m',
  magentaBg: '\x1b[45m',
  black: '\x1b[30m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.scss')) out.push(full);
  }
  return out;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/.*$/gm, '');
}

function lineAllowsLiteral(line) {
  // Consuming a token …
  if (/var\(\s*--lf-/.test(line)) return true;
  // … or defining one (`--lf-choice-focus-ring: #{rgba($color, 0.35)}`).
  if (/--lf-[\w-]+\s*:/.test(line)) return true;
  return false;
}

/** Lint a SCSS source string (exported for unit tests). */
export function lintSource(source, { rel = 'virtual.scss' } = {}) {
  const lines = stripComments(source).split('\n');
  const hits = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (lineAllowsLiteral(line)) return;

    for (const match of line.matchAll(HEX)) {
      hits.push({ line: i + 1, kind: 'color', value: match[0], text: trimmed });
    }
    for (const match of line.matchAll(RGB)) {
      hits.push({ line: i + 1, kind: 'color', value: match[0], text: trimmed });
    }
    for (const match of line.matchAll(RGB_SASS)) {
      hits.push({ line: i + 1, kind: 'color', value: match[0], text: trimmed });
    }
    for (const match of line.matchAll(Z_INDEX)) {
      hits.push({ line: i + 1, kind: 'z-index', value: match[0], text: trimmed });
    }
  });

  return { rel, hits };
}

function lintFile(file) {
  const rel = path.relative(root, file);
  const raw = readFileSync(file, 'utf8');
  return lintSource(raw, { rel });
}

/** List non-empty hotfix partials that should eventually move into components. */
export function warnCriticalOverrides() {
  const dir = path.join(root, CRITICAL_DIR);
  let names = [];
  try {
    names = readdirSync(dir)
      .filter((name) => /^_(?!index).+\.scss$/i.test(name))
      .sort();
  } catch {
    return { count: 0, files: [] };
  }

  const files = names.filter((name) => {
    const raw = readFileSync(path.join(dir, name), 'utf8');
    return raw.trim().length > 0;
  });

  if (!files.length) return { count: 0, files: [] };

  const banner = `${ansi.bold}${ansi.black}${ansi.magentaBg} CRITICAL STYLES ${ansi.reset}`;
  console.log('');
  console.log(
    `${banner} ${ansi.bold}${ansi.magenta}${files.length} file(s) in ${CRITICAL_DIR}/${ansi.reset}`,
  );
  console.log(
    `${ansi.dim}Not token-linted. Move rules into components/settings + --lf-* vars when you can.${ansi.reset}`,
  );
  for (const name of files) {
    console.log(`  ${ansi.yellow}•${ansi.reset} ${CRITICAL_DIR}/${name}`);
  }
  console.log('');

  return { count: files.length, files };
}

export function lintTokens({ strict = false } = {}) {
  warnCriticalOverrides();

  const files = SCAN_DIRS.flatMap((d) => walk(path.join(root, d))).filter(
    (f) => path.basename(f) !== '_index.scss',
  );
  const results = files.map(lintFile).filter((r) => r.hits.length);

  const total = results.reduce((n, r) => n + r.hits.length, 0);

  if (total === 0) {
    console.log(
      `${ansi.bold}${ansi.cyan}✓ token lint${ansi.reset} — no hardcoded colors / z-index in components`,
    );
    return { ok: true, total: 0, results };
  }

  const banner = `${ansi.bold}${ansi.black}${ansi.redBg} TOKEN WARNING ${ansi.reset}`;
  console.log('');
  console.log(
    `${banner} ${ansi.bold}${ansi.yellow}${total} hardcoded value(s) must use CSS variables (var(--lf-…))${ansi.reset}`,
  );
  console.log(
    `${ansi.dim}Define tokens in scss/settings/ + css-variables, then reference them in components.${ansi.reset}`,
  );
  console.log('');

  for (const { rel, hits } of results) {
    console.log(`${ansi.bold}${ansi.cyan}${rel}${ansi.reset}`);
    for (const hit of hits) {
      console.log(
        `  ${ansi.yellow}L${hit.line}${ansi.reset}  [${hit.kind}] ${ansi.bold}${hit.value}${ansi.reset}`,
      );
      console.log(`       ${ansi.dim}${hit.text}${ansi.reset}`);
    }
    console.log('');
  }

  if (strict) {
    console.error(`${banner} failing build (--strict)`);
  }

  return { ok: !strict, total, results };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  const strict = process.argv.includes('--strict');
  const { ok } = lintTokens({ strict });
  process.exit(ok ? 0 : 1);
}
