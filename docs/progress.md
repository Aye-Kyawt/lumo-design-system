# progress

Figma component set **69:1151** —
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=69-1151>

> Use progress to show how far along a measurable thing is — a score against a target,
> an initiative's completion, a multi-step flow. Don't use it for an unknown wait; use
> Spinner instead.
> — the component's own description in Figma

## The matrix

Two variant properties, eight variants.

| Figma variant | node | props |
|---|---|---|
| `Status=brand, Size=sm`    | 69:27 | `status="brand" size="sm"` |
| `Status=brand, Size=md`    | 69:33 | `status="brand" size="md"` |
| `Status=positive, Size=sm` | 69:39 | `status="positive" size="sm"` |
| `Status=positive, Size=md` | 69:45 | `status="positive" size="md"` |
| `Status=warning, Size=sm`  | 69:51 | `status="warning" size="sm"` |
| `Status=warning, Size=md`  | 69:57 | `status="warning" size="md"` |
| `Status=negative, Size=sm` | 69:63 | `status="negative" size="sm"` |
| `Status=negative, Size=md` | 69:69 | `status="negative" size="md"` |

`Status` changes exactly one thing, the indicator colour. `Size` changes exactly one
thing, the track height — 6px at `sm`, 8px at `md`.

Four further properties are not variants:

| Figma property | kind | prop | default |
|---|---|---|---|
| `Label` | boolean | `label` | `true` |
| `Label text` | text | `labelText` | `"Commercial strategy"` |
| `Value` | boolean | `value` | `true` |
| `Value text` | text | `valueText` | `` `${percent}%` `` |

Plus one prop Figma has no property for, `percent` — see
[`naming-conflicts.md`](./naming-conflicts.md) and gap 4 below.

Every variant is drawn in a 280×36 frame holding a `Label` text layer and a `Row`
frame; `Row` holds a `Track` frame, which holds an `Indicator` frame, and a value text
layer. None of those is a Figma component — they are plain frames inside each variant,
the way Badge's `Label` is a plain text layer. So Progress ships as one file with no
sub-components, and `Composes` in the registry is empty.

The 280px is the frame on the canvas, not a constraint: inside it the label is
full-width, the row is full-width and the track is a flex child taking the remaining
space. The coded component is therefore fluid, and the stories pin it to 280px only so
it can be put side by side with the node.

## Why there are no interaction states

`CLAUDE.md` asks every component to cover every interaction state the product uses,
*as applicable*. None is applicable. The set defines no hovered, pressed, focused,
disabled, error or loading variant, and progress is an output rather than a control —
there is nothing to click. So it takes no `onClick` and is not focusable. `negative`
covers the failing case as a *status*, not as an error state of a control.

There is also no indeterminate variant, and that is deliberate on the designer's part:
the component description sends the unknown wait to Spinner.

## Tokens

Every value below resolved to a token in `build/css/<platform>/tokens.css`. Nothing is
a raw hex, px or font name. Three values could not resolve to a *semantic* token — see
the gaps.

| What | Token | Figma variable |
|---|---|---|
| Label text | `--label-label1` | `Label/Label1` |
| Label colour | `--color-text-primary` | `lumo.semantic.color.text.primary` |
| Value text | `--body-body3` | `Body/Body3` |
| Value colour | `--color-text-secondary` | `lumo.semantic.color.text.secondary` |
| Label → row gap | `--spacing-gap-xs` | `lumo.semantic.spacing.gap.xs` |
| Track → value gap | `--spacing-gap-horizontal-sm` | `lumo.semantic.spacing.gap.horizontal.sm` |
| Track fill | `--color-bg-surfacesecondary` | `lumo.semantic.color.bg.surfaceSecondary` |
| Indicator, `brand` | `--color-bg-primary-idle` | `lumo.semantic.color.bg.primary.idle` |
| Indicator, `positive` | `--color-bg-positive-idle` | `lumo.semantic.color.bg.positive.idle` |
| Indicator, `warning` | `--color-bg-warning-idle` | `lumo.semantic.color.bg.warning.idle` |
| Indicator, `negative` | `--color-bg-negative-idle` | `lumo.semantic.color.bg.negative.idle` |
| Track + indicator radius | `--border-radius-full` | `lumo.core.border.radius.full` — **gap 2** |
| Track height, `sm` | `calc(var(--spacing-4) + var(--spacing-2))` | **unbound — gap 1** |
| Track height, `md` | `--spacing-8` | **unbound — gap 1** |
| Forced-colors outline | `--border-width-default` | not in the node; see below |

### The spacing tokens are mode-dependent

`spacing/gap/*` does not hold one value. Read from the generated CSS:

| Token | `web` | `mobile` | `admin` |
|---|---|---|---|
| `--spacing-gap-xs` | 4px | 4px | **2px** |
| `--spacing-gap-horizontal-sm` | 8px | 8px | **4px** |
| `--typography-fontsize-sm` | 12px | **13px** | 12px |
| `--typography-lineheight-sm` | 16px | **18px** | 16px |

So Progress is visibly tighter in `admin` and slightly larger-set in `mobile`, by
design. Numbers quoted elsewhere in this file are the **`web`** mode unless stated.

The two track heights are *not* mode-dependent: they are composed from core spacing
primitives, which hold the same value in all three modes. That is a side effect of gap
1, not a decision.

