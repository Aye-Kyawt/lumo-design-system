# badge

Figma component set **17:1139** —
<https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1139>

> Use a badge to label a status or category the user reads, not clicks — a category tag,
> a status pill, a "Most popular" flag. Don't use it for something the user can interact
> with; use Chip for that.
> — the component's own description in Figma

## The matrix

One variant property, five variants. There is no size property and no state property.

| Figma variant | node | prop |
|---|---|---|
| `Tone=Primary` | 17:1140 | `tone="primary"` |
| `Tone=Success` | 17:1142 | `tone="success"` |
| `Tone=Warning` | 17:1144 | `tone="warning"` |
| `Tone=Danger`  | 17:1146 | `tone="danger"` |
| `Tone=Neutral` | 17:1148 | `tone="neutral"` |

Every variant is 65×24, auto-layout hug, holding one text layer named `Label`
(45×16 at x=10, y=4). That layer is the `label` prop. The set has no
sub-components and imports nothing, so `Composes` in the registry is empty.

## Why there are no interaction states

`CLAUDE.md` asks every component to cover every interaction state the product
uses, *as applicable*. None is applicable here. The set defines no hovered,
pressed, focused, disabled, error or loading variant, and the component
description says outright that a badge is read rather than clicked, pointing at
Chip for the interactive case. So the badge renders as a `<span>`, takes no
`onClick`, and is not focusable — adding hover or focus affordances would
advertise an interaction that does not exist.

## Tokens

Every value below resolved to a semantic token in `build/css/web/tokens.css`.
Nothing is a raw hex, px or font name.

### Shared by all five

| Property | Figma variable | CSS |
|---|---|---|
| radius | `semantic.border.radius.chip` | `--border-radius-chip` |
| padding, block | `semantic.spacing.padding.xs` | `--spacing-padding-xs` |
| padding, inline | **unbound — see gap 1** | `--spacing-padding-sm` |
| typography | style `Label/Label1` | `--label-label1` |
| ↳ family | `semantic.typography.fontFamily.label` | `--typography-fontfamily-label` |
| ↳ size | `semantic.typography.fontSize.sm` | `--typography-fontsize-sm` |
| ↳ line height | `semantic.typography.lineHeight.sm` | `--typography-lineheight-sm` |
| ↳ weight | `semantic.typography.fontWeight.medium` | `--typography-fontweight-medium` |

### Per tone

| Tone | surface | label |
|---|---|---|
| Primary | `--color-bg-primary-tonal-idle` | `--color-text-brand` |
| Success | `--color-bg-positive-tonal-idle` | `--color-icon-positive` |
| Warning | `--color-bg-warning-tonal-idle` | `--color-icon-warning` |
| Danger  | `--color-bg-negative-tonal-idle` | `--color-text-negative` |
| Neutral | `--color-bg-surfacesecondary` | `--color-text-secondary` |

Measured in Storybook, every one of the ten colours resolves to exactly the hex
the Figma variable carries.

## Design gaps — reported, not filled in

1. **The horizontal padding is not bound to anything.** The node's auto-layout
   is 4px vertical and 10px horizontal, but only the vertical side carries a
   variable (`spacing/padding/xs`). The 10 is a raw number, and the semantic
   padding scale has no 10 step — `xs=4, sm=8, md=16, lg=24, xl=32` — nor does
   the core scale, which jumps 8 → 12. Authoring a 10px token is a design
   decision, so the component binds the nearest step in the right family,
   `spacing/padding/sm`, and **renders 61×24 where the node is 65×24**: 2px
   narrower per side, same height. It sits behind one custom property,
   `--lumo-badge-padding-inline` in `badge.css`, so closing the gap is a
   one-line change. A designer should either bind the node's horizontal padding
   to `spacing/padding/sm` or author the missing step and bind to that.

2. **Success and Warning put an icon token on a text layer.** Three tones bind
   their label to a `color/text/*` variable; Success binds `color/icon/positive`
   (`#16e362`, green/600) and Warning binds `color/icon/warning` (`#e37316`,
   orange/600). `color/text/positive` (green/800) and `color/text/warning`
   (orange/700) both exist and are unused here. The code follows the design as
   drawn. Worth a designer's eye for two reasons: it is inconsistent with the
   other three tones, and `#16e362` on the `#effaf3` surface is by far the
   weakest contrast pairing in the set — the Success badge is the one that is
   hard to read.

3. **Pre-existing, repo-wide.** The token build still warns that
   `border-style-*` and `motion-easing-*` have no value in the export. Badge
   uses neither. Already recorded under `docs/card.md`.

## Repo notes

- **`npm run lint` does not exist.** The build skill's stage 3 check asks for
  it; `package.json` defines no `lint` script and no linter is installed, which
  `tools.md` already records under "Not set up yet". Verification was done in
  Storybook instead — all 8 stories compile and render, the console is clean,
  and computed styles were measured against the node's variables.
- **A second launch configuration was added**, `storybook-alt` on port 6007 in
  `.claude/launch.json`, because port 6006 was held by another session. No
  change to `package.json`, no dependency added.
