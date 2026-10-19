/**
 * Zero broken internal links, checked against the built output.
 *
 * astro-page requires this and nothing in the repo did it: `astro build`
 * exits 0 without ever looking at whether an internal href resolves, so
 * reporting the step as passed because the build succeeded would be reporting
 * a check that never ran.
 *
 * Walks every <a href> in dist/, keeps the site-internal ones, and resolves
 * each against the built file tree. External links are not fetched — that is a
 * different check, and a flaky network should not fail a build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
if (!fs.existsSync(dist)) {
  console.error('check-links — dist/ is absent. Run the build first.');
  process.exit(1);
}

const html = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) html.push(p);
  }
})(dist);

const exists = (urlPath) => {
  const clean = urlPath.replace(/[?#].*$/, '');
  const candidates = [
    path.join(dist, clean),
    path.join(dist, clean, 'index.html'),
    path.join(dist, `${clean.replace(/\/$/, '')}.html`),
  ];
  return candidates.some((c) => fs.existsSync(c));
};

let checked = 0;
const broken = [];
for (const file of html) {
  const src = fs.readFileSync(file, 'utf8');
  const from = path.relative(dist, file);
  for (const m of src.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;
    if (!href.startsWith('/')) continue; // relative hrefs are not emitted by Starlight
    checked += 1;
    if (!exists(href)) broken.push({ from, href });
  }
}

console.log(`check-links — ${checked} internal links across ${html.length} pages`);
if (broken.length) {
  console.error(`\n  ${broken.length} BROKEN:`);
  for (const b of broken) console.error(`    ${b.href}   (from ${b.from})`);
  process.exit(1);
}
console.log('  zero broken');
