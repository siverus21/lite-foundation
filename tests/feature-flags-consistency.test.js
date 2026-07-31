import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import defaultFeatures, { required, builds, getBuildKind } from '../config/features.js';
import {
  SCRIPT_MODULES,
  STYLE_FOLDERS,
  KNOWN_VENDORS,
  resolveBuild,
  listBuildNames,
  generateModulesIndex,
  generateVendorsJs,
  generateBuildScssSource,
} from '../scripts/sync-features.js';

/**
 * Guards against the class of bug where a `config/features.js` flag key
 * (e.g. `scripts.menus`) doesn't match any `SCRIPT_MODULES`/`STYLE_FOLDERS`
 * entry in `scripts/sync-features.js` — previously that mismatch silently
 * dropped the feature's CSS/JS from every build with no error anywhere.
 */
describe('feature flag keys match their sync-features.js registries', () => {
  it('every scripts.* key in the full preset has a SCRIPT_MODULES entry', () => {
    for (const key of Object.keys(defaultFeatures.scripts)) {
      expect(SCRIPT_MODULES, `scripts.${key}`).toHaveProperty(key);
    }
  });

  it('every styles.* key in the full preset has a STYLE_FOLDERS entry', () => {
    for (const key of Object.keys(defaultFeatures.styles)) {
      expect(STYLE_FOLDERS, `styles.${key}`).toHaveProperty(key);
    }
  });

  it('keeps styles.* / scripts.* keys alphabetically sorted in the full preset', () => {
    const styles = Object.keys(defaultFeatures.styles);
    const scripts = Object.keys(defaultFeatures.scripts);
    expect(styles).toEqual([...styles].sort());
    expect(scripts).toEqual([...scripts].sort());
  });

  it('does not keep orphan layout.* flags (titleBar/topBar belong under styles.*)', () => {
    expect(defaultFeatures.layout, 'use styles.titleBar / styles.topBar').toBeUndefined();
    for (const [buildName, raw] of Object.entries(builds)) {
      expect(raw.layout, `builds.${buildName}.layout`).toBeUndefined();
    }
  });

  it('every build override only uses known scripts/styles/vendors keys', () => {
    for (const [buildName, raw] of Object.entries(builds)) {
      for (const key of Object.keys(raw.scripts ?? {})) {
        expect(SCRIPT_MODULES, `builds.${buildName}.scripts.${key}`).toHaveProperty(key);
      }
      for (const key of Object.keys(raw.styles ?? {})) {
        expect(STYLE_FOLDERS, `builds.${buildName}.styles.${key}`).toHaveProperty(key);
      }
      for (const key of Object.keys(raw.vendors ?? {})) {
        expect(KNOWN_VENDORS.has(key), `builds.${buildName}.vendors.${key}`).toBe(true);
      }
    }
  });

  it('every vendors.* key in the full preset is a known vendor', () => {
    for (const key of Object.keys(defaultFeatures.vendors)) {
      expect(KNOWN_VENDORS.has(key), `vendors.${key}`).toBe(true);
    }
  });

  it('every enabled script module file exists on disk', () => {
    for (const [key, mod] of Object.entries(SCRIPT_MODULES)) {
      const file = path.resolve('js/modules', mod.file.replace('../../modules/', ''));
      expect(existsSync(file), `${key} -> ${mod.file}`).toBe(true);
    }
  });

  it('every scss/core/ partial referenced by required.core exists on disk', () => {
    for (const [layer, names] of Object.entries(required.core)) {
      for (const name of names) {
        const file = path.resolve('scss/core', `_${name}.scss`);
        expect(existsSync(file), `required.core.${layer}: ${name}`).toBe(true);
      }
    }
  });

  it('generating CSS + JS for every named build does not throw on unknown flags', () => {
    for (const name of listBuildNames()) {
      const features = resolveBuild(name);
      const kind = getBuildKind(name);
      expect(() => generateBuildScssSource(features, { kind }), `${name} (css)`).not.toThrow();
      expect(() => generateModulesIndex(features), `${name} (js)`).not.toThrow();
      expect(() => generateVendorsJs(features), `${name} (vendors js)`).not.toThrow();
    }
  });

  it('every enabled script flag actually reaches the generated JS entry', () => {
    for (const name of listBuildNames()) {
      const features = resolveBuild(name);
      const js = generateModulesIndex(features);
      for (const [key, on] of Object.entries(features.scripts)) {
        if (!on) continue;
        const mod = SCRIPT_MODULES[key];
        expect(js, `${name}: scripts.${key} -> ${mod.className}`).toContain(mod.className);
      }
    }
  });
});
