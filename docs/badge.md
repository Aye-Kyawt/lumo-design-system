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
| Success | `--color-bg-positive-tonal-idle` | `--color-text-positive` |
| Warning | `--color-bg-warning-tonal-idle` | `--color-text-warning` |
| Danger  | `--color-bg-negative-tonal-idle` | `--color-text-negative` |
| Neutral | `--color-bg-surfacesecondary` | `--color-text-secondary` |

Measured in Storybook, every one of the ten colours resolves to exactly the hex
the Figma variable carries.

### Both padding tokens are mode-dependent

Badge's padding is the one part of it that changes shape by platform, and
**both** sides move, not just the horizontal one:

| Token | `web` | `mobile` | `admin` |
|---|---|---|---|
| `spacing/padding/xs` — block | 4 | 4 | **2** |
| `spacing/padding/sm` — inline | 8 | 8 | **4** |

So the badge measures 60.67×24 in web and mobile and **52.67×20 in admin** —
measured in Storybook with the platform switcher, not inferred from the token
files. This is not a gap: both tokens exist and carry real values in all three
modes, and halving the padding in a denser admin theme is the token doing
exactly what it is for. It is recorded because the difference is invisible from
the component source, which only ever says `var(--spacing-padding-sm)`, and
because the Figma node is drawn in the web mode alone — anyone comparing the
admin rendering against that node will see a 8×4 difference that is correct.

## Contrast

Measured foreground against each tone's own tonal surface. AA for this text size
(12px, weight 500) is 4.5:1.

| Tone | label on surface | ratio | |
|---|---|---|---|
| Primary | `#176e82` on `#eff8fa` | **5.43** | passes |
| Neutral | `#636679` on `#ebedf4` | **4.84** | passes |
| Success | `#17823e` on `#effaf3` | **4.57** | passes |
| Warning | `#b15c16` on `#faf4ef` | **4.36** | under AA — gap 2 |
| Danger  | `#e31628` on `#faeff0` | **4.23** | under AA — gap 2 |

## Design gaps

### 1. Horizontal padding — **resolved**

Originally the node's horizontal padding was a raw 10px bound to no variable,
while the semantic scale had no 10 step (`xs=4, sm=8, md=16, lg=24, xl=32`; the
core scale jumps 8 → 12). Rather than author a token, the component was built
against `spacing/padding/sm` and the gap reported.

The designer has since **bound the node's `paddingLeft`/`paddingRight` to
`spacing/padding/sm`**, which is the same token the component already used — so
code and design now agree at token level, not merely by eye. Read back from the
node to confirm.

Badge renders **60.67×24 against the node's 61×24**. The residual 0.33px is text
rasterisation, not layout: Figma lays "Primary" out at 45px and the browser at
44.67. Padding, height and radius match exactly.

`--lumo-badge-padding-inline` in `badge.css` stays a named property — it is the
one measurement that had to be argued for rather than read off, and it is the
one whose value moves between platform modes.

### 2. Success and Warning rebound; Warning and Danger still under AA

Success and Warning used to bind an **icon** token to a text layer where the
other three tones bind a text token — inconsistent, and the reason the Success
badge was close to unreadable. The designer has rebound both:

| Tone | was | now | ratio |
|---|---|---|---|
| Success | `color/icon/positive` `#16e362` | `color/text/positive` `#17823e` | 1.61 → **4.57**, clears AA |
| Warning | `color/icon/warning` `#e37316` | `color/text/warning` `#b15c16` | 2.86 → **4.36**, still under AA |

So the inconsistency is closed and Success passes. **Two things remain open, and
both need a designer:**

- **Warning at 4.36:1** is a large improvement but has not cleared 4.5. It needs
  a darker orange authored in Figma.
- **Danger at 4.23:1** was never part of this rebind. It already binds
  `color/text/negative`, so there is no rebinding left to do — `#e31628`
  (red/600) is simply not dark enough on `#faeff0`. It needs a darker red.

Neither is something to approximate in code: picking a replacement shade is a
design decision, and the token that would carry it does not exist yet.

### 3. Pre-existing, repo-wide

The token build still warns that `border-style-*` and `motion-easing-*` have no
value in the export. Badge uses neither. Already recorded under `docs/card.md`.

## Repo notes

- **`npm run lint` does not exist.** The build skill's stage 3 check asks for
  it; `package.json` defines no `lint` script and no linter is installed, which
  `tools.md` already records under "Not set up yet". Verification was done in
  Storybook instead — all 8 stories compile and render, the console is clean,
  and computed styles were measured against the node's variables.
- **A second launch configuration was added**, `storybook-alt` on port 6007 in
  `.claude/launch.json`, because port 6006 was held by another session. No
  change to `package.json`, no dependency added.
