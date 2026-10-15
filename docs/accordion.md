# accordion

Figma component set **208:4912** —
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=208-4912>

> Use an accordion to let the user expand one answer at a time without leaving the page —
> an FAQ list on a marketing page. Don't use it for primary content the user needs to see
> without an extra click.
> — the component's own description in Figma

## The matrix

One variant property, two variants. There is no size property and no state property.

| Figma variant | node | size | prop |
|---|---|---|---|
| `State=closed` | 208:4897 | 480×70 | `state="closed"` |
| `State=open` | 208:4904 | 480×158 | `state="open"` |

`State=closed` is the set's first variant, so `defaultState` defaults to `"closed"`.

Exactly two things change between the two variants, and nothing else does:

1. the chevron's rotation — 0° closed, 180° open, via wrapper 208:4907
2. the content region — absent closed, present open

The card's border, surface, radius, padding and title colour are identical in both.

### Layers

| Layer | node | Built as |
|---|---|---|
| Header row | 208:4898 / 208:4905 | the `<button>` |
| Title | 208:4899 / 208:4906 | `.lumo-accordion__title` |
| Chevron | 208:4900 → `Icon/expand_more` 208:4895 | `accordionIcon` sub-component |
| Chevron rotation wrapper | 208:4907 (open only) | `--lumo-accordion-icon-rotation` |
| Content | `_Slot/Content` 41:21 (open only) | `children` |

The content is an instance of `_Slot/Content` (41:21), whose own description reads
"Placeholder slot. Swap it for the real component you want inside this area. Never ship a
screen with a slot still showing." So the content is **not** a fixed sub-component — it is
`children`, and this component imports no other component in the library. **`Composes` in
the registry is therefore empty.** `accordionContentSlot.jsx` reproduces the placeholder for
the stories; it is never a default.

## Why it is a `<button aria-expanded>` over a `role="region"`

The component description says the user expands an answer, so the header is unarguably
interactive. It renders a real `<button>` carrying `aria-expanded` and `aria-controls`, over
a panel carrying `role="region"` and `aria-labelledby` — the disclosure pattern. Space and
Enter operate it, which a native button gives for free.

The panel is **always rendered** and carries the `hidden` attribute when closed, rather than
being dropped from the tree. `aria-controls` has to point at an element that exists, and
`hidden` is what takes the content out of the tab order as well as out of view.
`accordion.css` restates `[hidden] { display: none }` so no later rule can beat the UA
default by specificity.

`disabled` uses `aria-disabled` rather than the DOM `disabled` attribute, so the header
stays reachable by keyboard and can be read before it is skipped — the same choice
`switch.jsx` made, and for the same reason. The click guard is therefore in the handler.

### `headingLevel` is an addition, and is documented as one

The node draws a card, not a document outline, so it carries no heading level. The ARIA
authoring practice for an accordion wants each header button inside a heading element, which
is what lets a screen reader user list and jump between the questions in the FAQ list the
description describes.

`headingLevel` defaults to **`0` — no wrapper**, so the default output is exactly what the
node draws. Pass 1–6 and the button is wrapped in that heading, which contributes outline
semantics and no style. A prop with no node behind it is documented as an addition rather
than quietly presented as part of the design's API, the way `requiredText` is in
`docs/field.md`.

## Tokens

Every value resolves to a token in `build/css/<platform>/tokens.css`. Nothing is a raw hex,
px or font name.

### Bound in Figma

These are all the variables `get_variable_defs` returns for 208:4912.

| Property | Figma variable | CSS |
|---|---|---|
| card fill | `semantic.color.bg.base` | `--color-bg-base` |
| card border colour | `semantic.color.border.primary.default` | `--color-border-primary-default` |
| card border width | `semantic.border.width.default` | `--border-width-default` |
| card radius | `semantic.border.radius.card` | `--border-radius-card` — **gap 4** |
| header padding | `semantic.spacing.padding.lg` | `--spacing-padding-lg` |
| title type | `Body/Body6-Intense` | `--body-body6-intense` |
| title colour | `semantic.color.text.primary` | `--color-text-primary` |
| chevron colour | `semantic.color.text.secondary` | `--color-text-secondary` — **gap 5** |
| slot fill | `semantic.color.bg.surfacePrimary` | `--color-bg-surfaceprimary` |
| slot padding-x | `semantic.spacing.padding.md` | `--spacing-padding-md` |
| slot type | `Body/Body3` | `--body-body3` |

