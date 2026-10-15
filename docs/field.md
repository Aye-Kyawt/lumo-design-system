# field

Figma component set **141:3144**, named **field** on the canvas —
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=141-3144>

> Use field to wrap any input control with a label, an optional required mark and
> helper or error text — used by Input, Select, Textarea and Checkbox groups alike.
> Don't write the field's own error styling into the control; field carries it.
> — the component's own description in Figma

## The matrix

One variant property, four values. There is no size property, and no hovered,
focused or pressed variant anywhere in the set.

| Figma variant | node | prop |
|---|---|---|
| `State=default`  | 141:3118 | `state="default"` |
| `State=error`    | 141:3126 | `state="error"` |
| `State=disabled` | 141:3136 | `state="disabled"` |
| `State=Type`     | 258:258  | `state="Type"` |

`Type` keeps the set's own capital T. It is a variant *value*, not a property,
and QA reads values off the node — see `docs/naming-conflicts.md`.

Every variant stacks the same three rows:

1. **Label row** (141:3119) — the `Label` text (141:3120) and a `Required`
   asterisk (141:3121) that is **hidden in all four variants**.
2. **↳Control** — an instance of `_Slot/Content` (41:21).
3. **Helper row** — the `Helper` text (141:3125 / 141:3135). In `error` alone it
   also carries `Icon/close` (141:3133, an instance of 90:8).

## The control is `children`, so this component composes nothing

The `↳Control` layer is a slot, and the slot's own description in Figma reads:

> Placeholder slot. Swap it for the real component you want inside this area.
> Never ship a screen with a slot still showing.

So the control is not a fixed sub-component. It is `children`, and `field`
imports no other component in the registry — **`Composes` in the registry is
empty**, deliberately. Input, Select and Textarea do not exist in the library
yet; when they do, nothing here changes.

`fieldControlSlot.jsx` reproduces the placeholder so the stories can be held
against the Figma frames and so QA has something to compare. It is **not** a
default: `Field` with no children renders an empty control row, because the
slot's description says never to ship the placeholder.

### How the field carries the control's error styling

The description asks the field to own the control's state skin without the
field restyling a component it does not own. It does that by publishing two
custom properties on the root:

| Property | What it carries |
|---|---|
| `--lumo-field-control-border-color` | the control's outline, per state |
| `--lumo-field-control-text-color` | the control's own text colour |

Anything dropped into the slot binds those two and inherits the state.
`fieldControlSlot.css` is the worked example, and the `With a real control`
story proves it with a plain `<input>`: the error row's input turns red without
`Field` ever touching it.

Disabled is deliberately **half** the field's job. The field greys its own label
and helper; the control inside must carry its own `disabled` attribute. A
wrapper cannot and must not disable a child it does not own.

## Tokens

Every value resolves to a token in `build/css/<platform>/tokens.css`. Nothing is
a raw hex, px or font name.

### Bound in Figma

These are the variables `get_variable_defs` returns for 141:3144.

| Property | Figma variable | CSS |
|---|---|---|
| label type | `Label/Label1` | `--label-label1` |
| helper type | `Body/Body3` | `--body-body3` |
| label colour | `semantic.color.text.primary` | `--color-text-primary` |
| helper colour, default | `semantic.color.text.secondary` | `--color-text-secondary` |
| helper colour, error | `semantic.color.text.negative` | `--color-text-negative` |
| label + helper, disabled | `semantic.color.text.disabled` | `--color-text-disabled` |
| required mark | `semantic.color.text.negative` | `--color-text-negative` |
| row gap | `semantic.spacing.gap.xs` | `--spacing-gap-xs` |
| label/helper row gap | `semantic.spacing.gap.horizontal.xs` | `--spacing-gap-horizontal-xs` |
| control padding | `semantic.spacing.padding.md` | `--spacing-padding-md` |
| control fill | `semantic.color.bg.surfacePrimary` | `--color-bg-surfaceprimary` |
| control border | `semantic.color.border.primary.default` | `--color-border-primary-default` |
| control border, error | `semantic.color.border.negative.focused` | `--color-border-negative-focused` |
| border width | `semantic.border.width.default` | `--border-width-default` |
| control radius | `semantic.border.radius.card` | `--border-radius-card` |

### Not bound in Figma — see the gaps below

| Property | node | CSS | web | admin | mobile |
|---|---|---|---|---|---|
| control height | 40 | `--size-control-md` | 40 | 32 | 44 |
| error icon box | 14 | `--size-icon-sm` | 16 | 16 | 16 |
| error icon fill | flat SVG | `--color-icon-negative` | red/600 | red/600 | red/600 |
| control text | `text/secondary` at #bfc2cf | `--color-text-placeholder` | neutral/300 | neutral/300 | neutral/300 |

