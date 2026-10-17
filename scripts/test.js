/**
 * The test gate.
 *
 * There is no test suite in this repo. `tools.md` records that under "Not set
 * up yet": no `test` script, `vitest` not installed, nothing to run.
 *
 * `prepublishOnly` and `release:publish` were asked to run "tests", so this is
 * wired in as the thing they run. It exits non-zero, on purpose.
 *
 * The alternative was a script that prints "0 tests passed" and exits 0. That
 * would turn a missing gate into a green one and let a release report that it
 * cleared a check nobody wrote — the exact failure CLAUDE.md names ("Inventing
 * a token that does not exist. Report the gap instead and stop") and the same
 * reason the registry rule says a link to a build nobody looked at is a lie in
 * a cell.
 *
 * So publishing is blocked, by a real gap, loudly, rather than passing quietly.
 * Resolving it is a human decision, not an agent's:
 *
 *   - install a runner and write the suite, then replace this file; or
 *   - decide, in writing, that 0.1.0 ships without tests and say so here.
 *
 * Either way `tools.md` gets updated in the same change.
 */
const lines = [
  '',
  'npm test — FAIL: there is no test suite.',
  '',
  '  This is not a broken test run. No test runner is installed and no test',
  '  files exist. tools.md lists tests under "Not set up yet".',
  '',
  '  scripts/test.js is a deliberate stop, so that `prepublishOnly` and',
  '  `release:publish` cannot report a passing test gate that does not exist.',
  '',
  '  To unblock a release, a human decides one of:',
  '    1. add a runner + tests, and replace scripts/test.js; or',
  '    2. record that this version ships untested, and relax this gate.',
  '',
  '  Update tools.md in the same change either way.',
  '',
];

console.error(lines.join('\n'));
process.exit(1);