## Design gaps — reported, not filled

### Gap 1 — `Size` is the whole point of the property and neither value is bound

The node draws the track 6px tall at `sm` and 8px at `md`, both as raw numbers with no
variable behind them. There is no token near those values anywhere in the system: the
core size scale starts at 12, and the semantic size families are `icon`, `control`,
`avatar`, `touchTarget` and `layout` — none of which means "the height of a progress
track".

Snapping to the nearest step in a plausible family, the way Badge did with its unbound
10px padding, is not available here: the nearest step to 6 is 4, which would render
`sm` a third thinner than drawn and make the two sizes read as 4/8 rather than 6/8 —
and the height is the *only* thing `Size` changes.

**What the code does instead:** composes the two heights from core spacing primitives,
exactly — `calc(var(--spacing-4) + var(--spacing-2))` and `var(--spacing-8)`. That
reaches past the semantic layer, which a component should not do. Both are isolated in
`--lumo-progress-track-height`, one declaration per size, so closing the gap is a
one-line change each.

**What would close it:** a semantic size family for the bar — `size/progress/sm` = 6
and `size/progress/md` = 8, or whatever the designer prefers to call it — with the
node's `Track` frame bound to it.

### Gap 2 — the track radius binds a core token, skipping the semantic layer

`Track` and `Indicator` are both bound to `core/border/radius/full`, not to a semantic
radius. The semantic radii that resolve to the same 999 are `border/radius/chip` and
`border/radius/avatar`; a progress track is neither, so borrowing one of those names
would be a lie about meaning dressed up as a fix.

**What the code does instead:** reproduces the binding the node actually has,
`var(--border-radius-full)`, isolated as `--lumo-progress-radius`.

**What would close it:** a `border/radius/progress` (or a shared `border/radius/pill`)
semantic alias, with the node bound to that.

### Gap 3 — the fill cannot animate, because the easings have no value

A bar whose fill moves wants a transition, and a transition needs a duration and an
easing. The duration tokens exist. All five easing tokens —
`motion-easing-standard`, `-decelerate`, `-accelerate`, `-emphasized` and `-linear` —
are declared in the Figma export with **no value in any mode**, so `build-tokens.js`
skips them and emits no `--motion-easing-*` custom property at all. The token build
says so on every run.

The node binds no easing, so nothing was dropped from the design. But Progress is the
component in this system most likely to want one, and it cannot have it.

**What the code does instead:** nothing. The fill snaps. A substituted cubic-bezier
would be a design decision taken by an engineer, and a CSS keyword such as `ease`
presented as the bound value would be worse — it would look resolved.

**What would close it:** give the five easings values in Figma and re-export. One
`transition` declaration on `.lumo-progress__indicator` then covers it.

### Gap 4 — the node's fill does not agree with its own value text

Every variant draws `Indicator` at a fixed **158px** while the value text reads
**72%**. The track in that layout is ~246px wide, so the drawn fill is about **64%**.
The two cannot both be right.

This is not fillable as a token, and it is not really a bug in the design either — a
static Figma frame has no way to express "the fill follows the number". It is recorded
because QA will measure it.

**What the code does instead:** drives the fill from `percent`, so 72% renders at 72%
(177px of 246px in the `web` mode at 280px wide). The coded component will therefore
*not* match a pixel measurement of the node's indicator, and that is correct.

## Accessibility

`role="progressbar"` sits on the **track**, not on the wrapper. A progressbar's
contents are not exposed to assistive technology, so putting the role on the wrapper
would swallow the label and the value text. With it on the track, both stay ordinary
text and the bar is named by reference.

- `aria-valuenow` / `aria-valuemin` / `aria-valuemax` carry `percent`, clamped to 0–100.
- `aria-labelledby` points at the label line when `label` is true.
- When `label` is false the bar takes `aria-label={labelText}`, so turning the visible
  line off never leaves the bar unnamed.
- `aria-valuetext` is set only when the caller passes an explicit `valueText`, so a
  plain percentage is not announced twice.

Forced-colours mode drops every background, and unlike Badge the meaning here *is* the
fill — so the track takes a `CanvasText` outline to keep its shape and the indicator is
painted `Highlight`, a system colour that forced-colours mode honours. The `Status`
distinction is lost in that mode; the value text carries the number.

`@storybook/addon-a11y` is not installed (`tools.md`), so all of this was checked by
reading the rendered DOM, not by an automated audit.

## What was verified, and where

Local Storybook on port 6010, all sixteen stories, console clean.

- **`web` / light** — measured against the node: 280px wide, 4px and 8px gaps, 6px and
  8px tracks, 999px radius, `500 12px/16px Inter` label and `400 12px/16px Inter`
  value, and the four indicator colours `#1695b1`, `#17823e`, `#b15c16`, `#e31628` on
  an `#ebedf4` track. Every one matches.
- **`admin` / light** — renders correctly with the gaps compressed to 2px and 4px, as
  the admin-mode tokens dictate.
- **`mobile` / light** — renders correctly at the 13px/18px type the mobile-mode
  tokens dictate.
- **`web` / dark** — every token flips; nothing is hardcoded to the light theme.
- **Not verified:** `admin` dark, `mobile` dark, and the four layout breakpoints.
  Progress binds no grid token, so the breakpoints should not reach it.
