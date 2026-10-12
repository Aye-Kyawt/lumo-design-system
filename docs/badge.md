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
| Warning | `--color-bg-warning-tonal-idle` | `--color-text-orange-twotone` |
| Danger  | `--color-bg-negative-tonal-idle` | `--color-text-red-twotone` |
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
| Danger  | `#821720` on `#faeff0` | **8.92** | passes, AAA |
| Warning | `#824717` on `#faf4ef` | **6.72** | passes |
| Primary | `#176e82` on `#eff8fa` | **5.43** | passes |
| Neutral | `#636679` on `#ebedf4` | **4.84** | passes |
| Success | `#17823e` on `#effaf3` | **4.57** | passes |

**All five clear AA.** Danger and Warning, the two that used to fail, are now the
two strongest — a side effect of the `twoTone` tier being built for exactly this
pairing. See gap 2.

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

### 2. Label contrast — **resolved**, in two passes

**Pass one.** Success and Warning bound an **icon** token to a text layer where
the other three tones bound a text token — inconsistent, and the reason the
Success badge was close to unreadable. Both were rebound to the text tier.

**Pass two.** That fixed Success but left Warning at 4.36 and Danger at 4.23,
both under AA. The remedy was *not* a darker shade authored, and *not* a shared
token retargeted. The system already has a matched **`twoTone` tier** — a
`bg/<hue>/twoTone` and a `text/<hue>/twoTone` per hue, intended to be used as a
pair — and Badge's surfaces already *were* those backgrounds. Only the labels
were on the wrong tier.

| Tone | pass one | pass two | ratio |
|---|---|---|---|
| Success | `icon/positive` `#16e362` → `text/positive` `#17823e` | — | 1.61 → **4.57** |
| Warning | `icon/warning` `#e37316` → `text/warning` `#b15c16` | → `text/orange/twoTone` `#824717` | 2.86 → 4.36 → **6.72** |
| Danger  | — | `text/negative` `#e31628` → `text/red/twoTone` `#821720` | 4.23 → **8.92** |

The surfaces were already right, and not just coincidentally — they resolve to
the *same primitive*, not merely the same hex:

| Badge binds | resolves to | twoTone pair | resolves to |
|---|---|---|---|
| `bg/warning/tonal/idle` | `orange/100` `#faf4ef` | `bg/orange/twoTone` | `orange/100` |
| `bg/negative/tonal/idle` | `red/100` `#faeff0` | `bg/red/twoTone` | `red/100` |

**Why the tier and not a retarget.** The alternative was retargeting
`color/text/negative` to something darker. `button.css` consumes that token for
its error states, so it would have changed Button — which sits `Completed` with
a production link — and invalidated Button's test evidence for a fix that had
nothing to do with Button. The `twoTone` route changed Badge and nothing else.

**Naming.** The generated custom properties lowercase the camelCase:
`color/text/orange/twoTone` emits as `--color-text-orange-twotone`. Verified in
`build/css/` for web, admin and mobile rather than inferred from the Figma name.

### Open question — should Badge be on `twoTone` throughout?

Not a gap, and **not implemented**: this is a visual change to tones that already
pass, so it is a design decision nobody has made yet.

Badge now straddles two tiers. Warning and Danger are on `twoTone`; Primary,
Success and Neutral are on the general text tier. All five surfaces are already
`<hue>/100`, which is what `bg/<hue>/twoTone` resolves to, so the tier is in
effect half-adopted.

| Tone | today | on `twoTone` | effect |
|---|---|---|---|
| Primary | `text/brand` `#176e82` — 5.43 | `text/aqua/twoTone` `#164d5a` — **8.68** | visibly darker |
| Success | `text/positive` `#17823e` — 4.57 | `text/green/twoTone` `#17823e` — 4.57 | **no visual change** |

Success is the telling one: `color/text/positive` and `color/text/green/twoTone`
both resolve to `green/800`, so moving it is pure provenance — same pixels,
different tier. Primary is a real visual change, and the one that needs a
decision. Neutral has no `twoTone` counterpart at all: the tier covers aqua,
purple, blue, mint, green, yellow, orange, red and pink, with no neutral or grey,
so Neutral would stay on `text/secondary` regardless.

If the answer is yes, Badge ends up consistently on one tier and Primary gains a
lot of contrast. If no, this section is the record of why it is mixed.

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
