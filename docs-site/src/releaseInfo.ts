// The one place the site gets a version number.
//
// `version` is read from the repo root's package.json at build time, so the
// site cannot drift from it and nobody retypes it into a page.
//
// `tagged` is the honest part, and it changed on 2026-10-19. This file used to
// say the repo had no git tags, no CHANGELOG and no VERSIONING.md, and that the
// number in package.json was an untouched `npm init` default rather than a
// release anybody cut. Two of those three are no longer true:
//
//   - @ds-house/lumo-design-system@0.1.0 is published on npm.
//   - v0.1.0 is an annotated tag on the commit it was published from.
//   - VERSIONING.md exists and states what the number means.
//
// There is still no CHANGELOG, and no component has a `Cleared` release
// verdict, so `releaseNotesHref` points at the tag rather than at notes nobody
// wrote. The hero should keep saying what is and is not behind this number.
//
// Note this is about the *design system's* version, not about components.
import pkg from '../../package.json';

export const version: string = pkg.version;

/** Has this version actually been released — tagged, with something behind it? */
export const tagged = true;

/**
 * Where the release card points. The tag, not release notes: there is no
 * CHANGELOG and no written notes, and pointing at a page that does not exist
 * would be worse than pointing at the commit the version was cut from.
 */
export const releaseNotesHref: string | null =
  'https://github.com/Aye-Kyawt/lumo-design-system/releases/tag/v0.1.0';
