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

---

## `switch` is a reserved word, and the node is not called Switch anyway

**Found while building:** Switch (`component/switch`)

Two small collisions landed on the same component.

**The node's name.** Figma calls the component set **Toggle** (17:1201), and
its own description calls it a toggle throughout. The registry row, and the
build request, call it **Switch**. Those are two different names for one thing
and someone reading either artefact alone would not know the other existed.

**Chosen name:** the folder, the files and the CSS namespace are `switch` —
`src/components/switch/`, `.lumo-switch` — matching the registry, since that is
what the rest of the pipeline keys off. Every file in the folder names node
17:1201 and says "named Toggle on the canvas" so the trail back to Figma is
never ambiguous.

**The identifier.** `switch` is a reserved word in JavaScript, so
`export function switch` is a syntax error. This does not affect the folder or
the file name — only an identifier.

**Chosen name:** the exported component is `Switch`, which is what PascalCase
would have given anyway, so this costs nothing. `badge.jsx` already exports
`Badge`, so the pattern is unchanged. The sub-component for the `Knob` layer
(17:1203) is `switchKnob.jsx` exporting `SwitchKnob`, following `buttonIcon`.

The variant property needed no renaming: Figma's `On` lowercases to `on`,
per the rule the Card entry above established.

**The general rule this suggests:** where the Figma name and the registry name
for one component disagree, the registry name wins for the folder, the files
and the CSS namespace — it is what the agents downstream resolve against — and
the Figma name is recorded in a header comment in every file of the folder
rather than being quietly dropped. Check a new component's name against the
JavaScript reserved word list before choosing the folder name; a reserved word
is fine as a file name and fatal as an identifier.

---

## The set spells two different properties `Description`

**Found while building:** Empty State (`component/empty-state`)

The `empty-state` set (94:1862) has a boolean property `Description`, which
shows or hides the supporting line, **and** a text property `Description`, which
is what that line says. They are two properties with one name. One object cannot
carry both.

**Chosen names:**

| Figma property | Prop | Note |
|---|---|---|
| `Description` (boolean) | `description` | lowercased only, per the Card rule |
| `Description` (text) | `descriptionText` | the renamed one |

The boolean keeps the plain name because it is the one that reads like a
property at a call site — `<EmptyState description={false} />` — and because the
other components in the library already spell their show/hide booleans this way
(`text`, `iconLeft`, `iconRight` on Button; `header`, `footer`, `action` on
Card). Figma's own code generator independently made the same split and chose
the same two names, which is a reasonable tiebreak.

**The general rule this suggests:** where a Figma set gives a boolean and a text
property the same name, the boolean keeps the name and the text one takes a
`...Text` suffix. Do not solve it the other way round, and do not solve it by
merging them into one prop that is "false or a string" — `Description=false` and
`Description=""` are different rows of the matrix and QA tests both.

---

## `↳Action` again, this time beside an `Action` boolean

**Found while building:** Empty State (`component/empty-state`)

Same collision Card hit, one level up. The set has an `Action` boolean and an
`↳Action` slot, and `↳` is not a valid identifier.

**Chosen names:** `action` for the boolean, `children` for the slot — exactly
what Card did for `CardHeader`. This component has two slots, and the Card entry
above says to use a named prop when there are several; the rule still lands here
because the two slots are not peers. `↳Action` is the component's content, and
`↳Icon` is a decoration on a fixed medallion.

| Figma property | Prop |
|---|---|
| `Action` (boolean) | `action` |
| `↳Action` (slot) | `children` |
| `↳Icon` (slot) | `icon`, or `iconName` for just the glyph |

**The general rule this suggests:** refine the Card rule rather than replace it.
Where a component has several slots, `children` goes to the one that carries the
component's *content* and the rest take named props — not "named props for all
of them the moment there is more than one". A caller writing
`<EmptyState><Button /></EmptyState>` is doing the obvious thing, and that is
worth more than symmetry between the two slots.

---

## `State=Type` — a variant value that reads like a property name

**Found while building:** Field (`component/field`)

The field set's one variant property is `State`, and its four values are
`default`, `error`, `disabled` and `Type` — capital T, as the set spells it.
`Type` is the name of the filled state: the field with something typed into it.

Three things make it awkward, and none of them is a true collision:

1. It reads like a property. Every other set in this library that says "Type"
   says it as a *property* — Button's variant property is literally `Type`
   (`fill | outline | transparent`, see the entry above). Here the same word is
   a value of `State`, so `state="Type"` looks at a glance like a mistake.
2. It is the only value in the set that is capitalised, so it is the only one
   that cannot be typed carelessly.
3. It describes a cause ("someone typed") rather than a state ("filled"), which
   is why it reads oddly beside `default`, `error` and `disabled`.

**Chosen name:** `Type`, kept exactly. Variant *values* are matched as strictly
as property names, because QA reads the value off the node and writes it into
the `Variants` column of the registry — a value renamed in code is a row that no
longer matches the design file. The component validates against the set's four
spellings and falls back to `default` rather than rendering unstyled.

