# Toast — what the node says, and the six places it does not

Figma component set `toast`, node **151:162**:
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=151-162>

> Use a toast to confirm that something happened after the user acted — saved, sent, deleted,
> failed — without interrupting what they are doing. Don't use it for anything the user must
> act on; that is a Modal or an Alert.
>
> — the component's own description in Figma

Category **MOLECULES**. `Composes` is empty: the node's two instances are `Icon/check` (94:2)
and `Icon/close` (90:8), both Material Symbols glyphs rather than components in this registry,
and nothing in the set is an instance of `badge`, `button`, `card`, `emptyState`, `field`,
`progress` or `switch`. In particular the close control is **not** a Button instance — it is a
bare 16x16 icon — so this component imports none and copies none.

## The matrix

One variant property:

| Property | Values | Nodes |
|---|---|---|
| `Status` | `positive` · `negative` · `warning` · `info` | 151:130 · 151:138 · 151:146 · 151:154 |

Two boolean properties — `Description` and `Close` — and one instance-swap slot, `↳Icon`. Both
booleans are **on** in all four variants, so their off state is drawn nowhere in the set.

Three layers in every variant, identical in all four: `Icon` (16x16), a `Text` frame holding
`Title` and `Description`, and `Close` (16x16). Exactly one thing changes across the four
variants — the icon's colour. The glyph, the copy, the spacing, the stroke, the radius, the
elevation and the type styles are the same in all of them.

## Props

| Figma property | Prop | Note |
|---|---|---|
| `Status` | `status` | lowercased only; values kept verbatim |
| `Title` | `title` | |
| `Description` (boolean) | `description` | |
| `Description` (text) | `descriptionText` | renamed — see `docs/naming-conflicts.md` |
| `Close` (boolean) | `close` | |
| `↳Icon` (slot) | `iconName` | a glyph name, per the Button precedent |
| — | `onClose` | **not a Figma property**, documented as an addition |
| — | `closeLabel` | **not a Figma property**, documented as an addition |

`onClose` and `closeLabel` have no node behind them and are not presented as part of the
design's API. The close control is drawn in every variant and has nothing to do in a static
frame; `onClose` is what it does. The glyph is `aria-hidden` decoration, so the word a screen
reader announces has to come from somewhere, and `closeLabel` is it.

## Accessibility the node cannot draw

The root is `role="status"` with `aria-live="polite"`, never `role="alert"`. That follows
directly from the component's own description: a toast is explicitly *not* for anything the
user must act on, so it announces without taking focus. Both are overridable through `...rest`
for a caller whose live region sits further up the tree.

---

## The six gaps

Each of these is reported, not filled. Where the design binds no variable, the nearest semantic
token whose family carries the right meaning is bound and flagged at its declaration in the
CSS; where the design and the token system disagree, the node is followed because the node is
what QA tests.

### 1. The 400px frame width binds no variable

The node fixes every variant at 400px wide and that width binds nothing. No token at any layer
carries 400 as a *width*; `core.size.400` exists as a size primitive but the frame does not
reference it.

A toast is positioned and sized by whatever stacks it, so the component is fluid
(`inline-size: 100%`) and the caller sets the width. The stories put it in a 400px frame —
which `size/400` happens to carry exactly — so it can still be held against the node's
screenshot. The frame is story scaffolding, in `toast.stories.css`, and nothing in the
component depends on it.

### 2. All four statuses draw the same `check` glyph

This is the one most worth a designer's attention.

The four status icons export as four SVGs that are **byte-identical apart from their `fill`** —
same `viewBox`, same single `<path>`, same `d`, same layer name (`Glyph`):

```
d="M5.99998 10.78L3.21998 8.00002L2.27332 8.94002L5.99998 12.6667L14 4.66668L13.06 3.72668L5.99998 10.78Z"
```

That path is the Material Symbols `check` tick. So a `negative` toast ships a tick in red, a
`warning` toast ships a tick in orange, and an `info` toast ships a tick in blue. Only the
colour carries the status, and on a failure message the glyph actively contradicts it.

Nothing is corrected here. Which glyph a negative or warning toast should draw is a design
decision and the Designer makes it. `iconName` lets a caller pass another glyph and the
`Other glyphs` story demonstrates what each status would plausibly want
(`check_circle` / `error` / `warning` / `info`) — **as a demonstration of the gap, not a fix**.
The component still defaults to `check`, which is what the node draws.

### 3. The close icon's fill binds no variable

Node 151:136 exports as a flat SVG with `fill="#636679"` and no bound variable.

That value is `core.color.neutral.600` exactly, and the semantic token in front of it is
`color/text/secondary`. The `color/icon/*` family has **no neutral rung at all** — it holds
brand, onAction, onHovered, onFocus, disabled, negative, positive, warning, info, update and
the four action rungs, and none of those means "a neutral icon on a surface".

