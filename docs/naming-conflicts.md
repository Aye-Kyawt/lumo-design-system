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

---

## `type` collides with the DOM button type

**Found while building:** Button (`component/button`)

The Figma component set names its variant property `Type`
(`fill | outline | transparent`). `<button>` already has a `type` attribute, and
it decides whether the element submits a form.

This one is not just awkward, it is a live hazard. A `<button>` with no `type`
inside a `<form>` defaults to `submit`, so a Button that quietly forwarded an
unset `type` to the DOM would post the form on every click.

**Chosen names:** `type` stays the Figma variant, per the rule that Figma names
win. The DOM attribute is exposed separately as `htmlType`
(`button | submit | reset`), defaulting to `"button"`.

Defaulting it to `"button"` rather than leaving it unset is the important half:
the safe behaviour is the one you get by not thinking about it, and a caller who
actually wants a submit button has to say so.

**The general rule this suggests:** when a Figma property name collides with a
real attribute of the element the component renders, the Figma name keeps the
prop and the DOM attribute gets a prefixed one — not the other way round. Give
the DOM escape hatch a default that is safe when nobody sets it.

---

## Figma's icon swap slots became glyph names

**Found while building:** Button (`component/button`)

Figma gives Button two instance-swap slots, `↳iconLeft` and `↳iconRight`, for
dropping an icon component into each end.

Per `CLAUDE.md` the icon set is Material Symbols, loaded as a font from the
Google Fonts CDN. With an icon font there is no instance to swap — the glyph
*is* its name — so a slot taking a React node would be a worse API than a
string.

**Chosen names:** `iconLeftName` and `iconRightName`, each taking a Material
Symbols glyph name and defaulting to `add` (what the Figma node uses).
`iconLeft` and `iconRight` remain the booleans Figma defines, controlling
whether each icon shows at all.

**The general rule this suggests:** a Figma instance-swap slot does not have to
become a node prop. Where the design system has settled on one icon font, the
slot is better expressed as the name of the thing to draw, and the boolean that
Figma already provides stays as the on/off switch.

---

## Figma's `Value` is a boolean, so the number needed another name

**Found while building:** Progress (`component/progress`)

The Figma component set gives Progress a `Value` property, and it is a **boolean** —
it shows or hides the little percentage text beside the bar. The string in that text
is a separate property, `Value text`.

What Figma has no property for at all is the thing the bar is actually about: how far
along it is. The node draws the fill at a fixed 158px in every variant, which is what
a static frame can do, so the number only exists once the component is code.

Calling that number `value` would be the natural name — it is what `<progress value>`
and `aria-valuenow` both call it — but `Value` is already taken by the Figma boolean,
and per the Button precedent the Figma name wins.

**Chosen names:** `value` stays the Figma boolean. The number is `percent`, taking
0–100 and clamped to it. `valueText` defaults to `` `${percent}%` ``, so the text and
the fill agree by default instead of by coincidence — which is the one thing the node
itself gets wrong (its fill is ~64% of the track while its text reads 72%; see
`docs/progress.md`, gap 4).

`percent` rather than `now` or `amount` because it says its own units, and the default
`valueText` makes the percentage reading explicit anyway.

**The general rule this suggests:** a Figma boolean that toggles the *display* of a
value will often sit on the name the value itself wants. Leave the boolean where Figma
put it and give the value a name that states its units — the boolean is about
visibility, so it is the one that can afford the vaguer name.

**Suggestion back to design:** renaming the Figma pair to `Show value` and
`Value label` would free `Value` for the number and make the set read the way the code
does. That is a design decision, not an engineering one, so nothing has been changed
in Figma.
