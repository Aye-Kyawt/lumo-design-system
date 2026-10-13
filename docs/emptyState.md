# Empty State — what the node says, and where the build departs from it

**Figma component set:** `empty-state`, node `94:1862` in
`Lumo.Web.Component.V1.0.In-Progress` (file `UbWxCGi4FaV4Ficg2iDnu0`).
**Variants:** `Size=sm` (`94:7`) and `Size=md` (`94:15`).

> Use an empty state when a list, card or page has nothing to show — no results,
> nothing created yet, a failed load, or no permission. Don't leave the user
> without a next step; always give the action.
> — the component description, on the node.

This is the first molecule in the library. It is also the first component whose
most important part is something it does **not** draw: the `↳Action` slot is
empty in Figma, and the real `Button` component goes into it.

---

## The matrix

| Figma property | Kind | Values | Prop |
|---|---|---|---|
| `Size` | variant | `sm`, `md` | `size` |
| `Title` | text | "No use cases match these filters" | `title` |
| `Description` | boolean | `true`, `false` | `description` |
| `Description` | text | "Try removing a filter, …" | `descriptionText` |
| `Action` | boolean | `true`, `false` | `action` |
| `↳Icon` | slot | `Icon/check` (`94:2`) | `icon`, `iconName` |
| `↳Action` | slot | *empty* | `children` |

Eight combinations: 2 sizes × 2 `Description` × 2 `Action`. The `Matrix` story
draws all eight.

## What is bound

Every colour and every type style in this component resolves to a semantic
token, with no substitution and no borrowing:

| Where | Token | Layer |
|---|---|---|
| Column gap | `--spacing-gap-md` | semantic |
| Medallion fill | `--color-bg-brand-subtle` | semantic |
| Glyph colour | `--color-icon-brand` | semantic |
| Glyph size | `--size-icon-md` | semantic |
| Title colour | `--color-text-bold` | semantic |
| Description colour | `--color-text-secondary` | semantic |
| Title, `sm` | `--body-body6-intense` | semantic (Figma `Body/Body6-Intense`) |
| Description, `sm` | `--body-body3` | semantic (Figma `Body/Body3`) |
| Title, `md` | `--heading-h4` | semantic (Figma `Heading/H4`) |
| Description, `md` | `--body-body2` | semantic (Figma `Body/Body2`) |

The four composite type tokens match their Figma styles declaration for
declaration — weight, size, line height and family — so nothing was approximated.

---

## The gaps

Six. None of them was filled in; each is recorded here and flagged at its
declaration in `emptyState.css`.

### 1 · The `↳Action` slot is a 100×100 placeholder, and it is load-bearing

`94:14` and `94:22` are both empty slots measuring exactly 100×100. That square
is not decoration — it is most of the frame:

```
sm:  56 (medallion) + 16 + 20 (title) + 16 + 32 (description) + 16 + 100 = 256
md:  72             + 16 + 24         + 16 + 40              + 16 + 100 = 284
```

So the node's published sizes, 360×256 and 520×284, are 100px taller than any
empty state with a real button in it will ever be. A `Button` is 36px tall.

**Built as:** the slot is sized by its contents. An `sm` empty state with one
button is about 192px tall, not 256px.

**Why this is not mine to decide:** rendering a fixed 100×100 box would put a
36px button in the top-left corner of a large empty square and push everything
apart, which is plainly not what the design means. But "plainly" is a judgement,
and the number is in the node. **A designer should either fill the slot in Figma
with the Button component or shrink it to hug.** Until then, QA measuring the
overall frame height against the node will find a difference, and the difference
is this.

### 2 · The medallion corner binds a core token

Figma binds the medallion's corner radius to `core.border.radius.full`. That is
the base layer. `.claude/skills/build/SKILL.md` says a component that reaches
for a base token "has skipped the semantic token that should sit in front of
it" — but here it is the **design** that reaches for it, not the build.

**Built as:** `var(--border-radius-full)`, exactly as bound. Resolved, not chosen.

**The decision needed:** the semantic layer already has two aliases of it,
`--border-radius-avatar` and `--border-radius-chip`, both `999px` in every
platform mode. Switch borrowed `radius/avatar` for its knob under exactly these
circumstances (`docs/switch.md`, gap 2) — but Switch bound *nothing*, where this
node binds core explicitly. Substituting a semantic alias here would be me
deciding which meaning the medallion has. A designer should add
`semantic.border.radius.medallion` (or point the node at `radius/avatar`) and
the one line in `emptyState.css` changes.

### 3 · The frame widths bind nothing, and no token carries them

`360px` (sm) and `520px` (md) bind no variable. No token at any layer — semantic
or core — carries either number. The nearest core sizes are `400` and `560`.

