---
title: Tokens
description: How the Lumo tokens are produced, what families exist, and where the generated output lands.
---

Tokens are the only source of visual values in this system. Every colour, space,
radius and font value in a component references a token, and a component that
carries a raw hex, px or font name is a defect rather than a shortcut.

## The pipeline

The token source is exported from the Figma "Design Tokens" plugin and committed
to `tokens/` — 23 files plus a `manifest.json`. Nothing in that directory is
written by hand on this side, and nothing in the generated output is ever edited.

```
tokens/*.tokens.json  ──  build-tokens.js  ──▶  build/
   (exported, committed)   (Style Dictionary v5)   (generated, gitignored)
```

Run it with `npm run build:tokens` from the repo root. The Storybook build and
this site's build both run it first, so the generated CSS is never committed and
cannot go stale.

## Two layers

Primitives hold the raw values. Semantic tokens point at primitives and carry the
meaning. **Components reference semantic tokens only** — a component that reaches
past the semantic layer to a primitive has skipped the decision the semantic layer
exists to record.

```css
--color-neutral-800: #272a3f;                      /* primitive */
--color-text-primary: var(--color-neutral-800);    /* semantic  */
```

A token name reads as category, then property, then role:
`color.action.primary`, `spacing.md`, `radius.sm`.

## Generated output

| Platform | Light | Dark |
|---|---|---|
| `web` | `build/css/web/tokens.css` | `build/css/web/tokens-dark.css` |
| `admin` | `build/css/admin/tokens.css` | `build/css/admin/tokens-dark.css` |
| `mobile` | `build/css/mobile/tokens.css` | `build/css/mobile/tokens-dark.css` |

Breakpoint values land at `build/css/layout/tokens.<breakpoint>.css`, and
`build/json/`, `build/ios/` and `build/android/` are produced alongside.

The dark files are scoped to `[data-theme="dark"]`, so dark mode is a reassignment
of the same semantic names rather than a second set of them. This site's dark mode
is that file — it maintains no palette of its own.

## Modes are a design decision

Modes come from Figma. A token that exists in one mode and not another is a
**design gap**, and the rule across this system is to report it rather than fill
it in. The same applies to a token a component seems to need but which does not
exist: inventing it moves the decision out of Figma, where it belongs.

## Seeing the values

The token families are rendered as live specimens in Storybook — colour, type,
spacing, sizing, border, elevation, opacity, motion, z-index and layout, plus a
combined view. That is the place to read actual values; this page describes how
they get there.
