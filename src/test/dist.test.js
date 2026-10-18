/**
 * The built package.
 *
 * Everything else in this suite tests the sources. This tests what a consumer
 * actually installs: the ESM bundle, the CJS bundle, the declarations and the
 * two stylesheets. A library can pass every source test and still ship a
 * broken tarball — a missed external, a stylesheet that never got staged, an
 * export that exists in src/index.ts and not in the bundle.
 *
 * `build:package` runs before `npm test` in both prepublishOnly and
 * release:publish, so dist/ is always present on the paths that matter. When
 * it is absent — a bare `npm test` during development — these skip rather than
 * fail, and say so.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const built = existsSync(path.join(dist, 'index.js'));

const PUBLIC = [
  'Accordion', 'Badge', 'Button', 'Card', 'CardLayoutVertical',
  'EmptyState', 'Field', 'Progress', 'Switch', 'Toast',
];

describe.skipIf(!built)('the built package', () => {
  it('the ESM bundle exports exactly the public surface', async () => {
    const mod = await import(path.join(dist, 'index.js'));
    expect(Object.keys(mod).sort()).toEqual([...PUBLIC].sort());
  });

  it('the ESM bundle renders a component', async () => {
    const { Badge } = await import(path.join(dist, 'index.js'));
    const html = renderToStaticMarkup(
      createElement(Badge, { tone: 'success', label: 'Shipped' }),
    );
    expect(html).toContain('lumo-badge--success');
    expect(html).toContain('Shipped');
  });

  it('the CJS bundle exports the same surface and renders', () => {
    const require_ = createRequire(import.meta.url);
    const mod = require_(path.join(dist, 'index.cjs'));
    expect(Object.keys(mod).sort()).toEqual([...PUBLIC].sort());
    const html = renderToStaticMarkup(
      createElement(mod.Badge, { tone: 'danger', label: 'Blocked' }),
    );
    expect(html).toContain('lumo-badge--danger');
  });

  it('react is external, not bundled — two copies of React break hooks', () => {
    for (const file of ['index.js', 'index.cjs']) {
      const code = readFileSync(path.join(dist, file), 'utf8');
      // The bundle must *reference* react, never carry it.
      expect(code).not.toContain('ReactCurrentOwner');
      expect(code).not.toContain('react.production.min.js');
    }
  });

  it('ships declarations for both module formats', () => {
    expect(existsSync(path.join(dist, 'index.d.ts'))).toBe(true);
    expect(existsSync(path.join(dist, 'index.d.cts'))).toBe(true);
    const dts = readFileSync(path.join(dist, 'index.d.ts'), 'utf8');
    for (const name of PUBLIC) {
      expect(dts, `${name} missing from the declarations`).toContain(name);
    }
  });

  it('both stylesheets are staged, and tokens.css carries real values', () => {
    const styles = path.join(dist, 'styles.css');
    const tokens = path.join(dist, 'tokens.css');
    expect(existsSync(styles)).toBe(true);
    expect(existsSync(tokens)).toBe(true);

    // styles.css must import every component sheet it claims to.
    const css = readFileSync(styles, 'utf8');
    const imports = [...css.matchAll(/@import '\.\/(.+?)';/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const rel of imports) {
      expect(existsSync(path.join(dist, rel)), `${rel} imported but not shipped`).toBe(true);
    }

    // tokens.css must be the generated output, with both themes in it.
    const tok = readFileSync(tokens, 'utf8');
    expect(tok).toContain(':root');
    expect(tok).toContain('[data-theme="dark"]');
  });

  it('no component sheet is left importing its own CSS', () => {
    const code = readFileSync(path.join(dist, 'index.js'), 'utf8');
    expect(code).not.toMatch(/import\s+['"][^'"]+\.css['"]/);
  });
});

describe.skipIf(built)('the built package (not built)', () => {
  it('is not checked, because dist/ is absent — run build:package first', () => {
    expect(built).toBe(false);
  });
});
