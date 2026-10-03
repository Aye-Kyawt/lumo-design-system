# Card — build report

**Figma node:** [`64:113`](https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=64-113)
**Component set:** `card`, node `65:230`
**Code:** `src/components/card/`
**Branch:** `component/card`

## Variant matrix

`State` x `Padding`, 16 variants. Every row has a story.

| | Padding=none | Padding=md | Padding=lg | Padding=xl |
|---|---|---|---|---|
| **State=default** | `64:113` | `64:153` | `64:193` | `64:233` |
| **State=hovered** | `64:123` | `64:163` | `64:203` | `64:243` |
| **State=focused** | `64:133` | `64:173` | `64:213` | `64:253` |
| **State=disabled** | `64:143` | `64:183` | `64:223` | `64:263` |

Measured in Storybook against the node, at 320px: `none` 156px, `md` 188px,
`lg` 204px, `xl` 220px tall — identical in all four states, as in Figma.

## Sub-components

Per `CLAUDE.md`, the organism is broken down and reintegrated rather than
flattened. Each Figma sub-component is its own file in `src/components/card/`.

| Figma | Node | File |
|---|---|---|
| `card` | `65:230` | `card.jsx` |
| `card/layout/vertical` | `63:98` | `cardLayoutVertical.jsx` |
| `card/header` | `62:109` | `cardHeader.jsx` |
| `card/footer` | `62:115` (instance `63:106`) | `cardFooter.jsx` |

The card owns the surface, edge, radius and padding. Everything inside comes
from a layout placed in the `↳Layout` slot — the card never styles its contents.

## Token map

Figma publishes variables as `--lumo-semantic-*`. The Style Dictionary build in
this repo emits the same tokens under shorter, lowercased names. Every value in
the component resolves to one of these; there is no raw hex, px or font name in
any component file.

| Property | Figma variable | Token used |
|---|---|---|
| Card surface | `color/bg/base` | `--color-bg-base` |
| Card surface, disabled | `color/bg/disabled` | `--color-bg-disabled` |
| Edge, default | `color/border/primary/default` | `--color-border-primary-default` |
| Edge, hovered | `color/border/primary/hovered` | `--color-border-primary-hovered` |
| Edge, focused | `color/border/primary/focused` | `--color-border-primary-focused` |
| Edge, disabled | `color/border/primary/disabled` | `--color-border-primary-disabled` |
| Edge width | `border/width/default` | `--border-width-default` |
| Edge width, focused | `border/width/focused` | `--border-width-focused` |
| Corner radius | `border/radius/card` | `--border-radius-card` |
| Card padding md / lg / xl | `spacing/padding/{md,lg,xl}` | `--spacing-padding-{md,lg,xl}` |
| Layout padding | `spacing/padding/sm` | `--spacing-padding-sm` |
| Stack gap | `spacing/gap/md` | `--spacing-gap-md` |
| Footer stack gap | `spacing/gap/sm` | `--spacing-gap-sm` |
| Header gap | `spacing/gap/horizontal/md` | `--spacing-gap-horizontal-md` |
| Footer row gap | `spacing/gap/horizontal/sm` | `--spacing-gap-horizontal-sm` |
| Title / subtitle gap | `spacing/gap/xs` | `--spacing-gap-xs` |
| Title type | style `Heading/H5` | `--heading-h5` |
| Title colour | `color/text/primary` | `--color-text-primary` |
| Subtitle type | style `Body/Body3` | `--body-body3` |
| Subtitle colour | `color/text/secondary` | `--color-text-secondary` |
| State transition | `motion/duration/fast` | `--motion-duration-fast` |

`Padding=none` means no padding **on the card**. The 8px you still see inside
belongs to `card/layout/vertical`, which carries `padding/sm` of its own in
every variant.

## Translation decisions

Things where the code deliberately differs from a literal reading of the node.
Each is a judgement call, not an oversight.

### The edge is an inset shadow, not a CSS border