Note what the bound half means for platforms: `spacing/padding/md` and
`spacing/gap/xs` are themselves mode-dependent, so even the values the design
*did* bind move between platform builds. The field is 16/4 in web and mobile and
12/2 in admin.

---

## Gap 1 — the control's height binds no variable

The 40px control box is a raw number in the node. It is bound to
`size/control/md`, the semantic name for "an interactive control at the middle
size", which is 40px in web — the node's own number — and 32px in admin, 44px in
mobile.

The consequence is that **the control is a different height per platform mode**
while the node draws one fixed size. That is almost certainly right for a form
control, but it is this build's reading rather than a decision made on the
canvas.

**What would close it:** bind the control frame in 141:3144 to
`semantic.size.control.md`, or author a `semantic.size.field.control` with
per-mode values and bind to that.

## Gap 2 — the error icon's box binds no variable, and 14 is not on the scale

The icon instance in the error helper row is 14 × 14. The semantic icon scale
steps 12, 16, 20, 24, 32: **there is no 14 in any family or any platform mode.**

`size/icon/sm` (16px) is used, because it equals the helper row's own line
height (`typography/lineHeight/sm` = 16px), so the glyph sits on the text's line
box instead of floating 1px off it. The rendered icon is therefore 16px against
the node's 14px.

**What would close it:** draw the icon at 16 and bind it to
`semantic.size.icon.sm`, or author a 14px rung and bind to that.

## Gap 3 — the error icon's fill binds no variable

It is exported as a flat SVG fill. `color/icon/negative` is used: it is the
semantic name for "an icon carrying a negative meaning", and it resolves to
red/600 — **the same value** the helper text beside it already binds through
`color/text/negative`. So the colour is exact and only the name is this build's
reading.

**What would close it:** bind the icon's fill to
`semantic.color.icon.negative`.

## Gap 4 — `text/secondary` names two different colours in the same node

The node reports `semantic/color/text/secondary` on the **control's placeholder
text** at `#bfc2cf`, and reports the **same variable name** on the helper text
two rows below at `#636679`. Only one of those can be `text/secondary`, and the
export is unambiguous: `color/text/secondary` is neutral/600 = `#636679`, while
`#bfc2cf` is neutral/300, which this export carries as `color/text/placeholder`.

The control text is therefore bound **by value**, to `color/text/placeholder` —
which is also what the layer *is*: placeholder text in an empty control. The
helper is bound to `color/text/secondary` as reported. Both render the colour
the node draws.

**What would close it:** rebind the slot's text layer to
`semantic.color.text.placeholder` in Figma. Until then the node's own variable
report is wrong on one of the two layers, and anyone reading it will bind the
wrong token.

## Gap 5 — two tokens are borrowed from the wrong rung, and both were followed as drawn

**The control radius.** The node binds `border/radius/card` (12px) to a text
control, not `border/radius/input` (8px), which exists in the export and is
unused by this set. A 12px control against the 8px the input token carries is a
design decision, not an engineering one, so it was reproduced exactly.

**The error border.** `State=error` binds `color/border/negative/**focused**`
(red/500, `#eb4c59`) — not `color/border/negative/default` (red/300), which also
exists and is unused. The variant is not drawn focused. Reproduced as drawn.

Both are exact in the render and wrong in the name, which is the kind of thing
that goes unnoticed until a focus state is added and has nowhere to go.

**What would close it:** rebind the control to `border/radius/input`, and the
error border to `border/negative/default`, or confirm that the drawn choices are
intended.

## Gap 6 — three things the states do not change, and one they do

All four were followed exactly as drawn and none was normalised:

- **`disabled` keeps the ordinary border.** `color/border/primary/disabled` and
  `color/bg/disabled` both exist in the export and neither is used, so a
  disabled field is outlined exactly like a live one. Only the label and helper
  grey out.
- **The required asterisk stays `text/negative` in `disabled`.** A red asterisk
  on an otherwise greyed-out field reads as an error rather than as a
  requirement.
- **`State=Type` greys its helper to `text/disabled`**, which neither `default`
  nor the disabled variant explains. The one change this variant is *for* — the
  control's text going from placeholder grey to `text/primary` — is drawn
  correctly; the helper change looks unintended.
- **The `Required` mark is hidden in all four variants**, so the half of that
  property the set actually draws is "off". The `Required` story shows the
  other half.

**What would close it:** a designer deciding, per bullet, whether the drawing is
the intent.

---

## Accessibility, which the node cannot draw

