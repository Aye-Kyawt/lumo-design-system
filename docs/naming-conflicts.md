# Naming conflicts and the names we chose instead

`CLAUDE.md` says prop names match the Figma property names exactly, and that any
name we have to change because of a conflict with another tool gets reported
here. This is that register. One section per conflict, newest last.

---

## `.lumo-card` was already taken by the token gallery

**Found while building:** Card (`component/card`)

`stories/lib/docs.css` defined a `.lumo-card` class for the token gallery's own
chrome — a panel with 20px of padding and a 1px border, used twice, in
`Typography.stories.jsx` and `Spacing.stories.jsx`. The Card component needs the
same class name, and Storybook loads both sheets into one document.

The collision was not loud. Most of the component's declarations are more
specific or come later and won, so the card *looked* right; only `border`, which
the component no longer set, leaked through from the gallery rule. The result
was a stray 1px border that made every card 2px taller than its Figma node and
cost a real debugging pass to find.

**Chosen name:** the gallery's class was renamed `.lumo-panel`; the component
keeps `.lumo-card`.

The gallery's usage is incidental chrome — a box around a specimen — while
`card` is a real component in the design system with a Figma node behind it. The
component should hold the name. The rename touched three lines and no gallery
page changed visually.

**The general rule this suggests:** gallery chrome in `stories/lib/docs.css`
should not take names that a design system component will want. Anything in
there that is page furniture rather than a component wants a name a component
would not choose — `lumo-panel`, `lumo-swatch`, `lumo-specimen` — and a
component shipping from `src/components/<name>/` should be able to assume
`.lumo-<name>` is free.

---

## Figma variant properties are capitalised; the props are not

**Found while building:** Card (`component/card`)

The Figma component set names its variant properties `State` and `Padding`, and
its instance-swap slots `↳Layout` and `↳Action`. Neither form can be used
verbatim in JSX: a capitalised prop reads as a component in JSX, and `↳` is not
a valid identifier.

**Chosen names:**

| Figma property | Prop | Note |
|---|---|---|
| `State` | `state` | lowercased only |
| `Padding` | `padding` | lowercased only |
| `↳Layout` | `children` on `Card` | the natural React slot |
| `↳Action` | `children` on `CardHeader`, shown by `action` | matches the Figma boolean that reveals it |

The values are untouched — `default`, `hovered`, `focused`, `disabled`, `none`,
`md`, `lg`, `xl` are exactly as Figma spells them. The sub-component properties
(`title`, `subtitle`, `subtitleLabel`, `action`, `header`, `footer`) already
arrive in a usable form and are used as-is.

**The general rule this suggests:** lowercase the first letter of a Figma variant
property and otherwise leave the name alone; map a `↳Slot` to `children` where a
component has one slot, and to a named prop where it has several. Keep every
variant *value* exactly as Figma spells it, since those are what QA reads off the
node.