So the colour is exact and only the *name* is this build's reading: a text token used on an
icon, because the icon family has nowhere else to go. The same thing happened on `field`
(gap 3 there) and was resolved the same way.

**Suggestion back to design:** a `color/icon/secondary` rung aliasing `neutral/600` would give
this and every other neutral icon in the library a name that means what it is. That is a design
decision; nothing has been changed in Figma.

### 4. The close control has no states at all

The set draws no hovered, pressed, focused or disabled state for anything, and the close
control is the only interactive thing in a toast. `CLAUDE.md` requires every interaction state
the product uses, so three are bound here and each is flagged in `toastClose.css` as a reading
of the neutral ramp rather than a designed value:

| State | Token | Reading |
|---|---|---|
| idle | `color/text/secondary` | the node's own exported fill — exact |
| hovered | `color/text/primary` | one rung darker (neutral/800) |
| pressed | `color/text/bold` | one rung darker again (neutral/1000) |
| focused | `elevation/focused` | the token's own description reads "Keyboard focus indicator", so the value is designed and only its application here is new; the glyph keeps the hovered colour, which is the convention the token set itself states for `text/actionFocus` ("matches hovered") |

**No hover background and no padding are added.** The node fixes this control at 16x16, and a
background plate would need a radius and an inset that no token carries for it — undesigned
geometry. The hover affordance is a colour change only, which is the most this can say using
values that exist.

`disabled` is styled defensively on the sub-component (`color/icon/disabled`) but is **not** a
Toast prop. A toast is a transient announcement, not a control; it is never disabled. `error`
and `loading` do not apply either — the status *is* the error, and a toast reports a finished
action rather than a running one.

### 5. `radius/card` reads 16 in Figma and 12px in the token export

The node binds `semantic.border.radius.card`, which is the right name and currently the wrong
number.

| Source | Value |
|---|---|
| live Figma variable, read over the MCP connection | **16** |
| `build/css/web/tokens.css` | `var(--border-radius-lg)` = **12px** |
| `build/css/admin/tokens.css` | 12px |
| `build/css/mobile/tokens.css` | 12px |

`docs/field.md` recorded this same token as 12px when `field` was built, so the Figma value has
moved since the committed export was taken.

The **token name is bound, not the number**. Reaching for `radius/xl` to hit 16 would be
inventing agreement between a design file and a token export that do not currently agree, and
would silently diverge again the moment the tokens are re-exported. Re-exporting `tokens/` is
the Token Runner's job, not this agent's; until that happens the toast renders at 12px while
the node draws 16.

### 6. The node uses `elevation/level2`; the scale reserves `level4` for toasts

The node applies the Figma effect style `elevation/level2`, and its two shadows match
`--elevation-level2` exactly — `0 2 4 -1` at 6% and `0 4 8 -2` at 10%.

But the token descriptions in the generated scale read:

- `--elevation-level2` — "Dropdowns, menus, popovers, tooltips"
- `--elevation-level4` — "Modals, dialogs, toasts — highest emphasis"

So the elevation scale names this component on a rung the component does not use. The node is
followed (`level2`), because the node is what QA tests against. The contradiction is reported
rather than resolved: either the toast should be raised to `level4` or `level4`'s description
should stop claiming it, and both are design decisions.

Note also that the effect is applied as a **style**, not as a bound variable, so there is no
variable reference to follow — the match to `--elevation-level2` was made by comparing the two
shadow stacks numerically.

---

## Things that are not gaps

Worth recording so a later reader does not re-raise them:

- **Every colour in the node matches its token exactly.** The surface is `#ffffff` =
  `color/bg/base`; the stroke is `#bfc2cf` = `neutral/300` = `color/border/primary/default`;
  the title is `#30344b` = `neutral/800` = `color/text/primary`; the description is `#636679` =
  `neutral/600` = `color/text/secondary`; and the four status fills `#16E362`, `#E31628`,
  `#E37316`, `#1665E3` are green/600, red/600, orange/600 and blue/600, which are exactly what
  the four `color/icon/<status>` tokens resolve to.
- **The stroke is an inside stroke and a real CSS border is the exact translation.** The node's
  own measurements prove it: the icon sits at x=17 against 16px of padding, and the frame is 74
  tall for 1 + 16 + 40 + 16 + 1. Unlike `card` — which needed an inset shadow because its
  focused variant changes the stroke width without changing its height — nothing in this set
  changes the stroke, so `border` on a `border-box` is correct and simpler.
- **`--z-index-toast` exists (1600) and is not used here.** Stacking is the job of whatever
  positions the toast, not of the toast itself. A component that sets its own z-index decides
  its container's layering for it.
- **No timer, no auto-dismiss.** The node defines no duration and no motion property, and
  `motion/easing/*` has no value in the export at all (five of the eight tokens
  `build-tokens.js` warns about on every run). A toast's lifetime is the caller's concern.