- The label row **is** the `<label>`, with `htmlFor` pointing at the control in
  the slot (`controlId`, defaulting to `${id}-control`). The two text layers stay
  flex siblings inside it, so the node's gap still applies and a screen reader
  still reads one label.
- The asterisk is `aria-hidden`; a visually hidden `requiredText` ("required")
  carries the word that is announced. `requiredText` is **not** a Figma property
  — an asterisk alone tells a screen reader nothing.
- In `error` the helper row takes `role="alert"`, so the message is announced
  when it appears.
- The helper row carries the id the control should point at with
  `aria-describedby`; the `With a real control` story wires it.
- The field itself has **no tab stop**, which is correct: it is a wrapper. Hover,
  focus and press belong to whatever is in the slot.

## Verified

Local Storybook on port 6008, all nine stories, in web / admin / mobile and in
light / dark. Measured off the rendered DOM, not eyeballed.

Geometry, web / light:

| | node | rendered |
|---|---|---|
| control height | 40 | 40px |
| control radius | 12 | 12px |
| control padding | 16 | 16px |
| border width | 1 | 1px |
| row gap | 4 | 4px |
| helper row gap | 4 | 4px |
| label type | Label/Label1 | `500 12px/16px Inter` |
| helper type | Body/Body3 | `400 12px/16px Inter` |
| error icon | 14 | 16 × 16 (gap 2) |

Colour, against the node's own reported values:

| | node | rendered (web, light) |
|---|---|---|
| label, default | `#30344b` | `rgb(48, 52, 75)` |
| label, disabled | `#a0a3b1` | `rgb(160, 163, 177)` |
| helper, default | `#636679` | `rgb(99, 102, 121)` |
| helper, error | `#e31628` | `rgb(227, 22, 40)` |
| control border | `#bfc2cf` | `rgb(191, 194, 207)` |
| control border, error | `#eb4c59` | `rgb(235, 76, 89)` |
| control fill | `#f5f6fa` | `rgb(245, 246, 250)` |
| control text, placeholder | `#bfc2cf` | `rgb(191, 194, 207)` |
| control text, `Type` | `#30344b` | `rgb(48, 52, 75)` |
| required mark | `#e31628` | `rgb(227, 22, 40)` |

Platform modes, which gap 1 makes mode-dependent:

| | web | admin | mobile |
|---|---|---|---|
| control height | 40px | 32px | 44px |
| control padding | 16px | 12px | 16px |
| row gap | 4px | 2px | 4px |
| control radius | 12px | 12px | 12px |

Dark was checked in all four states: every colour flips through its token, and
the error border moves to the dark palette's rung (`rgb(227, 22, 40)`) while the
helper stays red. Nothing is hardcoded to a light value.

Behaviour:

- The label's `for` resolves to the control's `id` in every story, and
  `aria-describedby` resolves to the helper row's `id`.
- `role="alert"` is present on the helper row in `error` and absent in the other
  three.
- The required asterisk is `aria-hidden="true"` and the announced word renders in
  a 1px clipped box.
- `With a real control`: the error row's `<input>` picks up `#eb4c59` purely by
  binding `--lumo-field-control-border-color` — the field never styles it. The
  disabled row shows both halves, the field greying its text and the input
  carrying its own `disabled`.
- `Without helper` collapses to two rows, 60px, and the gap below the control
  goes with it.
- `Long label and helper`: the label clips to one line with an ellipsis
  (`scrollWidth` 572 against `clientWidth` 390) while the asterisk stays
  visible, and the helper wraps to two lines and grows the field to 96px.

Two things found and fixed during this check, both in the stories rather than
the component: the stories had no frame, so the fluid field stretched to the
whole canvas and `Long label and helper` demonstrated neither clipping nor
wrapping; and the label string in that story was short enough to fit 400px
anyway. A meta-level decorator now frames every story at `size/400`, and the
label is long enough to actually clip.

**Observed, not a defect, for QA to rule on:** the error icon is vertically
centred on the helper *row*, so when the helper wraps to two lines the icon sits
between them rather than on the first line. The node only ever draws one line, so
there is nothing to compare it against.

`npm run lint` **could not be run: that script does not exist.** `package.json`
has only `build:tokens`, `storybook` and `build:storybook`, and `tools.md`
already records the absence under "Not set up yet". No lint script was added —
tooling changes route through `tools.md`.

One console error appears on every story in this repo, Field or not:
`GET /vite-inject-mocker-entry.js → 404`, requested by Storybook 10.6's own
iframe bootstrap before any story module loads. It is pre-existing and not
Field's. No other console error, and no React warning, appeared in any of the
nine stories.

Not verified here: the deployed staging build. That is stage 5, and the registry
cell that wakes QA is written only after the deployed URL has been opened and
seen to render.
