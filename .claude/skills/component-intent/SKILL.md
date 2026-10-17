---
name: component-intent
description: Writes `{component}.intent.json` beside a component — what it is for, when not to reach for it, what each variant means, where it goes, what it pairs with, which tokens it needs, and its accessibility facts. Transposed from the component's Figma documentation page, never invented.
---

# Write a component's intent

## When to use this

Use this when a component exists in `src/components/<name>/` and needs its intent
recorded, or when its Figma documentation page has changed and the file has to be
brought back in line.

One component per run. The file sits beside the code it describes:

```
src/components/badge/badge.intent.json
src/components/card/card.intent.json
```

**This is the only machine-readable record of why a component exists.** Storybook
shows what a component looks like; the build report in `docs/<name>.md` records how
it was made and what the design left unbound. Neither says when to reach for it.
`release-review` reads this file, and `astro-page` turns it into the Usage tab, so
a sentence invented here is published as fact and reviewed as fact.

## The one rule that outranks the others

**Never invent a product rule.**

A plausible sentence in `use_when` or `dont_use_when` is worse than an empty field,
because nothing downstream can tell that it is wrong. An empty field is visibly
empty: the review reports it as a gap, the docs page shows a notice naming what is
missing, and a human knows to go and decide it. A confident, invented sentence is
indistinguishable from a transposed one and will be read as the design system's
position by everyone who comes after.

This is the same rule `CLAUDE.md` states for tokens — *report the gap instead and
stop* — applied to language.

## The fields

| Field | What it holds | Source |
|---|---|---|
| `use_when` | When to reach for this component | Figma usage region |
| `dont_use_when` | When not to, each with the alternative to use instead | Figma usage region |
| `variant_intent` | What each variant value is *for*, keyed by property then value | Figma usage region, then code |
| `placement` | Where in a layout it belongs | Stories |
| `pairs_with` | The components it is normally used with | Stories |
| `required_tokens` | The semantic tokens it cannot render without | Code |
| `a11y` | Its accessibility facts, each tied to the line that makes it true | Code |

### Shape

```json
{
  "component": "badge",
  "figma_node": "17:1139",
  "figma_docs_page": "<url of the documentation page, or null>",
  "source_commit": "<sha the file was written from>",
  "use_when": [],
  "dont_use_when": [],
  "variant_intent": {},
  "placement": [],
  "pairs_with": [],
  "required_tokens": [],
  "a11y": [],
  "gaps": []
}
```

`dont_use_when` entries carry their alternative, because a prohibition without one
sends the reader nowhere:

```json
"dont_use_when": [
  {
    "situation": "the user can interact with it",
    "use_instead": "Chip",
    "source": "figma:usage"
  }
]
```

`a11y` entries name the line that makes them true, so the claim can be checked
rather than believed:

```json
"a11y": [
  {
    "fact": "renders a real <button role=\"switch\">, so Space and Enter operate it",
    "source": "src/components/switch/switch.jsx:63"
  },
  {
    "fact": "the node carries no label layer, so the accessible name must come from the caller via aria-label or aria-labelledby",
    "source": "src/components/switch/switch.jsx:21"
  }
]
```

Every entry anywhere in the file carries a `source`. A field with no source is a
field somebody made up.

## Steps

### 1 · Figma first — the documentation page, not the component set

Read the component's **documentation page** in Figma, not just its component set.
Its usage region already carries when to use it, when not to, and best practice —
written by whoever designed it. That region is the source for `use_when`,
`dont_use_when` and the meaning half of `variant_intent`.

**Transpose it faithfully.** Keep the designer's distinctions and their specifics.
Where the region names a concrete example — a screen, a feature, a product surface —
keep the example. "Use for a status the user reads" has lost the thing that made
"a category tag, a status pill, a 'Most popular' flag" useful.

Do not paraphrase it into something vaguer. Vagueness reads as safe and is not: it
quietly widens the rule, and a widened rule is a rule the designer did not write.
If a sentence is too specific to generalise, keep it specific.

**Check:** every `use_when` and `dont_use_when` entry can be traced to a sentence in
the usage region, and nothing in those two fields came from anywhere else.

### 2 · When there is no usage region

Some components have a documentation page with no usage region, and some have no
documentation page at all. Then:

- `use_when` stays `[]`
- `dont_use_when` stays `[]`
- the component goes in `gaps`, naming which of the two is missing and where you
  looked

```json
"gaps": [
  {
    "field": "use_when",
    "reason": "no usage region on the documentation page for node 17:1139",
    "looked_at": "figma docs page for Badge, 2026-10-17",
    "owner": "human:designer"
  }
]
```

Do not fill these from the component set's own description, from the build report in
`docs/<name>.md`, from the stories, or from what the component obviously does. Those
sources are legitimate for the other fields and are **not** evidence of a product
rule. A component that does one obvious thing may still have a rule about when not
to use it, and that rule is the designer's to write.