The title's `Body/Body6-Intense` is bound as the one composite token that carries it rather
than decomposed into four. The export's `--body-body6-intense` is
`600 / fontsize-lg / lineheight-md / fontfamily-body`, which is exactly what the node reports.

### Not bound in Figma

| Property | node | CSS | note |
|---|---|---|---|
| card width | 480 | `inline-size: 100%` | gap 2 |
| chevron box | 20 | `--size-icon-md` | 20px in every mode — exact |
| slot height | 88 | `calc(--size-72 + --spacing-padding-md)` | gap 3 |
| content padding | none | none | gap 3 |
| border style | solid / dashed | CSS keywords | gap 6 |
| rotation duration | — | `--motion-duration-fast` | gap 7 |
| reduced motion | — | `--motion-duration-instant` | |

### States, not drawn in Figma — see gap 1

| State | CSS |
|---|---|
| hovered | `--color-bg-surfaceprimary` on the header |
| pressed | `--color-bg-surfacesecondary` on the header |
| focused | `--elevation-focused` |
| disabled | `--opacity-disabled` |

---

## Gap 1 — Figma draws no interaction state at all

The set defines `State=closed` and `State=open` and nothing else. There is no hovered,
pressed, focused, disabled, error or loading variant anywhere in 208:4912.

That absence cannot be honoured the way Badge honoured it. Badge is read, not clicked. An
accordion header is a button whose entire job is to be clicked, and a button with no focus
ring and no disabled affordance is a defect — `CLAUDE.md` asks every component to cover the
states the product uses.

So the states are implemented, **as behaviour**, bound to semantic tokens that already exist
and whose own descriptions carry these meanings. **No token was invented.** But the *mapping*
is this build's reading of the token names, not a decision a designer made on the canvas, and
it needs confirming against drawn variants.

Two choices inside it worth stating, because neither is forced:

- **Hover and press move the header's surface, not the card's border.**
  `color/border/primary/hovered` exists and was deliberately **not** used. The header is what
  the pointer is over; darkening the whole card's outline because the pointer is in its top
  half would claim the press target is bigger than it is. If the design wants the whole card
  to respond, that is a drawn variant away.
- **`bg/surfacePrimary` and `bg/surfaceSecondary` are the two neutral steps directly above
  `bg/base`**, and `surfacePrimary` is already the surface this very component uses for its
  content region — so the hover colour is one the card already contains rather than one
  brought in from elsewhere. `bg/overlay/subtle` and `opacity/overlay/hovered` were the other
  candidates and would read as a scrim over the card rather than a surface change.

**What would close it:** draw `State` as a second variant property on 208:4912 — a
`Interaction=default|hovered|pressed|focused|disabled` axis crossed with `closed|open` — or at
minimum confirm the four mappings in the table above.

## Gap 2 — the 480px frame is a raw number with no semantic token behind it

Both variants are pinned to 480px wide and no variable sits behind that width.

An accordion is laid out by the FAQ list or the page column it sits in, so the component is
fluid — `inline-size: 100%` — which is the same reading `field.css` took of its own fixed
320px frame.

Worth noting for anyone who wants to close it the other way: `lumo.core.size.480` **does**
exist in the export and is exactly 480px. But it is a **core** token, and
`.claude/skills/build/SKILL.md` is explicit that a component reaching for a `--primitives-*`
or core name has skipped the semantic token that should sit in front of it. There is no
`semantic.size.container.*` family at all — `size/control/{sm,md,lg}` is the only semantic
size family, and it means interactive control heights. So the width could not have been
bound even if pinning it were right.

The stories pin 480px as **story chrome** in `accordion.stories.css`, so the frames can be
compared against the node; that sheet is not a component and says so at its declaration.

