// The one place the site gets a version number.
//
// `version` is read from the repo root's package.json at build time, so the
// site cannot drift from it and nobody retypes it into a page.
//
// `tagged` is the honest part. As of 2026-10-16 this repo has **no git tags**,
// no CHANGELOG and no VERSIONING.md, and no component has reached `Released`
// in the registry — so the `1.0.0` in package.json is an untouched `npm init`
// default, not a release anybody cut. The hero says so rather than printing a
// number that implies a release happened.
//
// When a real version is cut: tag the commit, and set `tagged` to true here.
import pkg from '../../package.json';

export const version: string = pkg.version;

/** Has this version actually been released — tagged, with notes behind it? */
export const tagged = false;

/** Where the release card points. Null until there is something to point at. */
export const releaseNotesHref: string | null = null;