**Check:** the two intent fields are either transposed from a usage region or empty
and listed as a gap. There is no third case.

### 3 · The code — `required_tokens` and `variant_intent`

Read `src/components/<name>/<name>.jsx` and `<name>.css`, plus the subcomponents in
the same folder.

**`required_tokens`** is every semantic token the component's CSS reads and cannot
render without. Take the names from the CSS, not from memory, and record them as
written:

```
find src/components/<name> -name '*.css' ! -name '*.stories.css' \
  -exec grep -ho 'var(--[a-z0-9-]*' {} + | sort -u
```

The `! -name '*.stories.css'` is why this uses `find` rather than a `*.css` glob: a plain glob
picks up the story sheet, and on `badge` that is the difference between 18 tokens and 24. Six of
those 24 are Storybook scaffolding the package never ships.

Exclude the component's own locally-declared custom properties. A `--lumo-switch-track-width`
the component declares and then reads is internal plumbing, not a system token it depends on —
what belongs in `required_tokens` is the token on the **right** of that declaration.

`switch.css` is the case to look at. It declares three `--lumo-switch-*` locals, each bound to
the semantic token whose *family* carries the right meaning, precisely so that closing a design
gap is a one-line change. Recording the locals would describe the component's internals;
recording `--size-control-md`, `--size-icon-sm` and `--spacing-padding-xs` describes what it
needs.

**`variant_intent`** gets its *keys* from the code and its *meaning* from Figma.
The code is authoritative for which properties and values exist; the usage region is
authoritative for what each one is for. Where the code has a value Figma's usage
region never explains, record the value with a null meaning and list it as a gap
rather than describing what it looks like.

```json
"variant_intent": {
  "tone": {
    "primary":  { "meaning": "...", "source": "figma:usage" },
    "neutral":  { "meaning": null,  "source": null }
  }
}
```

**Check:** every token name exists verbatim in the component's CSS; every variant
property and value in the code appears in `variant_intent`; no value carries a
meaning that did not come from Figma.

### 4 · The stories — `placement` and `pairs_with`

Read `<name>.stories.jsx`. The stories are where the component is shown in context,
so they are the evidence for where it goes and what it sits next to.

**`pairs_with`** is the components a story actually renders alongside this one —
imported and used, not mentioned in a comment. Subcomponents from the component's
own folder are not pairings; they are parts of it.

**`placement`** is what the stories demonstrate about position: inside a card body,
at the top of a form field, in a page's empty region. If the stories only ever show
the component on its own, `placement` is `[]` and that is a gap, not a licence to
describe where it *would* go.

**Check:** every `pairs_with` entry names a component a story imports; every
`placement` entry points at the story that shows it.

### 5 · Write the file, then re-read it against its sources

Write `src/components/<name>/<name>.intent.json`, including `source_commit`.

Then read every entry back against the thing it cites. The failure this catches is
the one worth catching: a sentence that drifted a little while being transposed and
now says something slightly stronger, or slightly broader, than the designer wrote.

**Check:** `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'))"` passes,
every entry has a `source`, and every cited line still says what the entry claims.

## Never

- **Never invent a product rule.** The empty field is the correct output when the
  source is silent.
- **Never paraphrase the usage region into something vaguer.** Faithful or absent.
- **Never fill `use_when` or `dont_use_when` from the code, the stories, or the
  build report.** Those answer different questions.
- **Never write a `dont_use_when` with no alternative.** If the usage region names
  no alternative, record that it does not, rather than choosing one.
- **Never edit the component.** This skill writes one file and reads everything else.
- **Never record a token that is not in the CSS**, and never a `--primitives-*` name:
  a component reaching past the semantic layer is a finding for the engineer, not a
  dependency to write down.

## References

- The component: `src/components/<name>/` — code, CSS, stories, subcomponents
- The build report: `docs/<name>.md` — design gaps and token decisions. Evidence for
  `gaps`; never evidence for intent
- Naming and the subcomponent rule: `CLAUDE.md`
- Tokens and commands: `tools.md`
- Who reads this file: `.claude/skills/release-review/SKILL.md` (checks it) and
  `.claude/skills/astro-page/SKILL.md` (publishes it as the Usage tab)

## Self-check

- [ ] `use_when` and `dont_use_when` came from the Figma usage region and nowhere else
- [ ] Nothing in those fields is vaguer than the sentence it came from
- [ ] Every `dont_use_when` names its alternative, or records that the source named none
- [ ] No usage region → both fields empty **and** listed in `gaps`
- [ ] Every `required_tokens` name appears verbatim in the component's own CSS
- [ ] No `--primitives-*` token and no story-only token in `required_tokens`
- [ ] Every variant property and value from the code appears in `variant_intent`
- [ ] Every `a11y` fact cites the line that makes it true
- [ ] Every `pairs_with` entry names a component a story imports
- [ ] Every entry in the file carries a `source`
- [ ] The file parses, and `source_commit` is the commit it was written from
- [ ] I did not write a single sentence I could not point at a source for
