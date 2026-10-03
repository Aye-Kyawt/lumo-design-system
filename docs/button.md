# Button — build report

**Figma node:** [`26:1657`](https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=26-1657)
**Component set:** `button`, node `26:1665`
**Code:** `src/components/button/`
**Branch:** `component/button`

Figma's description: *"Use this component when need CTA. Don't use it for opening external link."*

## Variant matrix

`State` x `Type`, 15 variants. Every row has a story.

| | fill | outline | transparent |
|---|---|---|---|
| **default** | `26:1657` | `28:1753` | `29:1792` |
| **hovered** | `26:1666` | `28:1757` | `29:1796` |
| **focused** | `28:1689` | `28:1761` | `29:1800` |
| **disabled** | `28:1699` | `28:1765` | `29:1804` |
| **error** | `28:1705` | `28:1769` | `29:1808` |

Four further properties are independent of the matrix: `label` (string),
`text`, `iconLeft` and `iconRight` (booleans).

Measured in Storybook: all fifteen render at **116.5 x 36.0**. Height is exact.
Width is a consistent 1.5px under Figma's 118 on every single row, because
Inter's "Button" measures 44.54px in the browser against Figma's 46px — a text
rasterisation difference, identical across all fifteen, not a component defect.

## Token map

Every value resolves to a semantic token; there is no raw hex, px or font name
in any component file. The skin is carried by four custom properties
(`--lumo-button-bg`, `--lumo-button-fg`, `--lumo-button-icon`,
`--lumo-button-ring-*`) so each of the fifteen combinations is one short rule.

**Shared by every variant**

| Property | Token |
|---|---|
| Padding and gap | `--spacing-padding-sm` |
| Corner radius | `--border-radius-input` |
| Label type | `--button-button1` (style `Button/Button1`) |
| Icon size | `--size-icon-md` |
| State transition | `--motion-duration-fast` |

**fill**

| State | Surface | Edge | Label | Icon |
|---|---|---|---|---|
| default | `bg-primary-idle` | — | `text-onaction` | `icon-onaction` |
| hovered | `bg-primary-hovered` | — | `text-onhovered` | `icon-onhovered` |
| focused | `bg-primary-idle` | 2px `border-primary-focused` | `text-onfocus` | `icon-onfocus` |
| disabled | `bg-disabled` | — | `text-disabled` | `icon-disabled` |
| error | `bg-negative-idle` | — | `text-onaction` | `icon-onaction` |

**outline**

| State | Surface | Edge | Label | Icon |
|---|---|---|---|---|
| default | `bg-base` | 1px `icon-brand` | `text-accent-aqualight` | `icon-brand` |
| hovered | `bg-primary-tonal-idle` | 1px `border-brand-hovered` | `text-accent-aqualight` | `icon-brand` |
| focused | `bg-base` | 2px `border-primary-focused` | `text-actionpressed` | `icon-actionpressed` |
| disabled | `bg-base` | 1px `border-primary-disabled` | `text-disabled` | `icon-disabled` |
| error | `bg-base` | 1px `icon-negative` | `text-negative` | `icon-negative` |

**transparent**

| State | Surface | Edge | Label | Icon |
|---|---|---|---|---|
| default | — | — | `text-accent-aqualight` | `icon-brand` |
| hovered | `bg-primary-tonal-idle` | — | `text-brand` | `text-brand` |
| focused | — | — | `bg-primary-pressed` | `bg-primary-pressed` |
| disabled | — | — | `text-disabled` | `icon-disabled` |
| error | — | — | `text-negative` | `icon-negative` |

## Translation decisions

### The edge is an inset ring, so all fifteen are the same box

In Figma the outline variants are **120 x 38** with a 1px stroke, but outline
**focused** is **118 x 36** with a 2px stroke — the first four are drawn with an
outside stroke and focused with an inside one. Taken literally that means an
outline button grows 2px wider than a fill button beside it, and then shrinks by
2px the moment it takes focus.

The component draws every edge as `box-shadow: inset`, so all fifteen variants
are one box and nothing moves on focus. This is a deliberate deviation from four
of the Figma frames; see the design gap below.

### `state` forces, the DOM does the rest

