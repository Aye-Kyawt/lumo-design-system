# Release review — Switch

**Component row:** `recqte4VVPAsZ4bTW` · **Reviewed at commit:** `75eb160` ·
**Reviewed:** 2026-10-15 · **Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

## The trigger ordering is unresolved

Stated in every report, per `.claude/agents/release.md`. `Completed` wakes this review, and
DevOps sets `Completed`. But DevOps's version gate needs `Release Verdict = Cleared` before it
cuts a version, so the review must run after DevOps promotes and before DevOps versions — and
as drawn the loop has no entry point. This review was triggered by `Completed`, and the order
was not quietly changed.

## The gate list this review was supposed to run does not exist

`.claude/agents/release.md` says to run the review "per the `Release-review` skill and its
gates", and the registry contract twice cites "the seven gates in
`.claude/skills/release-review/SKILL.md`". **That file does not exist** — `.claude/skills/`
holds `build`, `registry` and `test` and nothing else.

The gates were not invented here. What follows is a review against what the role file itself
states, and it is explicitly **not** the seven gates. **Owner:** a human owns the design system
and owns writing them down. The same gap is recorded in the Badge review; it is not specific to
this component.

## What was checked

### A QA pass exists, and was not re-run

**28 linked Staging Testing rows, all 28 reading `Passed`, none blank and none `Failed`.**
Confirmed by reading the rows rather than trusting `Synchronization %`.

This row matters for a reason worth recording. Until earlier today it read `To be deployed`
while **two** of those rows carried no verdict at all — registry Flag 4, where the `Development`
formula tests the rollup of verdicts rather than whether every row has one. Both outstanding
cases, `prefers-reduced-motion` and `forced-colors`, have since been executed and recorded, and
DevOps counted the rows itself before promoting rather than accepting the status. The pass this
review relies on is therefore complete, and it is complete because two agents refused to treat
the status as evidence.

No test was re-run here and no independent view of correctness was formed.

### Production serves the code that was reviewed

The deployed build at `Production Storybook` was opened and Switch rendered. Read from the
production DOM: two controls with `role="switch"`, `aria-checked` reading `true` and `false`,
tracks resolving to `rgb(22, 149, 177)` and `rgb(191, 194, 207)` — the values
`docs/switch.md` records for `On=true` (`#1695B1`) and `On=false` (`#BFC2CF`).

### The test evidence is current

`75eb160` is the only commit that has ever touched `src/components/switch/`, and it is on
`main`. The row's `Commit` cell names it correctly.

## Why `Blocked`

### 1. No reference page exists — and no site exists to hold one

`Astro Link` is empty. The role file is unambiguous: *"A missing reference page is a `Blocked`
reason, not a gap for you to fill."*

And the cause is structural rather than clerical. **There is no Astro documentation site in this
repository** — no `astro` or `starlight` dependency in `package.json`, no such file tracked
anywhere on `main`. `Astro Link` is not unwritten, it is unwritable, which is why nothing in
this system has reached `Released`.

**Owners:** the Doc-generator owns `Astro Link`, but cannot link a site that does not exist.
Standing that site up is a dependency and tooling decision, which `CLAUDE.md` routes through
`tools.md` and a human.

### 2. The component's own documentation misdescribes it

`docs/switch.md` is the artefact a reader reaches for before the source, and two of its claims
do not match the shipped component:

- It states *"Pressed was not observed live… QA should press and hold it."* QA did drive it, with
  a real press-and-hold, recording `rgb(19, 47, 53)`. The document is the Engineer's build
  record, written before that pass, and was never reconciled with it.
- It has **no forced-colors entry at all**, although `switch.css` and `switchKnob.css` both
  implement one and QA has now verified all three of its declared rules in a genuinely forced
  palette. The only description of that behaviour lives in CSS comments.

A released component whose documentation tells a reader a state is unverified when it is
verified, and says nothing about a state it does implement, is not fit to have its name put in
a version — which is precisely what this gate is for.

**Owner:** the Engineer owns `docs/switch.md` as its build record.

## Findings that are not blocking

- **`Attachment` is empty on all 28 rows**, including the 26 that passed before today. QA has no
  host for evidence and `reports/` is gitignored, so the durable evidence that column exists to
  hold does not exist. Structural, and not specific to Switch.
- **The node draws no state and no motion at all.** `docs/switch.md` already reports this as its
  gap 3, and the states were implemented as behaviour mapped onto existing tokens with none
  invented. Noted here because a release reader should know the interaction states are the
  build's reading of the token names rather than something a designer drew — not a defect, but
  not a design decision either.
- **The staleness rule cannot work as written.** The role file calls a review stale once
  `Last Modified` is later than the commit it read, but `Last Modified` updates on any cell
  write — DevOps writing `Production Storybook` already moved it past `75eb160`. The rule needs
  to compare against the component's code, not the row's last touch.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no version
was cut. `Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two
cells this review owns — `Release Review` and `Release Verdict` — were written together.
