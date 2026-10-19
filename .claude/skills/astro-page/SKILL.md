---
name: astro-page
description: Builds the whole Astro Starlight reference site from the repo every run — home, component pages, tokens, changelog, roadmap, news — then verifies every live page before writing any link to the board. Never generates one page at a time, and never invents a source it does not have.
---

# Build the docs site

## When to use this

Use this when the reference site needs to be rebuilt: a component shipped, an intent file
changed, tokens changed, a guide stopped being true. Also use it when nothing in particular
changed and the site needs re-verifying against the repo.

Do not use it to add one page. There is no mode that does that, on purpose — see below.

> ## ⚠️ Two things here contradict the repo. Resolve them before the first run.
>
> **Fonts.** This skill says fonts are self-hosted. `CLAUDE.md` says *"Install required font and
> load properly from Google Font CDN"*, and `docs-site/astro.config.mjs` currently loads Inter
> and Material Symbols from `fonts.googleapis.com`. Self-hosting is the better answer for a
> docs site — no third-party request, no layout shift, no dependency on a CDN being reachable —
> but it is not the answer `CLAUDE.md` gives. **Changing it means changing `CLAUDE.md` in the
> same commit.** Do not quietly do one without the other, and do not quietly do neither.
> **Owner: a human.**
>
> **The sidebar is a full restructure.** The order below replaces the sidebar
> `docs-site/astro.config.mjs` carries today (Start here · Atoms · Molecules · Organisms ·
> Tokens · Figma vs the repo). The existing one is organised by atomic level, which is how the
> registry's `Category` column thinks; the one below is organised by audience. Both are
> defensible. The restructure retires `disagreements.mdx` from the navigation, and that page is
> the record of where Figma and the repo disagree — **say where it went** rather than letting it
> fall out of the nav. **Owner: a human.**

## The one rule

**Build the whole site every run. Never one page at a time.**

The reason is that every page is derived from the same pinned commit, and a site built a page at
a time is a site whose pages were derived from different ones. A component page saying a prop
exists, next to a Code tab generated two commits earlier saying it does not, is worse than
either page alone: the reader has no way to know which is current, and the inconsistency is
invisible from inside any single page.

So: one run, one pinned commit, every generated page rewritten. A run that touches one page is a
bug in the run, not an optimisation.

## The format to match

<https://horizon-docs-alpha.vercel.app>

Match its structure and its density — the header strip, the tabbed component page, the splash
home. Do not copy its words, its components or its design system; it is a reference for shape.

## Where it lives

| | |
|---|---|
| Folder | `docs-site/` — its own npm package, own `package.json`, own lockfile, own `node_modules`. Not a workspace of the root |
| Branch | **`main`.** The site deploys from `main`, which is the project's production branch. `docs-site/vercel.json` there carries the build config and a per-branch `deploymentEnabled` that lets `main` and `astro` deploy and stops every other branch. The earlier design used a long-lived `astro` branch; `tools.md` records why it was dropped |
| Vercel project | `lumo-reference-site` |
| Live URL | `tools.md` records it. **Read it from there**, never from memory |

`tools.md` is the source of truth for all four, and for the trap that matters here: a
**per-deployment** Vercel URL sits behind Deployment Protection and answers a login page with a
**200**, so verifying against one proves nothing. Verify against the production alias.

Two branch facts that will bite a run that ignores them. `astro` and `main` diverge permanently
on `docs-site/vercel.json`, so a merge between them must keep `astro`'s side. And the production
branch may still be `main` rather than `astro` — check, because if it is, pushing `astro` updates
no live page and every "after deploying" check below is measuring the previous deployment.

## Generated, and written

**Generated — never edited by hand.** Home, All components, every component page, Tokens,
Changelog, Roadmap, News.

Everything generated is written by **one script**, `docs-site/scripts/generate.mjs`, from exactly
four inputs:

1. **The repo at a pinned commit.** Pin it once at the start of the run and record the sha in
   every generated page. Not `HEAD` read repeatedly — a long run would drift across commits.
2. **The board's statuses**, in a source file the agent writes each run. **No record IDs.**
   Airtable record IDs are a local decision (`.claude/registry.local.json`, gitignored) and must
   not reach a public page or the repo. Component name, status, version — nothing that identifies
   a row.
3. **The live Figma reads**, in a source file the agent writes each run. Read over the Figma MCP
   connection at run time, then written down, so the script itself is deterministic and the reads
   are reviewable.
4. **The deployed Storybook's `index.json`**, for the story list. The deployed index, not a local
   build — the Examples tab embeds the deployed Storybook, so the list has to come from the same
   place the embeds point at.