**What would close it:** author a `lumo.semantic.size.container.*` family — or confirm that a
fluid accordion is intended, in which case nothing changes and this note can be deleted.

## Gap 3 — the content region has no padding, so real content touches the card edge

In `State=open` the `_Slot/Content` instance is drawn **full-bleed**: flush to the card's
left, right and bottom edges, with no padding between the content and the border and no gap
between it and the header.

Reproduced exactly as drawn. The consequence is that real answer text runs into the card's
border and across its bottom corner radius. The `WithRealContent` story stands the node's own
behaviour next to the same content with padding applied by the caller, so the difference is
visible rather than described.

This is very likely not what the design intends — an FAQ answer flush against a 1px border is
not a thing anyone draws on purpose — but padding here would be a number nobody specified,
and `CLAUDE.md` says to report the gap rather than fill it in. Nothing was invented.

A related, smaller item in the same region: the slot is drawn 88px tall, and **no size token
equals 88** in any family or any platform mode — the scale steps 72, then 240. The
placeholder composes it from `size/72 + spacing/padding/md`, which is exactly 88 in web, so
the `open` story stands the same 158px tall as frame 208:4904 and QA's comparison against the
node is meaningful. That composition lives only in `accordionContentSlot.css`, the
story-only placeholder. Real content sizes itself.

**What would close it:** bind a padding variable on the content frame in 208:4904 —
`spacing/padding/lg` on the sides and bottom, with `0` at the top, would match the header's
own padding and is what the `WithRealContent` story demonstrates. Then
`.lumo-accordion__panel` carries it and the caller stops having to.

## Gap 4 — `border/radius/card` renders 12px against the node's 16px

The card's corner reports as `semantic/border/radius/card` and the node renders it at
**16px**. In the export, `border.radius.card` aliases `radius.lg`, which is **12px** in web,
admin and mobile alike. No platform mode resolves it to 16.

The 4px is not a rounding artefact — 16px exists in the export as `radius.xl`, and
`radius.modal` aliases it.

The variable the node names is the one bound here, so the card renders 12px and the
difference is reported rather than papered over by reaching for `radius/xl` on the strength of
its value. Binding by value instead of by name is a thing this repo does do — see
`docs/field.md` gap 4 and the slot text below — but only where the *name* is demonstrably
wrong for the thing. Here the name is right: a card is what this is.

One corroborating oddity from the same `get_design_context` response: Figma's own codegen
emitted `rounded-[var(--lumo-semantic-border-radius-card,16px)]` on the card and
`rounded-[var(--lumo-semantic-border-radius-card,12px)]` on the slot — **two different
resolved values for one variable inside one frame.** Whatever produces that is upstream of
this build.

**What would close it:** decide which is true. Either `border.radius.card` should be 16px, in
which case it wants re-aliasing to `radius.xl` and re-exporting, or the node's 16px corner is
a detached override that should be re-bound to the variable it claims.

## Gap 5 — the chevron's colour is a text token on an icon

The chevron binds `semantic/color/text/secondary` and the exported SVG confirms the value:
`#636679`, which is `neutral/600`, which is what `color/text/secondary` resolves to.

So the colour is **correct** and the **family** is not. This is an icon taking a text token,
and the icon family has no neutral rung at all: `color/icon/*` offers `brand`, `action`,
`onAction`, `onHovered`, `onFocus`, `disabled`, `negative`, `positive`, `warning`, `info` and
`update` — and nothing for an ordinary grey glyph.

Bound as the node binds it. Moving it to a family that has no entry for it would be inventing
the entry. This is the same shape as `docs/switch.md`'s note that the off track takes a
*border* token as a *fill*.

**What would close it:** author `lumo.semantic.color.icon.secondary`, aliased to
`neutral/600`, and bind 208:4895 to it. Then one line in `accordionIcon.css` changes.

## Gap 6 — the border-style tokens have no value anywhere in the export

Pre-existing, and it lands directly on this component: an accordion draws a **solid** card
border and its content slot draws a **dashed** one, so border style is a property this
component actually uses twice.

