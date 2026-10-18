# The public API of the package

What `src/index.ts` exports, what it does not, and why. Written when the repo
was turned into a publishable package at `0.1.0`.

The rule applied throughout: **a component is public if a consumer has to
compose it themselves.** A component the parent renders for you, from its own
props, is an implementation detail — exporting it would turn an internal
rendering decision into API we then owe a version bump on.

## Exported — 10 components

| Export | Why it is public |
|---|---|
| `Accordion` | Top-level component. |
| `Badge` | Top-level component. |
| `Button` | Top-level component. |
| `Card` | Top-level component. |
| `CardLayoutVertical` | **The exception that proves the rule.** `Card`'s `children` is the Figma `↳Layout` slot — `card.jsx` documents the prop that way and renders nothing into it. A consumer cannot use `Card` without supplying a layout, and this is the layout ("the default arrangement", node 63:98). Nothing else renders it. |
| `EmptyState` | Top-level component. |
| `Field` | Top-level component. |
| `Progress` | Top-level component. |
| `Switch` | Top-level component. Exported as `Switch`, not `switch`, which is a reserved word — see `naming-conflicts.md`. |
| `Toast` | Top-level component. |

Named exports only. Each component folder's `index.js` also carries a
`default`, which is useful inside the repo and meaningless at a package root
with ten components in it, so the root re-exports names only.

## Kept internal — 11 components

**Rendered by their parent, driven by the parent's props.** A consumer never
places these; they set `iconName`, or `close`, or `headerProps`, and the parent
renders them.

- `AccordionIcon` — `accordion.jsx` renders it from `iconName`
- `ButtonIcon` — `button.jsx` renders it from `iconLeftName` / `iconRightName`
- `EmptyStateIcon` — `emptyState.jsx` renders it from `iconName`
- `FieldIcon` — `field.jsx` renders it in the `error` state
- `ToastIcon`, `ToastClose` — `toast.jsx` renders them from `iconName` / `close`
- `SwitchKnob` — "Presentational and inert on purpose — the parent is the
  `<button>`, so the knob must not be focusable or announced." Exporting it
  invites exactly the misuse that comment rules out.

**Figma placeholder slots, by their own description.**

- `AccordionContentSlot`, `FieldControlSlot` — both are node 41:21, whose
  description reads: *"Placeholder slot. Swap it for the real component you
  want inside this area. Never ship a screen with a slot still showing."* Both
  files say they exist so the stories can stand beside their Figma frames and
  give QA something to compare, and that **in product code you pass a real
  control instead**. Shipping them would ship the thing the design explicitly
  says never to ship.

**Documented as not for outside use.**

- `CardHeader`, `CardFooter` — `cardHeader.jsx` says "Sub-component of Card.
  … Not for use outside a card." `CardLayoutVertical` renders both, from
  `headerProps` and `footerContent`.

Nothing is lost by this: every internal component is still reachable through
the prop its parent exposes, and `CardLayoutVertical` covers the one slot a
consumer genuinely fills.

## Stylesheets

Two export paths, loaded once by the consuming app, `tokens.css` first:

```js
import '@ds-house/lumo-design-system/tokens.css';
import '@ds-house/lumo-design-system/styles.css';
```

- `styles.css` — every component sheet, via `@import`. Component files import
  no CSS of their own, so importing one component no longer drags a stylesheet
  in as a side effect.
- `tokens.css` — the generated **web** platform tokens, light then dark.

### The platform gap

`build:tokens` produces three platforms — `web`, `mobile` and `admin` — and
the package exposes only `web`. This is a deliberate stop, not an oversight.
Each platform is a full `:root` sheet; concatenating them would have them
overwrite each other, and which one wins is a design decision nobody has made.
Storybook's platform toolbar swaps between them one at a time for the same
reason.

If `mobile` or `admin` is needed by a consumer, the answer is further export
paths (`./tokens.mobile.css`) decided deliberately — not a third sheet
appended to this one. The four `layout/` breakpoint sheets are also absent;
no component CSS reads a layout or grid token today, which was checked rather
than assumed.