A generated page carrying a sentence that came from none of those four is invented. The two
source files exist precisely so that "where did this come from" has an answer in the repo.

**Written from the repo — every guide.** The guides are prose a human owns, but they are not
exempt from the repo: **each run re-reads every guide against the code and corrects any sentence
that stopped being true.** A guide that says `main` is the default export, or names a prop that
was renamed, is corrected in that run. Correct the sentence; do not rewrite the guide's voice,
and do not delete a section because the code moved — if a guide documents something that no
longer exists, say so in place.

## The sidebar

Written out explicitly in `docs-site/astro.config.mjs`, in this order. **Explicit, not
autogenerated**: with an explicit list a missing page fails the build, and with autogeneration it
silently vanishes from the navigation. Failing loudly is the point.

```
Get Started   Changelog · Roadmap · News · Versioning · Upgrading
Designing     Introduction
Developing    Introduction · React · React Router
Skills        Knowledge skill
Core          Components (All components, then one page per component) · Tokens
Styling       Theming
Help          FAQ · Report a bug · Request a feature · Contributing · Embedding
```

Under **Core → Components**, "All components" comes first, then one entry per component, in the
order the board gives.

Note what this list asks for that the repo does not have: **Versioning**. There is no
`VERSIONING.md`, no `CHANGELOG`, and no git tags. That page is a missing source, not a page to
write from imagination — see *Missing source*.

## Home

A splash page.

