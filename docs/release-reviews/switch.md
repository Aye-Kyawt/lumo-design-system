# Release review — Switch

**Component row:** `recqte4VVPAsZ4bTW` · **Reviewed at commit:** `75eb160` ·
**Reviewed:** 2026-10-16 · **Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

This replaces the review of 2026-10-15, which also recommended `Blocked`. Both of that
review's reasons have since been addressed and were verified here rather than taken on trust
— see *What changed since 2026-10-15*. Six of the seven checks below pass. The one that does
not is a bookkeeping absence, and the section *Why `Blocked`, and how narrowly* says plainly
how close this is to the other verdict and what a human could decide instead.

## The trigger ordering is unresolved

Stated in every report, per `.claude/agents/release.md`. `Completed` wakes this review, and
DevOps sets `Completed`. But DevOps's version gate needs `Release Verdict = Cleared` before it
cuts a version, so the review must run after DevOps promotes and before DevOps versions — and
as drawn the loop has no entry point. The row still reads `Completed`, which is the trigger
this review acted on, and the order was not quietly changed.

Nothing woke this re-review. `Blocked` is terminal with no owner (`docs/crew-spec.md`, open
question 7), so a human started it.

## About the gates run here

These are **the reconstructed gates** in `.claude/skills/release-review/SKILL.md`, and they
are **not ratified**. That file did not exist when the 2026-10-15 reviews ran; it was written
on 2026-10-16 by reconstructing seven recurring checks from `.claude/agents/release.md` and
from what those six reviews actually checked, and it opens with a banner saying no human has
agreed to it. It is cited here as the best available criteria and not as settled policy. This
report deliberately does not call them *the seven gates*.

That matters more for Switch than for any other row, because the one failure below comes from
the reconstructed wording and not from precedent. It is flagged at the gate and again at the
verdict.

## What changed since 2026-10-15

| Previous reason | State now |
|---|---|
| `Astro Link` empty, and no site existed to hold a page | A Starlight site is live and the page carries all seven intent fields — gate 4 below |
| `docs/switch.md` contradicted the shipped component — pressed described as unobserved, no forced-colors entry at all | Both reconciled at `d323776`, and both checked here line by line against the code at `75eb160` — gate 6 below |

Nothing changed under the component itself. `75eb160` is still the only commit that has ever
touched `src/components/switch/`, so everything the 2026-10-15 review established about the
code still holds; what moved was the documentation around it.

## Gate 1 — a QA pass exists, and was not re-run

**Pass.** Twenty-eight linked Staging Testing rows. Read one by one rather than through
`Synchronization %`: **all 28 carry `Testing Results` = `Passed`.** None is blank and none is
`Failed`.

The two that used to be blank are the point of this check. `prefers-reduced-motion` and
`forced-colors` now both read `Passed`, and both `Context` cells open `EXECUTED` and describe
how — `Emulation.setEmulatedMedia` over CDP against the deployed staging build, with
`matchMedia(...).matches` read `true` in-page, and for forced colors a capture confirming the
palette actually repainted rather than only the query flipping. Until 2026-10-16 this row read
`To be deployed` with those two cases unexecuted, which is registry Flag 4 in the live data:
the ladder tests the rollup of verdicts, not whether every row has one.

Per the role, this confirms a pass *exists*. No independent view of correctness was formed and
no test was re-run.

## Gate 2 — production serves the code that was reviewed

**Pass.** `Production Storybook` is
`https://lumo-design-system-e3uu56e1x-aye-kyawts-projects.vercel.app/?path=/story/components-switch--both-variants`.
Opened, and Switch renders. Read from that deployment's DOM:

| | On=true | On=false |
|---|---|---|
| element | `<button type="button" role="switch" aria-checked="true">` | same, `aria-checked="false"` |
| track | `rgb(22, 149, 177)` — `#1695B1`, `bg/primary/idle` | `rgb(191, 194, 207)` — `#BFC2CF`, `border/primary/default` |
| box | `40.00 × 24.00` | `40.00 × 24.00` |
| knob | `16.00 × 16.00`, `rgb(255,255,255)`, `translateX(16px)` | same, `translateX(0)` |
| radius | `999px` | `999px` |

