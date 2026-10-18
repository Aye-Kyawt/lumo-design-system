# Versioning

What a version number of `@ds-house/lumo-design-system` means, and what a consumer may rely on
at one.

This file exists because `release-review` gate 7 asks for a written answer to exactly that, and
until now there was none — no `VERSIONING.md`, no changelog, no tags — so every component failed
that gate regardless of its own quality.

## The scheme

[Semantic versioning](https://semver.org), with the pre-1.0 rule stated rather than assumed.

| Change | Bump |
|---|---|
| A public component removed, renamed, or given a different default | major |
| A prop removed, renamed, or its type narrowed | major |
| A shipped CSS custom property renamed or removed | major |
| A new public component, a new optional prop, a new variant value | minor |
| A fix that changes no documented behaviour | patch |
| A change to a token's **value** (not its name) | patch |

## While the major version is 0

**Read this before depending on the package.**

Semver says that at `0.x` anything may change in a minor bump, and that applies here literally:
a `0.2.0` may remove a component, rename a prop or change a default that `0.1.0` documented. Pin
an exact version (`"@ds-house/lumo-design-system": "0.1.0"`, no caret) if that matters to you.

The `1.0.0` that ends this is not a date. It is the point at which every component in
`src/index.ts` has a `Cleared` release verdict and a reference page, because that is the first
moment the whole public surface has been independently reviewed.

## What is public

**Exactly the named exports of `src/index.ts`** — ten components as of `0.1.0` — plus the two
stylesheet entry points, `./styles.css` and `./tokens.css`, and the CSS custom property names
those sheets declare. `docs/public-api.md` records what was deliberately left internal.

Anything else is not API and may change in a patch: the eleven internal components, the file
layout inside `dist/`, the per-component sheets under `dist/components/`, source maps, and the
`.d.ts` internals beyond the exported signatures.

The custom property names are the part most easily forgotten. They are shipped, a consumer can
read and override them, so renaming one is a breaking change even though no JavaScript export
moved.

## What `0.1.0` specifically promises

Honestly and narrowly:

- it installs, and the ten components import and render under React 19 from both the ESM and
  the CJS build
- its declarations carry every public name
- both stylesheets load, and every sheet `styles.css` imports is in the tarball
- 146 tests cover every variant and state those components expose, and their documented
  accessibility semantics

**What it does not promise.** No component has a `Cleared` release verdict — the release reviews
could not be run, because the component registry is not reachable from the release machinery
yet. So nothing here has been independently reviewed against its Figma node by anything other
than the test suite, and the test suite compares each component against its own documented API,
which it agrees with by construction. There is no reference site yet either.

That is why this is `0.1.0` and not `1.0.0`, and the gap is recorded rather than papered over.

## How a version is cut

```bash
npm run release:publish -- <version> --dry-run   # rehearse, read the file list
npm run release:publish -- <version>             # for real
```

Never a plain `npm publish`. The script carries the gates, the registry check, and the
`"private": true` guard with a restore registered inline, on `exit` and on `SIGINT`. It runs
every gate again, refuses a version already on the registry, publishes, tags, and then installs
the published version into an empty folder and renders a component out of it.

`"private": true` lives in `package.json` on purpose, so a stray `npm publish` is refused.
`release:publish` is the only thing that lifts it.

## Tags and history

Each released version gets an annotated tag, `v<version>`, on the commit it was published from.
Tags are what make a version's history readable, and the first one is `v0.1.0`.

There is no `CHANGELOG.md` yet. Until there is, `git log` between two tags is the changelog, and
a release's report is the summary.
