# switch

Figma component set **17:1201**, named **Toggle** on the canvas —
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1201>

> Use a toggle for one setting that takes effect immediately — "Write summary with AI"
> in the report builder. Don't use it when the change needs a Save action; use Checkbox
> for that.
> — the component's own description in Figma

## The matrix

One variant property, two variants. There is no size property and no state property.

| Figma variant | node | prop |
|---|---|---|
| `On=true`  | 17:1202 | `on={true}` |
| `On=false` | 17:1204 | `on={false}` |

Both variants are 40×22. Each holds one child layer, an ellipse named `Knob`
(17:1203), 16×16, vertically centred, at x=21 when on and x=3 when off — a 3px
inset from whichever end it is at. That layer is built as the `switchKnob`
sub-component, so `Composes` in the registry is empty (it imports no other
component in the library).

`On=true` is the set's default variant, so `defaultOn` defaults to `true`.

## Why it is a `<button role="switch">`

Unlike Badge, this component is unarguably interactive — the description says
the setting "takes effect immediately". So it renders a real `<button>` with
`role="switch"` and `aria-checked`, it is focusable, and Space and Enter
operate it, which a native button gives for free.

The node has **no label layer**. The accessible name therefore has to come from
the caller, as `aria-label` or `aria-labelledby`. No `label` prop was added,
because the node does not define one and inventing a text slot would be
inventing an API the design does not have.

`disabled` uses `aria-disabled` rather than the DOM `disabled` attribute, so
the control stays reachable by keyboard and can be read before it is skipped.
The click guard is therefore in the handler rather than left to the DOM.

## Tokens

Every value resolves to a token in `build/css/<platform>/tokens.css`. Nothing
is a raw hex, px or font name.

### Bound in Figma

These three are the *only* variables `get_variable_defs` returns for 17:1201,
and all three are colour.

| Property | Figma variable | CSS |
|---|---|---|
| track fill, `On=true` | `semantic.color.bg.primary.idle` | `--color-bg-primary-idle` |
| track fill, `On=false` | `semantic.color.border.primary.default` | `--color-border-primary-default` |
| knob fill | `semantic.color.bg.base` | `--color-bg-base` |

The off track takes a **border** token as a **fill**. Reproduced as drawn, but
noted — `color.bg.*` is the family a fill would normally come from.

### Not bound in Figma — see the gaps below

| Property | node | CSS | web | admin | mobile |
|---|---|---|---|---|---|
| track width | 40 | `--size-control-md` | 40 | 32 | 44 |
| knob size | 16 | `--size-icon-sm` | 16 | 16 | 16 |
| knob inset | 3 | `--spacing-padding-xs` | 4 | 2 | 4 |
| track height | 22 | derived: knob + 2 × inset | 24 | 20 | 24 |
| knob travel | 18 | derived: width − knob − 2 × inset | 16 | 12 | 20 |
| track radius | rx 11 | `--border-radius-chip` | pill | pill | pill |
| knob radius | circle | `--border-radius-avatar` | circle | circle | circle |
| transition duration | — | `--motion-duration-fast` | 100ms | 100ms | 100ms |
| reduced motion | — | `--motion-duration-instant` | 0ms | 0ms | 0ms |

### States, not drawn in Figma — see gap 3

| State | CSS |
|---|---|
| hovered, on | `--color-bg-primary-hovered` |
| hovered, off | `--color-border-primary-hovered` |
| pressed, on | `--color-bg-primary-pressed` |
| pressed, off | *no token exists* — keeps the hovered colour |
| focused | `--elevation-focused` |
| disabled | `--opacity-disabled` |

---

## Gap 1 — the whole geometry is unbound

The track's 40×22 box, the 16px knob and the 3px knob inset are raw numbers in
the node. No size or spacing variable sits behind any of them, and the export
has **no token equal to 22 or to 3** in any family or any platform mode. The
size scale steps 12, 16, 20, 24; the spacing scale steps 0, 2, 4, 8.

Rather than hardcode four raw px values, each is bound to the nearest semantic
token whose family carries the right meaning, and each is declared once as a
custom property on `.lumo-switch` so that closing the gap is a one-line change.
The track height and the knob travel are then *derived* from those, so the pill
can never go lopsided.

Two consequences worth stating plainly:

1. **The switch is not 40×22, even in web.** It is 40×24, because the inset
   rounds 3 up to 4.
2. **The switch is a different size per platform mode**, because
   `size/control/md` and `spacing/padding/xs` are both mode-dependent — 40/4 in
   web, 32/2 in admin, 44/4 in mobile. The node draws one fixed size. Whether a
   toggle *should* scale with the platform is a design decision, and this build
   is not the place it gets made.

**What would close it:** author `lumo.semantic.size.toggle.track`,
`lumo.semantic.size.toggle.knob` and `lumo.semantic.spacing.toggle.inset` in
Figma with per-mode values, and bind the node's layers to them. Then the four
custom properties at the top of `switch.css` point at those instead and the
derived values follow.