Every one of those is what `75eb160` produces, including the `40×24` that `docs/switch.md`
explains as the 3px inset rounding up to 4, and the 16px travel derived from
`width − knob − 2 × inset`. The deployment's stylesheet also carries the two
`@media (forced-colors: active)` blocks that commit introduced.

**Ancestry.** `75eb160` is the commit that *created* `src/components/switch/` — all seven files
in one commit — and it is the only commit that has ever touched that folder. A build that
renders Switch at all therefore necessarily contains it, and `75eb160` is an ancestor of the
commit this deployment was built from. That is a content argument rather than a sha read off
the build; see *Where this review's own evidence is weaker than it looks*.

One thing to record about that deployment, which does not affect this gate: it is old. It
serves a Badge built before `ebcd8f6` — `--color-icon-warning` on the warning label. Switch is
unaffected because Switch's code has never moved, but it shows these cells are per-deployment
snapshots rather than an alias, and there is no project-wide production alias to fall back on
(`lumo-design-system.vercel.app` returns `404: NOT_FOUND`). Registry Flag 9; noted below.

## Gate 3 — the test evidence is current

**Pass.**

```
git log 75eb160..origin/main -- src/components/switch/   → nothing
git log 75eb160..origin/main -- tokens/                  → nothing
```

Run fresh today against a repo that has taken many commits on `main` since the last review.
None of them is under Switch or under `tokens/`. The QA pass of 2026-10-13 describes the
component that is still there.

`docs/switch.md` *did* move, at `d323776` on 2026-10-16. That is a documentation reconciliation
and no code or token changed with it — that commit touches one file — so the test evidence is
not stale. It is checked as documentation under gate 6.

`Last Modified` on the row reads 2026-10-16 14:25, later than `75eb160`. That is the
`Astro Link` write; see the standing finding about why that comparison cannot work as the skill
states it.

## Gate 4 — a reference page exists

**Pass.** `Astro Link` is `https://lumo-reference-site.vercel.app/components/switch/`. The page
was opened and read.

All seven intent fields are present and each records something:

| Field | What it records |
|---|---|
| `use_when` | Both sources agree verbatim — one setting that takes effect immediately |
| `dont_use_when` | Both sources agree verbatim — not when the change needs a Save; use Checkbox. Warns off three lookalike Toggle specs from other design systems |
| `variant_intent` | One `On` property, two values; Figma draws no state and the repo implemented six, stated as the sharpest divergence with what would close it |
| `placement` | Neither source states one, and the page says why the absence is real: the node has no label layer |
| `pairs_with` | Neither source states a pairing; what the caller must supply is a name, and both sources agree on that |
| `required_tokens` | Figma binds three, the repo needs twelve — full table, the borrowed tokens, the per-mode sizes, the unvalued easing tokens |
| `anatomy` | Track and knob, agreed by both sources; marked as an unconfirmed field name |

None reads "Not yet recorded". The page also carries the Toggle/Switch naming conflict and the
reserved-word reason for the exported identifier, which a reader of the registry row would
otherwise have to find in `docs/naming-conflicts.md`.

## Gate 5 — the registry row names the right commit

**FAIL, on the second half only. Owner: `engineer`.**

`Commit` is right, and was established independently rather than read off the cell. It names
`https://github.com/Aye-Kyawt/lumo-design-system/commit/75eb160`, and `75eb160` is the only
commit that has ever touched `src/components/switch/`, is an ancestor of `origin/main`, and is
what the production build serves. There is no ambiguity whatsoever about which code this
review is about.