`build-tokens.js` warns that eight tokens have no value anywhere in the export and are
skipped. Three of them are the entire border-style scale —
`lumo.semantic.border.style.solid`, `.dashed` and `.dotted`.

The sheets therefore carry the CSS keywords `solid` and `dashed` and **no border-style token
at all**. Nothing was invented to cover it. This is consistent with the rest of the library —
`card.css`, `badge.css`, `switch.css` and `fieldControlSlot.css` all write the keyword — so
closing it would be a library-wide change, not an accordion one.

A keyword is not a raw hex, px or font value, so it does not breach the `CLAUDE.md` rule. It
is still a value with a token that should have carried it.

**What would close it:** give those three tokens a value in Figma and re-export.

## Gap 7 — the motion easing tokens have no value

Pre-existing, already reported in `docs/switch.md` gap 4, and it lands here for the same
reason: the chevron rotates between the two states, so easing is a property this component
needs.

Five of the eight valueless tokens are the entire easing scale — `motion.easing.standard`,
`.decelerate`, `.accelerate`, `.emphasized` and `.linear`.

The rotation therefore carries `--motion-duration-fast` and **no easing token**, falling back
to the browser default. Nothing was invented.

**What would close it:** give those five tokens a value in Figma and re-export. Then the
transition in `accordionIcon.css` gains `var(--motion-easing-standard)` and nothing else
changes.

---

## One defect found and fixed in stage 4

Worth recording, because it is a trap the next component with an animated transform will
walk into and because it was invisible in the obvious story.

The chevron rotation was first built as a custom property — `accordion.css` published
`--lumo-accordion-icon-rotation` per state and `accordionIcon.css` read it as
`transform: rotate(var(--lumo-accordion-icon-rotation))`, with `transition: transform` on the
same rule. That is the tidy version and it **did not work**.

A transitioned `transform` whose value comes from an *unregistered* custom property cannot be
interpolated: the engine has no type for the property, so it cannot compute the intermediate
values. The failure mode was not a janky rotation. It was **no rotation at all** — the
transition entered `running` and stayed there forever with the computed transform pinned at
the identity matrix, confirmed off `getAnimations()`:

```
dataState: "open", rootProp: "180deg", iconProp: "180deg",
iconTransform: "matrix(1, 0, 0, 1, 0, 0)",      ← should be matrix(-1, 0, 0, -1, 0, 0)
animations: [{ t: "transform", state: "running" }]
```

The custom property resolved correctly at every level; only the transform it fed never moved.

It looked correct in `BothVariants`, because that story renders `open` on first paint — the
value is already 180° when the element is created and no transition ever starts. **Only the
interactive stories exposed it**, which is exactly why stage 4 asks for the states to be
clicked through rather than looked at.

The fix moves the rotation into the two `data-state` selectors in `accordion.css` as concrete
`rotate(0deg)` / `rotate(180deg)` values, so the transition interpolates between two real
transforms. The parent owning the rotation is also the better model: the thing being
reproduced is a wrapper node (208:4907) that the parent variant swaps.

**The general rule:** do not feed a transitioned `transform` from a custom property. Put the
animated value in the declaration that changes.

## Verified

Local Storybook on port 6011, run from this build's own worktree rather than through
`preview_start` — `.claude/launch.json` resolves against the main checkout, so a worktree
component is simply missing from that sidebar. All ten stories confirmed present in
`localhost:6011/index.json` before anything was trusted on screen.

Measured off the rendered DOM, not eyeballed, against the node's own numbers:

| | node | rendered (web, light) |
|---|---|---|
| closed card | 480×70 | **480×70** |
| open card | 480×158 | **480×158** |
| header padding | 24 | 24px |
| header box | 68 | 68px |
| chevron box | 20×20 | 20×20 |
| panel height, open | 88 | 88px |
| corner radius | 16 | **12px** — gap 4 |

Colour, against the node's own reported variables and the exported SVG's fill:

