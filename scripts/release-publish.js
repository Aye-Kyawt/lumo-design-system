/**
 * release:publish — cut a version of the design system.
 *
 *   npm run release:publish -- 0.1.0
 *   npm run release:publish -- 0.1.0 --dry-run
 *
 * Order of business:
 *   1. refuse a dirty tree, a wrong branch, a bad version
 *   2. refuse if that version is already on the registry
 *   3. run every gate again — build:package, test, typecheck
 *   4. lift the `private` guard, publish, put the guard straight back
 *   5. tag
 *   6. install the published version into an empty folder and render a
 *      component out of it
 *
 * Step 4 is the dangerous one. `private: true` in package.json is what stops a
 * stray `npm publish`, and this command is the only thing allowed to remove
 * it. If the process dies between the removal and the restore, the repo is
 * left publishable by accident with nothing reporting it.
 *
 * So the restore is registered three ways, and `finally` is not one of them:
 *
 *   - inline, the statement after publish returns
 *   - on 'exit', which runs even when something calls process.exit()
 *   - on SIGINT, and on SIGTERM/SIGHUP, which end the process without
 *     unwinding the stack at all
 *
 * A `finally` block would cover none of the last two and only some of the
 * first: process.exit() does not run pending finally blocks, and a signal
 * default-kills the process outright. The restore is also synchronous and
 * idempotent, because an 'exit' handler cannot await anything and more than
 * one of these paths can fire for a single failure.
 *
 * Finally, the last thing the script does is read package.json back off disk
 * and assert the guard is there. Trusting the handler to have run is the same
 * class of mistake as writing a link to a build nobody opened.
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'package.json');
const GUARD_LINE = /^[ \t]*"private": true,\n/m;

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const version = argv.find((a) => !a.startsWith('-'));

const say = (msg) => console.log(msg);
const step = (n, msg) => console.log(`\n[${n}] ${msg}`);

function die(msg) {
  console.error(`\nrelease:publish — refused.\n  ${msg}\n`);
  process.exit(1);
}

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
}

function capture(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

/* ------------------------------------------------------------------ *
 * The guard
 * ------------------------------------------------------------------ */

/** Text of package.json as it was while the guard was in place. */
let guardedText = null;

/** Synchronous and idempotent — an 'exit' handler can be neither async nor re-entrant. */
function restoreGuard() {
  if (guardedText === null) return;
  const text = guardedText;
  guardedText = null;
  try {
    fs.writeFileSync(pkgPath, text);
    console.log('    guard restored: "private": true is back in package.json');
  } catch (err) {
    // Nothing above us will report this, so it has to be unmissable.
    console.error(
      '\n!! release:publish COULD NOT RESTORE THE PUBLISH GUARD !!\n' +
        `   ${err.message}\n` +
        '   package.json may be left without "private": true, which means a\n' +
        '   stray `npm publish` will go through. Put this line back by hand,\n' +
        '   inside the top-level object, before doing anything else:\n' +
        '       "private": true,\n',
    );
  }
}

function liftGuard() {
  const text = fs.readFileSync(pkgPath, 'utf8');
  const matches = text.match(new RegExp(GUARD_LINE.source, 'gm')) ?? [];
  if (matches.length !== 1) {
    die(
      `expected exactly one \`"private": true,\` line in package.json, found ${matches.length}. ` +
        'Not touching it — fix package.json by hand.',
    );
  }
  guardedText = text;
  fs.writeFileSync(pkgPath, text.replace(GUARD_LINE, ''));
  say('    guard lifted: "private": true removed for this command only');
}

// Registered before anything can lift the guard, so there is no window in
// which it is down and unwatched.
process.on('exit', restoreGuard);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    console.error(`\nrelease:publish — ${signal}. Restoring the publish guard before exit.`);
    restoreGuard();
    process.exit(signal === 'SIGINT' ? 130 : 1);
  });
}
process.on('uncaughtException', (err) => {
  console.error(`\nrelease:publish — crashed: ${err?.stack ?? err}`);
  restoreGuard();
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error(`\nrelease:publish — unhandled rejection: ${err?.stack ?? err}`);
  restoreGuard();
  process.exit(1);
});

/* ------------------------------------------------------------------ *
 * 1. Arguments and repo state
 * ------------------------------------------------------------------ */

if (!version) {
  die('no version given. Usage: npm run release:publish -- <version> [--dry-run]');
}
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  die(`"${version}" is not a plain semver version, e.g. 0.1.0 or 0.2.0-rc.1`);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const { name } = pkg;
const spec = `${name}@${version}`;

say(`release:publish — ${spec}${dryRun ? '  (dry run)' : ''}`);

step(1, 'Repo state');
if (capture('git status --porcelain')) {
  die('working tree is dirty. Commit or stash first — a release must be reproducible from a commit.');
}
const branch = capture('git rev-parse --abbrev-ref HEAD');
// CLAUDE.md: main accepts PRs from staging only. A release is cut from main.
if (branch !== 'main' && !dryRun) {
  die(`on branch "${branch}". A release is cut from main. Use --dry-run to rehearse from here.`);
}
if (capture(`git tag --list v${version}`)) {
  die(`tag v${version} already exists locally.`);
}
say(`    branch ${branch}, tree clean`);

/* ------------------------------------------------------------------ *
 * 2. Registry
 * ------------------------------------------------------------------ */