Figma draws the card edge as an **inside** stroke: it sits within the card's box
and never changes its size, which is why the focused variant at 2px is exactly
as tall as the default at 1px. A CSS `border` on an auto-height box cannot do
that — it adds 2px to every card and makes focus reflow the content by a pixel.
The component uses `box-shadow: inset 0 0 0 <width> <colour>` instead, which is
the honest translation of an inside stroke and reproduces the Figma heights
exactly. A `forced-colors` block restores a real outline for Windows High
Contrast, where box-shadow is dropped and visibility beats pixel fidelity.

### The card sets no width

Every variant is drawn at 320px in Figma because a component set needs a frame
width. A card in a product fills the column it sits in, so the component is
`inline-size: 100%` and width belongs to the caller. The stories pin 320px so
they can be compared against the node.

### `state` forces; `onClick` enables

`state` is the Figma property and forces the visual state, which is what the
stories and QA need. On its own that would be decoration, so the card also has
real behaviour: pass `onClick` and it becomes `role="button"`, takes focus,
answers Enter and Space, and gets live `:hover` / `:focus-visible` painted from
the same tokens. `state="disabled"` drops the role and the tab stop, sets
`aria-disabled`, and blocks the click even when `onClick` is passed. No
`interactive` property was invented — a handler the caller already has to supply
is the switch.

### The dashed placeholder is story scaffolding

`_Slot/Content` (`41:21`) is a Figma placeholder — its own description says
never to ship a screen with a slot still showing. It lives in
`card.stories.css`, never in the component, and the component exposes
`children` instead.

## Design gaps — reported, not filled in

1. **`border/style/*` and `motion/easing/*` have no values in the export.**
   The token build warns that `border-style-{solid,dashed,dotted}` and
   `motion-easing-{standard,decelerate,accelerate,emphasized,linear}` "have no
   real value anywhere in the export and were skipped". Checked against the
   Figma source over the MCP: `border/style/solid` and `border/style/dashed`
   **do exist**, in both the `lumo.core` and `lumo.semantic.border` collections
   of `Lumo.Token.V1.0.Complete`. So this is an **export-scope problem, not
   missing design work** — the collections holding those values were left out of
   the export, and a re-export with them selected should fix it without a
   designer authoring anything. Until then the component writes `solid` /
   `dashed` as plain CSS keywords and leaves the transition's easing at the CSS
   default. This is pre-existing and affects the whole repo, not just Card.

2. **Disabled text is not dimmed.** The `State=disabled` variants bind title and
   subtitle to `color/text/primary` and `color/text/secondary`, the same as
   every other state, while the surface moves to `color/bg/disabled` (`#dadce7`).
   `color/text/disabled` exists and is unused here. The code follows the design
   as drawn. Worth a designer's eye: the intent may have been to dim the content
   too, and the subtitle on the disabled surface is the weakest pairing in the set.

3. **The placeholder's fallback colour disagrees with its variable.** In
   `_Slot/Content` the text is bound to `color/text/secondary` (`#636679`) but
   carries a fallback of `#bfc2cf`, which is `color/border/primary/default`.
   Cosmetic, and only affects a placeholder, but it suggests the binding was
   changed without the fallback following.

4. **A token description is stale.** `color/border/primary/disabled` is
   described as `lumo.semantic.color.border.disabled` — an older path. The
   variable itself is correct and correctly exported; only the description text
   is out of date.

## Repo notes

Two things in `tools.md` do not match the repo as it stands, and I built to the
repo rather than to the document:

- **TypeScript.** `tools.md` says "Typescript, strict", and the build skill asks
  for `.tsx`. The repo has no TypeScript — no compiler, no config, no
  dependency — and every existing story is `.jsx`. Card is built as `.jsx` to
  match. Converting the repo to TypeScript is its own piece of work.
- **`npm run lint` does not exist.** `tools.md` lists `npm run Lint` as the type
  check and `npm test` for tests; `package.json` defines neither, and there is no
  test runner installed. The build skill's "lint passes" check could not be run.
  Verification was done in Storybook instead: all 23 stories compile and render,
  the console is clean, and computed styles were measured against the node.

One config change was needed: `.storybook/main.js` only globbed `stories/`, so
nothing in `src/components/` could ever appear. Added
`'../src/components/**/*.stories.jsx'`. No dependency was added.