## Gap 2 — no radius token is named for a toggle

The track's `rx=11` on a 22px box is a pill and the knob is a circle, but
neither binds a variable, and the semantic radius scale — `tag`, `checkbox`,
`button`, `input`, `card`, `dropdown`, `modal`, `chip`, `avatar` — has no
toggle or switch entry.

`radius/chip` and `radius/avatar` are borrowed. Both resolve to `radius/full`
(999px) in every platform mode, so **the rendered shape is exact** and only the
token name is wrong. This gap is cosmetic in the code and real in the token
set.

**What would close it:** `lumo.semantic.border.radius.toggle`, aliased to
`radius.full`.

## Gap 3 — Figma draws no interaction state at all

The set defines `On` and nothing else. There is no hovered, pressed, focused,
disabled, error or loading variant anywhere in 17:1201.

That absence cannot be honoured the way Badge honoured it. Badge is read, not
clicked, so having no states was correct. A toggle whose setting "takes effect
immediately" is the opposite: a control with no focus ring and no disabled
affordance is a defect, and `CLAUDE.md` asks every component to cover the
states the product uses.

So the states are implemented, **as behaviour**, bound to semantic tokens that
already exist and whose own descriptions carry exactly these meanings. **No
token was invented.** But the *mapping* is this build's reading of the token
names, not a decision a designer made on the canvas, and it needs confirming
against drawn variants.

One sub-gap inside it: there is no `color.border.primary.pressed` in the
export, so the **off** track has nothing to darken to while held. It keeps its
hovered colour. That is approximation by omission, flagged rather than filled.

**What would close it:** draw `State` as a second variant property on 17:1201 —
or at minimum confirm the six mappings in the table above.

## Gap 4 — the motion easing tokens have no value

Pre-existing, and it lands directly on this component: a switch's knob
animates, so easing is the one motion property it actually needs.

`build-tokens.js` warns that eight tokens have no value anywhere in the export
and are skipped. Five of them are the entire easing scale —
`motion.easing.standard`, `.decelerate`, `.accelerate`, `.emphasized` and
`.linear`.

The knob transition therefore carries `--motion-duration-fast` and **no easing
token at all**, falling back to the browser default. Nothing was invented to
cover it.

**What would close it:** give those five tokens a value in Figma and re-export.
Then the transition in `switchKnob.css` gains
`var(--motion-easing-standard)` and nothing else changes.

## Verified

Local Storybook on port 6009, all seven stories, console clean — the only two
console lines are pre-existing Storybook deprecation warnings that have nothing
to do with this component.

Measured off the rendered DOM, not eyeballed:

| | web | admin | mobile |
|---|---|---|---|
| track | 40×24 | 32×20 | 44×24 |
| padding | 4px | 2px | 4px |
| knob | 16×16 | 16×16 | 16×16 |
| knob travel | 16px | 12px | 20px |
| radius | 999px | 999px | 999px |

All three platform modes were checked in the toolbar, because gap 1 makes the
geometry mode-dependent. Light and dark were both checked; the colour tokens
flip correctly, and the knob follows `color/bg/base` down into the dark palette.

Colour, against the node's own SVG fills:

| | node | rendered (web, light) |
|---|---|---|
| track, `On=true` | `#1695B1` | `rgb(22, 149, 177)` |
| track, `On=false` | `#BFC2CF` | `rgb(191, 194, 207)` |
| knob | `#FFFFFF` | `rgb(255, 255, 255)` |

Behaviour:

- Renders as `<button role="switch">` with `aria-checked` tracking the value.
- Pointer click toggles; Space toggles; Enter toggles.
- `:focus-visible` on a real Tab press resolves to
  `rgba(22, 190, 227, 0.4) 0 0 0 3px`, which is `elevation/focused` exactly.
  Mouse clicks leave no ring.
- Hover on the **on** track resolves to `#176e82` — `bg/primary/hovered`.
- Disabled: focusable and announced (`aria-disabled="true"`), `opacity` 0.4,
  `cursor: not-allowed`, and neither click nor Space nor Enter moves it.
- Both controlled and uncontrolled stories behave as documented.

**Pressed was not observed live.** Holding a mouse button down across a
measurement is not something the tooling does cleanly, so the `:active` rule
was verified only by its token resolving (`bg/primary/pressed` → `#132f35`) and
by the rule being present on the same custom property that hover was proven to
drive. QA should press and hold it.

`npm run lint` could not be run: **that script does not exist** in
`package.json`, which lists only `build:tokens`, `storybook` and
`build:storybook`. `tools.md` already records this under "Not set up yet". No
lint script was added — tooling changes route through `tools.md`. The closest
available check, `npm run build:storybook`, was run instead and passes.

Not verified: the deployed staging build. Nothing was written to the registry's
`Staging Storybook` by this build, because there is no deployed build to point
it at.