**Built as:** the component is fluid (`inline-size: 100%`) and the caller sizes
it. This is also what a design system component ought to do; a component that
hardcodes a page width cannot be put in a card, a drawer and a page.

The **story frames** need some width, and use `core.size.400` and
`core.size.560` — 40px wider than the node in each case. Text therefore wraps
slightly later in the stories than in the Figma screenshot.

### 4 · The description is inset, and the inset binds nothing

`94:13` is 320px wide inside a 360px frame (20px each side); `94:21` is 420px
inside 520px (50px each side). Neither width nor inset binds a variable, the two
insets are not the same, and neither 20/50 nor 320/420 is a token at any layer.

**Built as:** the description fills the container. It wraps where the caller's
width puts it.

**The decision needed:** if the inset is real — a measure constraint to stop the
line getting too long — it wants a token, and probably the same one in both
sizes. If it is just how the frame was drawn, the node should say so.

### 5 · The medallion sizes bind nothing

`56px` (sm) and `72px` (md) bind no variable. The semantic size scale has
nothing that fits: `--size-avatar-xl` is 64, `--size-icon-xl` is 32,
`--size-layout-sidebarcollapsed` is 72 but means a collapsed sidebar.

**Built as:** `var(--size-56)` and `var(--size-72)` — core primitives, exact in
web, admin and mobile alike.

This is the same shape as Progress reaching core for its unbound track height
(`docs/progress.md`), and it is recorded for the same reason: the value is right,
the layer is wrong, and the fix is a semantic token the designer adds —
`semantic.size.medallion.sm` / `.md`.

### 6 · The set draws no interaction states

No hovered, no pressed, no focused, no disabled, no loading — `Size` is the only
variant property and the two values differ only in geometry and type.

**Built as:** no states. Not one was added.

This is deliberate, and it is the opposite of what Switch did (`docs/switch.md`,
gap 3, where four undrawn states were invented and merged knowingly). An empty
state is a static display: everything interactive about it is the `Button` in the
action slot, and Button already ships all five of its own states. The
`↳Action slot` story shows a disabled Button inside an Empty State to make that
visible. **If the product needs the empty state itself to have a loading or
error skin, that is a design decision and the node has to draw it.**

---

## What it composes, and what it does not

`emptyState.jsx` imports exactly one thing: its own `emptyStateIcon.jsx`.

- **`Button`** goes in the `↳Action` slot, as `children`. It is imported in the
  stories and never re-implemented — no button styling exists anywhere in
  `emptyState.css`. Composing it through a slot rather than hardcoding it is
  what the node asks for, since the node's slot is empty.
- **`Card`** is imported in the `In context` story only, to show where an empty
  state lives.

### The icon is a sibling, not a reuse — and that is a system gap

`emptyStateIcon.jsx` is almost identical to `button/buttonIcon.jsx`. It is not an
import of it, because `buttonIcon` paints itself from `--lumo-button-icon`, a
custom property that only `.lumo-button` defines; used anywhere else it renders
with no colour.

That is a real gap in the library, and it is **not** mine to close: fixing it
means editing Button, and an engineer does not edit another component to make
their own work. **The system wants a standalone `icon` component** that takes a
glyph name and inherits its colour; Button and Empty State would both import it,
and the next component that needs an icon would not write a third copy.

---

## Platform modes

Verified in **web** and **admin**; **mobile** was read from the generated token
files but not opened in the browser.

| Token | web | admin | mobile |
|---|---|---|---|
| `--spacing-gap-md` | 16px | **12px** | 16px |
| `--typography-fontsize-sm` (description, sm) | 12px | 12px | **13px** |
| `--typography-fontsize-md` (description, md) | 14px | **13px** | **15px** |
| `--typography-fontsize-lg` (title, sm) | 16px | **14px** | **17px** |
| `--typography-fontsize-xl` (title, md) | 20px | **18px** | 20px |

Every colour, the two medallion sizes and the icon size are identical in all
three. So the component is the same shape everywhere and simply tightens on
admin — a smaller gap between four rows and smaller type throughout. That is the
tokens working, not a defect, but it does mean **the admin empty state is
visibly shorter than the node**, on top of gap 1.

Dark mode is covered by the semantic colour tokens and needs nothing from the
component: `--color-bg-brand-subtle` goes `#eff8fa → #132f35` and
`--color-icon-brand` goes `#16bee3 → #4cceeb`.

---

## One prop the node does not define

`titleAs`, defaulting to `'p'`.

The node's title is a text layer in both variants, so `<p>` is the faithful
render — but the `md` title uses `Heading/H4`, which signals heading intent, and
an empty state that owns a region of a page with no heading in it is a hole for
a screen reader user. `titleAs` is an opt-in escape hatch, not a visual change:
left alone, the component renders exactly what the node draws.
