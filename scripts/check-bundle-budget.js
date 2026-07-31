/**
 * Fail if dist JS/CSS (raw or gzip) exceeds budgets.
 * Run after `npm run build`. No CI metadata — local/script only.
 *
 * Budgets live here so a size regression fails the check without touching docs.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { buildOutputNames } from '../config/features.js';
import { listBuildNames } from './sync-features.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

/** Soft ceilings in bytes — generous vs current builds; tighten over time. */
const BUDGETS = {
  'lib.js': { raw: 120_000, gzip: 40_000 },
  'app.css': { raw: 220_000, gzip: 40_000 },
  'lib-about.js': { raw: 40_000, gzip: 15_000 },
  'app-about.css': { raw: 120_000, gzip: 25_000 },
  'lib-swiper.js': { raw: 160_000, gzip: 50_000 },
  'lib-swiper.css': { raw: 40_000, gzip: 15_000 },
};

function checkFile(name, budget) {
  const file = path.join(distDir, name);
  if (!existsSync(file)) {
    return { name, ok: false, reason: 'missing' };
  }
  const buf = readFileSync(file);
  const raw = buf.length;
  const gzip = gzipSync(buf).length;
  const failures = [];
  if (budget.raw != null && raw > budget.raw) {
    failures.push(`raw ${raw} > ${budget.raw}`);
  }
  if (budget.gzip != null && gzip > budget.gzip) {
    failures.push(`gzip ${gzip} > ${budget.gzip}`);
  }
  return {
    name,
    ok: failures.length === 0,
    raw,
    gzip,
    reason: failures.join(', ') || null,
  };
}

function main() {
  const names = listBuildNames();
  const results = [];

  for (const buildName of names) {
    const { css, js } = buildOutputNames(buildName);
    for (const name of [js, css]) {
      const budget = BUDGETS[name];
      if (!budget) continue;
      results.push(checkFile(name, budget));
    }
  }

  let failed = 0;
  for (const result of results) {
    if (result.ok) {
      console.log(
        `  ✓ ${result.name.padEnd(16)} raw ${result.raw}  gzip ${result.gzip}`,
      );
    } else {
      failed += 1;
      console.error(
        `  ✗ ${result.name.padEnd(16)} ${result.reason}${
          result.raw != null ? ` (raw ${result.raw}, gzip ${result.gzip})` : ''
        }`,
      );
    }
  }

  if (!results.length) {
    console.error('No budgeted dist files found — run npm run build first.');
    process.exit(1);
  }

  if (failed) {
    console.error(`\nBundle budget failed (${failed} file(s)).\n`);
    process.exit(1);
  }

  console.log(`\nBundle budget ok (${results.length} file(s)).\n`);
}

main();