- **Hero line** — the first paragraph of `README.md`. Transpose it; do not improve it. Note that
  today that paragraph describes the *token pipeline* ("Design tokens exported from the Figma
  file…"), not the design system as a thing to use, so the hero will read oddly. **That is a
  finding to report, not a licence to write a better one.** The fix is to the README, by a human.
- **Buttons** — `Start designing`, `Start coding`, `Open Storybook`, in that order. The first two
  point at the Designing and Developing introductions; the third at the **production** Storybook
  URL from `tools.md`.
- **The latest release**, with its install command. The install command is derived from
  `package.json`'s `name` and the released version — not typed out, so it cannot drift from the
  package. With no release, this is a missing source: keep the section, show the notice.
- **Link cards** to Designing, Developing, Components and Tokens.

## The component page

### The header strip

Status, and the version it shipped in. Then links to **Storybook**, the **Figma node**, and the
**source**.

Status comes from the board source file. The version it shipped in comes from the release record
— which does not exist yet, so expect the notice here on every component until it does.

### Five tabs, in this order

**Usage** — from the intent file, `src/components/<name>/<name>.intent.json`. Nothing on this tab
originates here: this tab is `component-intent`'s output, published.

- when to use — `use_when`
- where it goes — `placement`
- when not to — `dont_use_when`, **each with its alternative**
- best practice — from the Figma usage region
- what each variant is for — `variant_intent`
- accessibility facts, **each linked to the source line that makes it true** — `a11y`
- composition — `pairs_with`
- what this version promises

An empty `use_when` renders as the notice, naming that the Figma usage region is missing. It does
not render as an empty heading, and it is never filled in here.

**Examples** — the `README.md` usage example first, then **every story that is not a
variant-matrix row**, each embedded live from the deployed Storybook, **in light and in dark**.

Matrix rows belong on the Design tab; repeating them here makes Examples a second matrix instead
of a set of worked examples. The theme is set by the Storybook global the preview already reads:

```
<storybook>/iframe.html?id=<story-id>&globals=theme:light
<storybook>/iframe.html?id=<story-id>&globals=theme:dark
```

`.storybook/preview.jsx` defines `theme`, `platform` and `breakpoint` as globals, so the embed
drives the real toolbar rather than a copy of it. Story ids come from the deployed `index.json`.

**Code** — the types.

- the import line, taken from `src/index.ts` — if the component is not exported there, say so
  rather than showing an import that will not resolve
- props, with defaults and their doc comments, read from the JSDoc on the component
- union types, written out
- the tokens it needs, with **light and dark values**, from `required_tokens` resolved against
  `build/css/web/tokens.css` and `tokens-dark.css`
- Storybook's own props table, embedded

**Design** — the design.

- the Figma node, embedded
- the variant matrix, with every matrix story linked
- both themes
- **every value Figma never bound** — the unbound properties, named
- the design gaps recorded against it, from `docs/<name>.md`

This tab is where the disagreements live. Do not soften them: the whole value of recording that
Figma bound no value for a property is that the next person does not re-guess it.

**Changelog** — `git log` for the component **and its subcomponents**, each commit marked with
the version it shipped in.

Subcomponents matter: a change to `switchKnob.jsx` changes `Switch`, and a changelog that reads
only the parent file misses it.

```
git log --oneline <pinned-sha> -- src/components/<name>/
```

With no tags, no commit can be marked with a version. Show the commits and the notice.

## Tokens, Changelog, Roadmap, News

**Tokens** — generated from the built output, not from `tokens/`. Light and dark values together.

**Changelog** (site-level) — from git history, marked with versions when versions exist.

**Roadmap and News** — **state no date, owner or priority that a source does not state.**

This is the field most likely to go wrong, because a roadmap with no dates looks unfinished and a
plausible quarter is easy to write. A date nobody committed to is read as a commitment. If the
source says "next", the page says "next" — not "Q1". If no source names an owner, the page names
none. An item with nothing but a title is published with nothing but a title.

## Styling

**One stylesheet** maps Starlight's own CSS variables onto this system's semantic tokens, and
**contains no hex of its own**. Starlight's variables are the seam; the values behind them are
always `var(--color-…)`.

A hex in that file is the same failure as a hex in a component, with the same consequence: the
site stops being evidence of its own tokens. The existing `docs-site/src/styles/lumo.css` is
where this lives.

Dark mode is the system's dark mode, not a second palette. The generated `tokens-dark.css` is
scoped to `[data-theme="dark"]`, which is the attribute Starlight's own theme toggle sets — so
the two line up with nothing to maintain.

**Fonts are self-hosted.** See the banner: this contradicts `CLAUDE.md` and needs a human.

## Missing source

**Keep the section in place, with a notice naming exactly what is missing.** Never invent, and
never silently drop the section.

A dropped section is indistinguishable from a section that was never meant to exist. A notice
says: this belongs here, it is missing, here is what would fill it. Name the thing and its owner.

> **No release record.** This component has not shipped in a numbered version. There are no git
> tags and no `VERSIONING.md` in the repo, so there is nothing to report here yet.

Expect notices, today, for: the version in every component header strip, the latest release on
Home, the Versioning page, every changelog's version markers, and `use_when` / `dont_use_when` on
any component whose Figma documentation page has no usage region.

A site that is honestly mostly notices is a correct output of this skill. A site that reads
complete because the gaps were filled in is a failure of it.

## Steps

### 1 · Pin, and gather

Pin the commit. Read `tools.md` for the folder, project and live URL. Write the two source
files: the board's statuses (no record IDs) and the live Figma reads. Fetch the deployed
Storybook's `index.json`.

**Check:** the sha is pinned and recorded, both source files exist, `index.json` parsed, and the
live URL came from `tools.md`.

### 2 · Generate

Run `docs-site/scripts/generate.mjs`. It writes Home, All components, every component page,
Tokens, Changelog, Roadmap and News from the four inputs and nothing else.

**Check:** every generated page carries the pinned sha; no generated page contains a sentence
without one of the four inputs behind it.

### 3 · Re-read the guides against the code

Every guide. Correct each sentence that stopped being true; leave the voice alone.

**Check:** every guide was read this run, and each correction names what changed under it.

### 4 · Build, with zero broken internal links

```
npm --prefix docs-site run build
```

Zero broken internal links is a requirement, not an aspiration. **Nothing in the repo currently
checks this** — there is no link checker installed, and `tools.md`'s dependency rule says to say
so rather than adding one quietly. Either add the check to `generate.mjs` by walking the built
HTML in `docs-site/dist/` against the file tree, or install a checker and record why in
`tools.md`. Do not report this step as passed because the build exited 0; the build does not
look at internal links.

**Check:** the build exits 0 **and** a link check ran and found nothing.

### 5 · Look at it, before pushing

Open, locally: the **home page**, **one component page with every one of its five tabs**, and
**Tokens**. Each in **light and in dark**.

Looking is the step. The build exiting 0 says the pages compiled, not that a tab has content,
that an embed loaded, or that dark mode resolves.

**Check:** ten views seen — home, a component page's five tabs, and Tokens, each in both themes.

### 6 · Push

Land the run on `main`, by pull request through `staging` — `CLAUDE.md` says main accepts PRs
from staging only, and that is not relaxed for this. The merge to `main` is what deploys.

Then confirm the deployment you are about to verify is **this** one: find the deployment for the
merge commit and check it reads success, rather than reading the project's latest deployment and
assuming. A production deployment from an older commit will serve a site that looks right and is
not yours.

**Check:** the deployment finished, it is a Production deployment, and it was built from a commit
containing the pinned sha.

### 7 · Verify the live site

**Fetch every live page.** Each returns **200**.

On **every component page**: all five tabs present, **each with content**. A tab that renders
its heading and nothing else is a failure, not a pass.

**Every header link returns 200** — Storybook, Figma, source. The one allowed exception: a Figma
link to a team-only file may answer **403**. Nothing else may.

**Check:** every page 200; every component page five tabs with content; every header link 200,
or 403 only for a team-only Figma file.

### 8 · Only now, write to the board

Write each component's `Astro Link` — the deep link to its page.

**If verification failed, write nothing and report it.** Not the pages that passed, not "most of
it worked". The cell says the component is documented; a cell written from a half-verified run
says that falsely, and `Astro Link` feeds the `Development` ladder, so a wrong one moves a
component's status.

**Check:** either every check in step 7 passed and every link is written, or nothing is written
and the report says why.

## Never

- **Never generate one page.** The whole site, from one pinned commit, every run.
- **Never invent.** Not a date, not an owner, not a priority, not a usage rule, not a hero line.
- **Never edit a generated page by hand.** Fix `generate.mjs` or fix its inputs.
- **Never edit an intent file.** Usage is published from it, never written into it.
- **Never put a hex in the stylesheet.**
- **Never put an Airtable record ID in a source file or a page.**
- **Never write `Astro Link` from a run whose verification failed.**
- **Never verify against a per-deployment Vercel URL.** It answers a login page with a 200.
- **Never touch a component.** This skill reads `src/`; it does not write to it.

## References

- Where the site lives, the project, the live URL, the per-branch `vercel.json` split, and the
  Deployment Protection trap: `tools.md`
- The intent files that become the Usage tab:
  `.claude/skills/component-intent/SKILL.md`
- What a review will check about them: `.claude/skills/release-review/SKILL.md`
- The board's columns, who owns `Astro Link`, and the `Development` ladder:
  `.claude/skills/registry/SKILL.md` — note `Astro Link` ownership is contested, Flag 7
- Storybook globals the embeds drive: `.storybook/preview.jsx`
- Design gaps for the Design tab: `docs/<name>.md`
- The public surface for the Code tab's import line: `src/index.ts`, `docs/public-api.md`
- Fonts, naming and the token rule: `CLAUDE.md`

## Self-check

- [ ] One pinned commit, recorded on every generated page
- [ ] The whole site regenerated — not one page
- [ ] Both source files written this run, and neither contains a record ID
- [ ] Story list and embeds both come from the **deployed** Storybook
- [ ] Sidebar written out explicitly, in the given order
- [ ] Hero line is the README's first paragraph, unimproved
- [ ] Every component page has all five tabs, in order
- [ ] Every `dont_use_when` on the Usage tab shows its alternative
- [ ] Every a11y fact links to its source line
- [ ] Examples excludes variant-matrix rows; Design has them, linked
- [ ] Every embed appears in light **and** dark
- [ ] Changelog covers subcomponents, not just the parent file
- [ ] Roadmap and News state no date, owner or priority a source did not state
- [ ] The stylesheet contains no hex
- [ ] Every missing source is a notice naming what is missing and its owner
- [ ] Guides re-read against the code this run
- [ ] Build exits 0 **and** a link check ran and found nothing
- [ ] Home, one component page's five tabs, and Tokens, seen locally in both themes
- [ ] The run landed on `main` by PR through `staging`, and the **Production** deployment for that merge commit reads success
- [ ] Every live page 200; every header link 200, or 403 only for team-only Figma
- [ ] `Astro Link` written only because every one of those passed

## Open questions for a human

1. **Fonts.** Self-hosted here, Google Fonts CDN in `CLAUDE.md`. One of the two has to change.
2. ~~The sidebar restructure, and where `disagreements.mdx` goes.~~ **Settled 2026-10-19.** The
   audience-ordered sidebar is live; `disagreements.mdx` is kept, out of the nav, and linked from
   each component's Design tab and from Contributing.
3. **Versioning — partly settled.** `VERSIONING.md` exists, the Versioning page is generated, and
   `v0.1.0` is a real tag, so the Home release block and the Versioning page no longer render
   notices. Two places still do, and both need a human: no component records **which version it
   shipped in** (that comes from the registry, which is unreachable), and the per-component
   changelog cannot mark a commit with a version until there is more than one tag to sit between.
4. **The README's first paragraph** describes the token pipeline, not the design system. The hero
   line will read oddly until a human rewrites the README.
5. **Who owns `Astro Link`?** Registry Flag 7 records the ownership as contested, and this skill
   writes it.