`state` is the Figma property and forces the visual state, which is what the
stories and QA need. The component is a real `<button>`, so with no `state`
forced it still hovers, takes focus, answers Enter and Space, and goes inert
under `state="disabled"` via the genuine `disabled` attribute. Verified: 0 of 3
clicks fired on disabled buttons and none accepted focus; Enter and Space each
fired exactly one click; a real pointer hover resolved to `bg-primary-hovered`.

### Icons are Material Symbols, not downloaded SVGs

`CLAUDE.md` specifies Material Symbols from the Google Fonts CDN, and Figma
names the icon `Icon/add` — "Material Icons Outlined · add". The icons are font
glyphs, so nothing is downloaded into the repo and each one takes its colour
from its own token. `.storybook/preview-head.html` gains the stylesheet link.
Confirmed loaded by canvas measurement against a bogus family, not by
`document.fonts.check()`.

An icon-only button (`text={false}`) keeps `label` as its `aria-label`, and the
glyph spans are `aria-hidden`, so the ligature text never leaks into the
accessible name.

## Naming

Two of Button's prop names could not be taken straight from Figma. Both are
recorded in [`naming-conflicts.md`](naming-conflicts.md) with the reasoning:

- **`type` collides with the DOM button type.** The Figma variant keeps `type`;
  the DOM attribute is `htmlType`, defaulting to `"button"` so a Button inside a
  form cannot submit it by accident.
- **The icon swap slots became glyph names.** `↳iconLeft` / `↳iconRight` are
  `iconLeftName` / `iconRightName`, taking a Material Symbols name. `iconLeft`
  and `iconRight` stay as the booleans Figma defines.

## Design gaps — reported, not filled in

1. **`transparent/focused` has no focus indicator.** Node `29:1800` binds
   `border/width/focused` but no border colour, and renders no edge at all — the
   variant is distinguished only by darkening the label. A focusable control
   with no visible focus indicator fails WCAG 2.4.7. The `state="focused"` prop
   reproduces the node exactly so QA can compare, but **real keyboard focus gets
   the ring that fill and outline already use** (`border-primary-focused` at
   `border-width-focused`) rather than an invented value. A designer should
   decide what transparent focus looks like.

2. **Outline stroke alignment is inconsistent.** Four outline variants are
   120x38 (1px outside stroke); `outline/focused` is 118x36 (2px inside). These
   cannot both be right. The component uses an inside stroke throughout — see
   above — but the node needs fixing either way.

3. **Two accent-aqua variables share one description.** The library has both
   `color/text/accent/aqua` (aqua/800, `#176e82`) and
   `color/text/accent/aquaLight` (aqua/600, `#16bee3`), and **both carry the
   identical description** "lumo.semantic.color.text.accent.aqua — Accent Colors
   · aqua foreground". The Figma MCP compounds this by rendering both as
   `--lumo-semantic-color-text-accent-aqua`, with only the resolved value to
   tell them apart. Button binds `aquaLight`; this was caught by measuring the
   rendered colour against the node, not by reading the name. The descriptions
   should be made distinct before this trips someone else.

4. **Icon tokens are doing border duty.** `outline/default` takes its border
   from `color/icon/brand` and `outline/error` from `color/icon/negative`, while
   `color/border/brand/default` and `color/border/negative/default` both exist
   and are unused here. The component follows what the node binds. Worth a
   designer's pass — the border roles exist for this.

5. **`transparent/focused` colours the label with a background token.**
   `color/bg/primary/pressed` is used as a text colour. It resolves to a
   readable value, but the role is wrong; `color/text/actionPressed` is what
   `outline/focused` uses for the same job.

6. **Gap uses a padding token.** Every variant sets its flex gap from
   `spacing/padding/sm` rather than `spacing/gap/horizontal/sm`. Both are 8px so
   nothing renders wrong, but the roles are not interchangeable.

## Repo notes

Same two mismatches with `tools.md` as Card: the repo has no TypeScript (built
`.jsx`, matching every existing story) and no `npm run lint` or test runner, so
the build skill's lint check could not be run. Verification was done in
Storybook — all 23 stories compile and render, console clean, computed styles
and geometry measured against the node, and every interactive state driven
rather than merely rendered.

`.storybook/main.js` needed the same `src/components/**/*.stories.jsx` glob that
the Card branch adds; `component/button` branched from `staging`, which does not
have it yet. The change is byte-identical in both branches. No dependency added.
