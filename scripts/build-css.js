/**
 * build:css — stage the shipped stylesheets into dist/.
 *
 * Two outputs, both named in package.json's `exports`:
 *
 *   dist/styles.css  — src/styles.css, with its `@import` tree copied beside
 *                      it so the relative paths still resolve from dist/.
 *   dist/tokens.css  — the generated web token sheet, light then dark.
 *
 * Nothing is minified or rewritten. The files a consumer gets are the files
 * in the repo, which is the point: a token value should be traceable from the
 * installed package back to tokens/ without a bundler in the way.
 *
 * Deliberately not a bundler. Copying resolves the `@import` paths correctly
 * and adds no dependency, which `tools.md` asks for before reaching for one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

/** Component sheets ship; `*.stories.css` is Storybook scaffolding and does not. */
const isShipped = (file) => file.endsWith('.css') && !file.endsWith('.stories.css');

function copyComponentSheets() {
  const componentsRoot = path.join(root, 'src', 'components');
  let copied = 0;

  for (const component of fs.readdirSync(componentsRoot)) {
    const from = path.join(componentsRoot, component);
    if (!fs.statSync(from).isDirectory()) continue;

    for (const file of fs.readdirSync(from)) {
      if (!isShipped(file)) continue;
      const to = path.join(dist, 'components', component, file);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(from, file), to);
      copied += 1;
    }
  }
  return copied;
}

/**
 * The entry sheet must import every shipped component sheet. A sheet added to
 * a component folder and forgotten in src/styles.css would ship as a file
 * nothing loads, so this fails the build rather than publishing dead CSS.
 */
function checkEntrySheetIsComplete(entry) {
  const imported = new Set([...entry.matchAll(/@import\s+'\.\/(.+?)';/g)].map((m) => m[1]));
  const componentsRoot = path.join(root, 'src', 'components');
  const missing = [];

  for (const component of fs.readdirSync(componentsRoot)) {
    const from = path.join(componentsRoot, component);
    if (!fs.statSync(from).isDirectory()) continue;
    for (const file of fs.readdirSync(from)) {
      if (!isShipped(file)) continue;
      const rel = `components/${component}/${file}`;
      if (!imported.has(rel)) missing.push(rel);
    }
  }

  if (missing.length) {
    console.error('build:css — src/styles.css does not import every shipped sheet:');
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }
  return imported.size;
}

/**
 * The published token sheet is the **web** platform build. `mobile` and
 * `admin` are separate platforms with their own `:root` sheets; shipping all
 * three in one file would have them overwrite each other. Exposing them as
 * further export paths is a decision for whoever needs them — see
 * docs/public-api.md.
 */
function writeTokenSheet() {
  const sources = [
    path.join(root, 'build', 'css', 'web', 'tokens.css'),
    path.join(root, 'build', 'css', 'web', 'tokens-dark.css'),
  ];

  const absent = sources.filter((p) => !fs.existsSync(p));
  if (absent.length) {
    console.error('build:css — generated token CSS is missing. Run build:tokens first:');
    for (const p of absent) console.error(`  ${path.relative(root, p)}`);
    process.exit(1);
  }

  const banner =
    '/* Generated. Do not edit.\n' +
    ' * Built from tokens/ by build-tokens.js, staged by scripts/build-css.js.\n' +
    ' * Platform: web. Light mode on :root, dark mode on [data-theme="dark"].\n' +
    ' */\n\n';

  fs.writeFileSync(
    path.join(dist, 'tokens.css'),
    banner + sources.map((p) => fs.readFileSync(p, 'utf8')).join('\n'),
  );
}

const entry = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const importCount = checkEntrySheetIsComplete(entry);

fs.mkdirSync(dist, { recursive: true });
const copied = copyComponentSheets();
fs.copyFileSync(path.join(root, 'src', 'styles.css'), path.join(dist, 'styles.css'));
writeTokenSheet();

console.log(`build:css — dist/styles.css (${importCount} imports), ${copied} component sheets, dist/tokens.css`);