| | node | rendered (web, light) |
|---|---|---|
| card fill | `#ffffff` | `rgb(255, 255, 255)` |
| card border | `#bfc2cf` | `rgb(191, 194, 207)` |
| title | `#30344b` | `rgb(48, 52, 75)` |
| chevron | `#636679` | `rgb(99, 102, 121)` |

Type: the title computes `600 16px/20px Inter`, which is `--body-body6-intense` resolved and
is exactly the `Body/Body6-Intense` the node names.

All three platform modes and both themes were checked, because `spacing/padding/lg` is
mode-dependent and the card's height follows it:

| | closed | open | header padding |
|---|---|---|---|
| web | 480×70 | 480×158 | 24px |
| admin | 480×62 | 480×146 | 20px |
| mobile | 480×72 | 480×160 | 24px |

Web matches the node exactly. Admin is 8px shorter because `spacing/padding/lg` is 20px
there; mobile is 2px taller because its `typography/lineHeight/md` is larger. Both follow
from tokens that are correctly bound, so this is the bound tokens working rather than a
difference to report. Dark was checked in all three: the card drops to `rgb(16, 19, 35)`, the
title goes to white, the border lifts to `rgb(99, 102, 121)` and the chevron follows
`text/secondary` down into the dark palette. Nothing hardcoded survives the flip.

Behaviour:

- Renders `<button aria-expanded>` over `<div role="region" aria-labelledby>`; `aria-controls`
  resolves to a real element and `aria-labelledby` resolves to the button's own id, in both
  states.
- Pointer click toggles in both directions. `state`, `aria-expanded` and the panel's `hidden`
  attribute all move together.
- The chevron interpolates through the half turn — sampled mid-transition at
  `matrix(-0.972423, 0.233224, -0.233224, -0.972423, 0, 0)` — and settles at
  `matrix(-1, 0, 0, -1, 0, 0)` open and `matrix(1, 0, 0, 1, 0, 0)` closed. Checked in both
  directions after the regression above.
- Closed panel: `hidden` present, computed `display: none`, `offsetParent` null, zero
  focusable descendants. It is out of the tab order, not merely invisible.
- Hover resolves to `rgb(245, 246, 250)`, which is `bg/surfacePrimary` (`#f5f6fa`) exactly,
  against a transparent header at rest. Verified with a real pointer on the element, not a
  simulated event.
- `:focus-visible` on a real Tab press resolves to `rgba(22, 190, 227, 0.4) 0 0 0 3px`, which
  is `elevation/focused` exactly, and it hugs the 12px radius rather than boxing the card.
  Mouse clicks leave no ring.
- Disabled, in both states: `aria-disabled="true"`, **no** DOM `disabled` attribute, still
  `tabIndex 0` and still reachable, `opacity` 0.4 (`opacity/disabled` exactly),
  `cursor: not-allowed`, and the click does not move it.
- Controlled "one open at a time": opening the second row closes the first, and closing it
  leaves all three closed. Each question is a real `<h3>` with the button inside it.
- `headingLevel`: `0` leaves the button's parent a `DIV` with no wrapper, `3` makes it an
  `H3`. Both cards are 70px tall, so the heading contributes semantics and no style —
  `margin: 0` and the inherited 16px.

**Pressed was not observed live.** Holding a mouse button down across a measurement is not
something the tooling does cleanly, so the `:active` rule was verified only by its token
resolving (`bg/surfaceSecondary` → `#ebedf4`) and by sitting on the same custom property that
hover was proven to drive. QA should press and hold it.

Console: no React warnings and no component errors. The one repeated error is a 404 on
`/vite-inject-mocker-entry.js`, which is Storybook 10's own mocking entry and is requested
whether or not any component exists; every `src/components/accordion/*` file loads 200. It is
pre-existing infrastructure noise of the same kind `docs/switch.md` recorded.

`npm run lint` could not be run: **that script does not exist** in `package.json`, which lists
only `build:tokens`, `storybook` and `build:storybook`. `tools.md` already records this under
"Not set up yet". No lint script was added — tooling changes route through `tools.md`. The
closest available check, `npm run build:storybook`, was run instead and passes.