**Suggested back to design:** rename the variant value to `filled`,
lowercase, in the Figma set. It names the state rather than the action, it
matches the casing of the other three, and it is the word the rest of the
industry uses for this state. Until a designer makes that change, the code says
`Type`.

**The general rule this suggests:** this register has only covered property
names so far. Extend it — a variant *value* is matched verbatim too, for the
same reason and with the same escape hatch of reporting a suggestion here.

---

## `↳Control` is a slot, so it is `children` — and the field composes nothing

**Found while building:** Field (`component/field`)

The field's middle row is `↳Control`, an instance of `_Slot/Content` (41:21)
whose own description says to swap it for the real component. `↳` is not a valid
identifier, and the component has exactly one slot.

**Chosen name:** `children`, per the Card rule — one slot, and it carries the
component's content.

| Figma property | Prop |
|---|---|
| `↳Control` (slot) | `children` |
| `Label` | `label` |
| `Required` (boolean) | `required` |
| `Helper` | `helperText`, with `helper` for the boolean |
| `State` | `state` |

Two notes that are not conflicts but belong with the table:

`Helper` follows the rule Empty State set above — the boolean keeps the plain
name and the text takes the `...Text` suffix — even though the field's set draws
the helper row in all four variants and gives no boolean. The boolean is this
build's addition, for the case where a form has no helper line.

`requiredText` is **not** a Figma property and is not claimed to be one. The
asterisk is decoration and is `aria-hidden`, so the word a screen reader
announces has to come from somewhere; this is it. A prop with no node behind it
is documented as an addition rather than quietly presented as part of the
design's API.

---

## `title` collides with the global HTML `title` attribute

**Found while building:** Accordion (`component/accordion`)

The accordion's header text is the component's main text property — Figma's own code
generator emits it as `title`, defaulting to the string the node draws, "How does pricing
work?". `title` is also a **global** HTML attribute, present on every element, and it
renders the browser's own hover tooltip.

This is the Button `type` situation again, one notch less dangerous. A Button that
forwarded an unset `type` to the DOM would submit a form; an Accordion that forwarded its
heading text to the DOM `title` would merely grow a tooltip duplicating the text already
on screen — annoying, not destructive, but still wrong, and a screen reader may read the
tooltip and the visible text as two things.

**Chosen names:** `title` stays the Figma property, per the rule that Figma names win. The
DOM attribute is exposed separately as `htmlTitle`, and is **unset** by default.

The Button entry says to give the DOM escape hatch a default that is safe when nobody
sets it; here that default is "absent", because no tooltip is the correct behaviour and
the node asks for none.

`title` is spread onto the `<button>` explicitly rather than arriving through `...rest`,
so the component decides what reaches the DOM instead of leaking whatever the caller
passed.

**The general rule this suggests:** the Button rule already covers this — when a Figma
property name collides with a real attribute of the element the component renders, the
Figma name keeps the prop and the DOM attribute gets a prefixed one. Extend it by one
word: this applies to **global** attributes too, not just the element's own. `title`,
`id`, `role`, `style`, `hidden` and `lang` are attributes of everything, so a Figma
property with any of those names collides no matter what the component renders.

---

## `State=open` is a behaviour, not a skin — and `headingLevel` has no node

**Found while building:** Accordion (`component/accordion`)

Not a name collision, but it belongs beside the Switch entry because it is the same
question one level further on.

The accordion's one variant property is `State`, with values `closed` and `open`. In Figma
those are two static frames. In code they are the component's disclosure state, which the
user changes by clicking — so `state` cannot be only a styling prop the way Card's `State`
is.

**Chosen names:** `state` for the Figma property, kept verbatim with its two values, plus
`defaultState` for the uncontrolled seed — exactly the pair `switch.jsx` established as
`on` / `defaultOn`. Pass `state` and the parent owns it, which is what an FAQ list allowing
one open answer needs; omit it and the component holds its own.

`onToggle` rather than `onChange`, because the thing reported is which state the disclosure
is moving to, not a value the control carries.

**`headingLevel` is an addition with no Figma property behind it**, and is documented as one
rather than presented as part of the design's API — the same treatment `requiredText` gets in
`docs/field.md`. The node draws a card, not a document outline, so it has no heading level;
but the component description asks for an FAQ list, and an FAQ whose questions are not
headings cannot be navigated by a screen reader user. It defaults to `0`, meaning **no
wrapper**, so the default output is exactly what the node draws and the addition costs
nothing unless it is asked for.

**The general rule this suggests:** where a Figma variant property describes a state the user
can change rather than a skin the designer picks, give it the controlled/uncontrolled pair
(`x` plus `defaultX`) and keep the Figma spelling on the controlled one. And where an
accessibility requirement needs structure the node does not draw, add it **off by default**,
so the node-exact rendering is what a caller gets without asking.