**`GitHub Commits` names nothing.** The link field is empty on this row, and the GitHub Commits
table has no record for `75eb160` at all — nineteen rows, of which seven belong to a different
repository (`chawsuhlaing2209/horizon-design-system`) and twelve to this one, and none of the
twelve is Switch's build commit. So the half of this gate that reads "and the `GitHub Commits`
link must name the commit that actually shipped the reviewed code" is not satisfied: it names
no commit.

**Why this is recorded as a failure rather than waved through.** The gate's requirement is
conjunctive and the skill says a gate you cannot evaluate is a failed gate, not a skipped one —
and this one *can* be evaluated, with the answer no. It is also not purely clerical. Registry
Flag 9 identifies that same table as the place the base would have to record a shipped commit
if the ladder were ever to tell *shipped* from *recorded*; a `Completed` component with no row
in it is the hole Flag 9 describes, on a specific row.

**Why a human may reasonably rule otherwise.** The gate's own stated rationale is that a row
pointing at the wrong commit "makes every other gate unverifiable, because there is no agreed
answer to which code this review is about" — and that rationale is simply not triggered here,
because `Commit` answers it correctly. No 2026-10-15 review examined this column; the
`GitHub Commits` half of the gate comes from the reconstruction, not from precedent. And four
other `Completed` components — Button, Card, Progress and Empty State — have the same empty
cell, so ratifying the gate as written implies they are in the same position.

**Owner: `engineer`**, which owns both `Commit` and `GitHub Commits`. The fix is one row in the
GitHub Commits table for `75eb160`, linked to this component. This review did not create it.

## Gate 6 — the component's own documentation matches what it is

**Pass.** This is the gate the 2026-10-15 review failed Switch on, and `d323776` reconciled it.
Checked here against `switch.css`, `switchKnob.css` and `switch.jsx` at `75eb160`, not against
the commit message.

**Pressed.** The document no longer leaves it unverified. It still records honestly that the
build did not observe it — "Pressed was not observed live by this build" — and then states what
QA found: a real press-and-hold with the transition disabled gives `rgb(19, 47, 53)` on the on
track, which is `bg/primary/pressed`, and the off track never produces a third colour. That
matches the CSS exactly: there is a `.lumo-switch--on:active` rule binding
`--color-bg-primary-pressed`, and there is **no** `:active` rule for the off track, which is why
the states table reads "pressed, off — *no token exists* — keeps the hovered colour".

**Forced colors.** The document now has a section for it, and its four rows match the two
`@media (forced-colors: active)` blocks line for line:

| Doc row | CSS at `75eb160` |
|---|---|
| track, enabled → `ButtonText` | `.lumo-switch { border: var(--border-width-default) solid ButtonText; }` |
| knob, enabled → `ButtonText` | `.lumo-switch__knob { background: ButtonText; }` |
| disabled → `GrayText`, dim released | `border-color: GrayText; opacity: var(--opacity-100);` and the knob's `background: GrayText` |
| focused → real `outline`, `Highlight`, offset by its own width | `outline: var(--border-width-focused) solid Highlight; outline-offset: var(--border-width-focused);` |

And the claim that "only the colours are system keywords" holds — the widths still come from
`border/width/default` and `border/width/focused`.

The rest of the document holds too. Every token name in the bound-in-Figma table and the
not-bound table matches the custom properties `switch.css` declares; the derived formulas for
track height and knob travel are the `calc()` expressions in the file; the per-mode numbers
(40/4 web, 32/2 admin, 44/4 mobile) follow from `size/control/md` and `spacing/padding/xs`; and
the production DOM measured under gate 2 returns the web figures the table predicts.

## Gate 7 — the dependency record is honest

**Pass.** `Composes` is empty, and that is correct. At `75eb160`, `switch.jsx` imports
`useState` from React, `./switchKnob.jsx` and `./switch.css`, and nothing else.
`switchKnob.jsx` imports only its own stylesheet.

`switchKnob` is a subcomponent living inside the component's own folder, which this gate
excludes explicitly: "Subcomponents that live inside the component's own folder are not entries
here — the column means components this one imports, and a file beside it is not one." The
reference page states the same conclusion. `Composed Into` is empty, which follows: nothing in
`src/components/` imports Switch.