step(2, 'Registry check');
let published = null;
try {
  published = capture(`npm view ${spec} version`);
} catch (err) {
  const text = `${err.stdout ?? ''}${err.stderr ?? ''}`;
  if (/E404|is not in this registry|no such package/i.test(text)) {
    published = null; // not published — which is what we want
  } else {
    die(`could not reach the registry to check ${spec}:\n  ${text.trim().split('\n').slice(0, 4).join('\n  ')}`);
  }
}
if (published) {
  die(
    `${spec} is already on the registry. Versions are immutable — pick a new one. ` +
      'Never unpublish and re-push a version somebody may have installed.',
  );
}
say(`    ${spec} is not on the registry`);

/* ------------------------------------------------------------------ *
 * 3. Every gate, again
 * ------------------------------------------------------------------ */

step(3, 'Gates');
say('    npm run build:package');
run('npm run build:package');
say('    npm test');
run('npm test');
say('    npm run typecheck');
run('npm run typecheck');

/* ------------------------------------------------------------------ *
 * 4. Version, publish, restore
 * ------------------------------------------------------------------ */

step(4, 'Publish');

if (dryRun) {
  // The lift/restore round trip is the part worth rehearsing, so a dry run
  // still does it. Note what this does NOT prove: `npm publish --dry-run`
  // never reaches the `private` check at all. In npm 11.12.1 the EPRIVATE
  // throw lives in libnpmpublish/lib/publish.js, and lib/commands/publish.js
  // only calls it `if (!dryRun)` — so a dry run of a private package exits 0
  // whether the guard is up or down. The guard is real on a true publish; a
  // dry run just cannot demonstrate it.
  //
  // The version in package.json is left alone: a rehearsal that edits the
  // manifest is not a rehearsal.
  liftGuard();
  run('npm publish --dry-run');
  restoreGuard(); // inline; the handlers are a net, not the plan
} else {
  run(`npm version ${version} --no-git-tag-version --allow-same-version`);
  liftGuard();
  run('npm publish');
  restoreGuard(); // inline; the handlers are a net, not the plan
}

// Do not take the handler's word for it.
const after = fs.readFileSync(pkgPath, 'utf8');
if (!GUARD_LINE.test(after)) {
  console.error(
    '\n!! THE PUBLISH GUARD IS NOT BACK IN package.json !!\n' +
      '   Add `"private": true,` to the top-level object before anything else.\n',
  );
  process.exit(1);
}
say('    verified on disk: the guard is back');

/* ------------------------------------------------------------------ *
 * 5. Tag
 * ------------------------------------------------------------------ */

step(5, 'Tag');
if (dryRun) {
  say(`    skipped — dry run would tag v${version}`);
} else {
  run(`git add package.json package-lock.json`);
  // Commit only if the version bump actually changed something. `npm version`
  // at the version package.json already carries writes the same value back, so
  // there may be no diff -- and an unconditional `git commit` would throw here,
  // AFTER the publish had succeeded, leaving the package on the registry with
  // no tag behind it. The tag is the point of this step; the commit is not
  // worth failing it for.
  const staged = capture('git diff --cached --name-only');
  if (staged) {
    run(`git commit -m "Release ${version}"`);
  } else {
    say('    no version diff to commit -- package.json already read ' + version);
  }
  run(`git tag -a v${version} -m "${name} ${version}"`);
  say(`    tagged v${version} locally. Push it yourself when you mean to:`);
  say(`        git push origin ${branch} --follow-tags`);
}

/* ------------------------------------------------------------------ *
 * 6. Install it somewhere else and render something
 * ------------------------------------------------------------------ */

step(6, 'Consumer smoke test');
if (dryRun) {
  say('    skipped — nothing was published to install');
} else {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumo-release-'));
  say(`    ${dir}`);

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'lumo-release-smoke', private: true, type: 'module' }, null, 2),
  );
  // react and react-dom are peers; installed explicitly so the test does not
  // depend on the package manager's auto-peer behaviour.
  execFileSync('npm', ['install', '--silent', spec, 'react', 'react-dom'], {
    cwd: dir,
    stdio: 'inherit',
  });

  fs.writeFileSync(
    path.join(dir, 'render.mjs'),
    [
      "import { createElement } from 'react';",
      "import { renderToStaticMarkup } from 'react-dom/server';",
      `import { Badge } from '${name}';`,
      '',
      "const html = renderToStaticMarkup(createElement(Badge, { tone: 'success', label: 'Shipped' }));",
      'console.log(html);',
      "if (!html.includes('lumo-badge--success') || !html.includes('Shipped')) {",
      "  console.error('the installed package did not render the expected markup');",
      '  process.exit(1);',
      '}',
    ].join('\n'),
  );

  const html = capture('node render.mjs', { cwd: dir });
  say(`    rendered from the published package: ${html}`);

  // Both stylesheets must actually be reachable at their export paths.
  for (const sub of ['styles.css', 'tokens.css']) {
    const resolved = capture(
      `node --input-type=module -e "import.meta.resolve ? console.log(import.meta.resolve('${name}/${sub}')) : process.exit(1)"`,
      { cwd: dir },
    );
    if (!resolved) die(`${name}/${sub} does not resolve from the installed package`);
    say(`    ${name}/${sub} resolves`);
  }

  fs.rmSync(dir, { recursive: true, force: true });
}

say(`\nrelease:publish — ${dryRun ? 'dry run complete. Nothing was published.' : `${spec} published and tagged.`}\n`);