## Why `Blocked`, and how narrowly

**One gate fails, and only one half of it: gate 5.** `GitHub Commits` is empty and the table
has no row for `75eb160`. **Owner: `engineer`.** Everything else passes — the QA pass is
complete and was read row by row, production serves the reviewed code, nothing has moved under
the component or the tokens, the reference page records real intent in all seven fields, the
build report now matches the component, and the dependency record is right.

A verdict of `Blocked` on a missing bookkeeping row deserves the caveat said out loud: **this
is the only thing between Switch and `Cleared`**, the gate producing it is unratified, no
earlier review looked at that column, and the risk it guards against — not knowing which code
is under review — does not exist here, because `Commit` names `75eb160` correctly and three
independent checks confirm it. A human ratifying the gate file could strike the
`GitHub Commits` half of gate 5, or scope it to "where a row exists, it must be right", and
this review would then read `Cleared` on the same evidence. That decision is a human's and this
review does not make it; what it does is refuse to quietly soften a gate it was told to run.

## Findings that are not blocking

- **`Attachment` is empty on all 28 rows**, including the two executed today with CDP captures
  behind them. QA has no host for evidence and `reports/` is gitignored, so the durable
  evidence that column exists to hold does not exist. Structural and not Switch's; unchanged
  since 2026-10-15.
- **The node draws no state and no motion at all.** `docs/switch.md` reports this as its gap 3
  and the reference page restates it. The six interaction states were implemented as behaviour
  mapped onto existing tokens, with none invented — but that mapping is the build's reading of
  the token names rather than something a designer drew. Not a defect; also not a design
  decision. A release reader should know which it is. **Owner: `human:designer`**, to draw
  `State` on 17:1201 or confirm the six mappings.
- **The knob cannot ease.** All five `motion/easing/*` tokens are declared with no value in any
  mode, so `build-tokens.js` emits no `--motion-easing-*` property and the knob transition falls
  back to the browser default. Reported, not filled, and Switch is the component where it
  actually matters. **Owner: `human:designer`**, to give those tokens values.
- **Per-component `Production Storybook` URLs are snapshots of different vintages.** Switch's
  deployment serves a Badge two rebinds out of date. Harmless to Switch, and the general shape
  is registry Flag 9: nothing in the registry observes a merge, and no cell updates when a
  later commit ships. Closing it is a change to the base and therefore a human's.
- **The staleness rule still cannot work as written.** `Last Modified` moves on any cell write
  — today's `Astro Link` write already moved it past `75eb160`, and writing this review's own
  two cells will move it again. The rule needs to compare against the component's code, not the
  row's last touch. Open question 3 in the gate file.

## Where this review's own evidence is weaker than it looks

- **The gate list is unratified**, and the single failure above rests entirely on its wording.
  Said at gate 5 and again at the verdict rather than left for a reader to notice.
- **The deployment's build commit was not read from Vercel.** The Vercel connector has no
  project access on this account, so gate 2's ancestry argument is made from what the build
  serves and from `75eb160` being the only commit to touch the folder — not from a sha read off
  deployment metadata. The argument is sound but it is inference from content.
- **Nothing here re-verified the Figma node.** Gates 4 and 6 compare the repo and the reference
  page; the page's claims about what Figma says were read from the page, which is the
  doc-generator's work, not this review's.
- **`Space toggles` and the pressed reading were taken from QA's rows, not reproduced.** That is
  the role working as intended — this review confirms a pass exists and does not re-run it — but
  it means the behaviour evidence in this report is QA's and carries QA's confidence, not a
  second independent one.

## Not done, deliberately

No code, doc or registry cell was fixed — including the missing `GitHub Commits` row, which is
`engineer`'s to create. No test was re-run. Nothing was deployed and no version was cut.
`Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two cells
this review owns — `Release Review` and `Release Verdict` — were written together.
