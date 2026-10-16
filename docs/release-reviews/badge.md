# Release review — Badge

**Component row:** `recmGZQtjDVLuQ7du` · **Reviewed at commit:** `9cad52f` ·
**Reviewed:** 2026-10-16 · **Recommended verdict: `Cleared`**

> **`Cleared` is a reading of the evidence, not an approval.** A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever. See *What writing this verdict does to the row* before acting
> on it.

This replaces the review of 2026-10-15, which recommended `Blocked`. Both of that review's
reasons have since been addressed, and both were verified here rather than taken on trust.
Every gate now passes.

## Correction to the first issue of this review

The first version of this report, committed earlier on 2026-10-16, recommended `Blocked` on
gate 2 and quoted `https://lumo-design-system-107qdzn14-…` as `Production Storybook`. **That
URL is the `Staging Storybook` cell.** The columns were transposed when the row was read, and
the error was caught in review by another session.

Badge's `Production Storybook` is `https://lumo-design-system-4twqf837q-…`. Confirmed two ways:
requesting the field *by name* returns `fldJPlSgnkaiS4ElR` holding the `4twqf837q` URL, and the
`Development` formula reads `fldJPlSgnkaiS4ElR` at rule 5 (`Completed`) and `fldOuJpSivewZrGyt`
at rule 7 (`Ready for Testing`), which fixes the two roles.

Gate 2 is re-run below against the right cell and it passes. The 2026-10-15 review's reading of
production was correct; this review's first reading was not. What was true about the
`107qdzn14` build is still true — it serves pre-`9cad52f` CSS — but it is a staging cell, no
gate covers it, and it is recorded below as a non-blocking finding.

## The trigger ordering is unresolved

Stated in every report, per `.claude/agents/release.md`. `Completed` wakes this review, and
DevOps sets `Completed`. But DevOps's version gate needs `Release Verdict = Cleared` before it
cuts a version, so the review must run after DevOps promotes and before DevOps versions — and
as drawn the loop has no entry point. The row read `Completed`, which is the trigger this
review acted on, and the order was not quietly changed.

Nothing woke this re-review. `Blocked` is terminal with no owner (`docs/crew-spec.md`, open
question 7), so a human started it.

## About the gates run here

These are **the reconstructed gates** in `.claude/skills/release-review/SKILL.md`, and they
are **not ratified**. That file did not exist when the 2026-10-15 reviews ran; it was written
on 2026-10-16 by reconstructing seven recurring checks from `.claude/agents/release.md` and
from what those six reviews actually checked, and it opens with a banner saying no human has
agreed to it. It is cited here as the best available criteria and not as settled policy. This
report deliberately does not call them *the seven gates*.

A `Cleared` verdict rests on that unratified list more heavily than a `Blocked` one would. A
block names a specific defect that stands on its own; a clear is a statement that nothing in
the list failed, and the list is provisional. Said here rather than left for a reader to work
out.

## What changed since 2026-10-15

| Previous reason | State now |
|---|---|
| `Astro Link` empty, and no site existed to hold a page | A Starlight site is live and the page carries all seven intent fields — gate 4 |
| `Commit` named `ebcd8f6`, one commit before what shipped | `Commit` now names `9cad52f` in full, and the `GitHub Commits` table carries a row for it — gate 5 |

Nothing changed under the component. `9cad52f` is still the newest commit to touch
`src/components/badge/`, so everything the 2026-10-15 review established about the code still
holds; what moved was the documentation and the registry around it.

## Gate 1 — a QA pass exists, and was not re-run

**Pass.** Five linked Staging Testing rows, one per tone. Read directly rather than through
`Synchronization %`: Primary, Success, Warning, Danger and Neutral all carry `Testing Results`
= `Passed`. None is blank and none is `Failed`.

Each row's `Context` records a re-test on 2026-10-13 against `9cad52f`, naming the superseded
values it replaced — Warning's row says the 2026-10-10 reading judged `#E37316`, "which
production no longer serves".

Per the role, this confirms a pass *exists*. No independent view of correctness was formed and
no test was re-run.

## Gate 2 — production serves the code that was reviewed

**Pass.** `Production Storybook` is
`https://lumo-design-system-4twqf837q-aye-kyawts-projects.vercel.app/?path=/story/components-badge--all-tones`.
Opened, and all five badges render — `60.67×24`, `999px` radius, Inter 12/500.

**It serves the reviewed commit.** Read from that deployment's own stylesheet, the five tone
rules are `badge.css` at `9cad52f` verbatim:

```
.lumo-badge--primary { --lumo-badge-bg: var(--color-bg-primary-tonal-idle);  --lumo-badge-fg: var(--color-text-brand); }
.lumo-badge--success { --lumo-badge-bg: var(--color-bg-positive-tonal-idle); --lumo-badge-fg: var(--color-text-positive); }
.lumo-badge--warning { --lumo-badge-bg: var(--color-bg-warning-tonal-idle);  --lumo-badge-fg: var(--color-text-orange-twotone); }
.lumo-badge--danger  { --lumo-badge-bg: var(--color-bg-negative-tonal-idle); --lumo-badge-fg: var(--color-text-red-twotone); }
.lumo-badge--neutral { --lumo-badge-bg: var(--color-bg-surfacesecondary);    --lumo-badge-fg: var(--color-text-secondary); }
```

Warning and Danger bind the twoTone pair, which is the entire content of `9cad52f`. The
rendered labels follow, and match the contrast table in `docs/badge.md`:

| Tone | Rendered | Hex | Surface |
|---|---|---|---|
| primary | `rgb(23, 110, 130)` | `#176e82` | `#eff8fa` |
| success | `rgb(23, 130, 62)` | `#17823e` | `#effaf3` |
| warning | `rgb(130, 71, 23)` | `#824717` | `#faf4ef` |
| danger | `rgb(130, 23, 32)` | `#821720` | `#faeff0` |
| neutral | `rgb(99, 102, 121)` | `#636679` | `#ebedf4` |

**Ancestry, established two ways.** The twoTone bindings exist only at `9cad52f` and later —
`ebcd8f6` bound `--color-text-warning` and `--color-text-negative`, and nothing has reverted
them — so a build serving them necessarily contains that commit. Independently, the
deployment's `/index.json` lists `components-field`, and the Field build commit `72bf468` has
`9cad52f` as an ancestor (`git merge-base --is-ancestor` returns true), so the build commit
does too.

A sibling session reports the deployment as `dpl_2bttUcC3NYuUXK3opoRBx6vPfWEK` built from
`e3165e1`. That sha was not read here — the Vercel connector has no project access on this
account — but it is consistent: `git merge-base --is-ancestor 9cad52f e3165e1` returns true.
This gate does not rest on it; it rests on the two checks above.

## Gate 3 — the test evidence is current

**Pass.**

```
git log 9cad52f..origin/main -- src/components/badge/   → nothing
git log 9cad52f..origin/main -- tokens/                 → nothing
```

Nothing has touched Badge's folder or `tokens/` since the commit QA tested. `9cad52f` is still
the newest commit to touch `src/components/badge/`, and it is on `main`.

Run fresh today, against a repo that took sixteen commits on `main` since the last review —
Field, Accordion, Toast, the reference site, the intent records and the gate file. None of them
is under Badge or under `tokens/`.

`Last Modified` on the row reads later than `9cad52f`. That is the `Astro Link` write, not a
code change; see the standing finding about why that comparison cannot work as the skill states
it.

## Gate 4 — a reference page exists

**Pass.** `Astro Link` is `https://lumo-reference-site.vercel.app/components/badge/`. The page
was opened and read.

All seven intent fields are present and each records something:

| Field | What it records |
|---|---|
| `use_when` | Both sources agree verbatim — label a status or category the user reads, not clicks |
| `dont_use_when` | Both sources agree verbatim — not for something interactive; use Chip. Notes Chip has no code |
| `variant_intent` | Shape agreed (one `Tone` property, five values); per-tone meaning stated by neither source, and the page says so |
| `placement` | Neither source states one; four other Figma components that place a Badge are listed as evidence |
| `pairs_with` | Five Figma host components named; the repo demonstrates none, and the page explains why |
| `required_tokens` | Full token table, per-tone surface and label, the measured contrast figures, the mode-dependence of both padding tokens |
| `anatomy` | Two parts — pill and label — agreed by both sources; marked as an unconfirmed field name |

None reads "Not yet recorded". The page also carries two disclosures worth a reader's
attention: `anatomy` is the doc-generator's reading of a truncated field name on the source
board, and `get_variable_defs` on 17:1139 returns a bare `color/primary: #5b4cf5` that neither
source explains. Both are declared rather than smoothed over, which is the behaviour this gate
wants.

## Gate 5 — the registry row names the right commit

**Pass.**

`Commit` reads
`https://github.com/Aye-Kyawt/lumo-design-system/commit/9cad52fe90abe684108a1d36807aec100e11d9cb`
— the full sha, not the `ebcd8f6` the previous review found.

Established independently rather than from the cell. `9cad52f` is the newest of exactly three
commits that have ever touched `src/components/badge/` (`54c65d4` → `ebcd8f6` → `9cad52f`), it
is an ancestor of `origin/main`, nothing after it touches Badge, and the production build
serves exactly its CSS. It is the commit that shipped the reviewed code.

`GitHub Commits` links all three, and the row for `9cad52f` carries the right hash, message and
`Date Committed` (`2026-10-12T14:41:22Z`, matching the commit's own timestamp). Both halves of
this gate name the same commit.

## Gate 6 — the component's own documentation matches what it is

**Pass.** `docs/badge.md` is byte-identical at `9cad52f` and at `HEAD`, and its claims hold
against `badge.css` and `badge.jsx` at that commit:

- the per-tone table names `--color-text-orange-twotone` and `--color-text-red-twotone` for
  Warning and Danger, which is what the CSS binds and what production serves;
- the shared table's radius, both paddings and `--label-label1` match the rule;
- the matrix is five tones, matching the `TONE` array in `badge.jsx`;
- "no interaction states" matches a file with no `:hover`, `:active` or `:focus` rule and a
  `<span>` that takes no `onClick`;
- the mode-dependence table and the five contrast ratios match what the production build
  returns.

One omission is recorded below as non-blocking rather than as a gate failure; the reasoning is
given there, because a human may want to rule the other way.

## Gate 7 — the dependency record is honest

**Pass.** `Composes` is empty, and that is correct: at `9cad52f`, `badge.jsx` imports only
`./badge.css`, and `index.js` re-exports only Badge. The component imports nothing from the
library. `Composed Into` is empty too, which follows — no component in `src/components/`
imports Badge.

## Why `Cleared`

All seven checks pass. The QA pass is complete and was read row by row; the deployment the
registry names as production serves the reviewed commit, established from its own stylesheet
and from an ancestry check that does not depend on Vercel metadata; nothing has moved under the
component or the tokens since QA tested it; the reference page records real intent in all seven
fields; both halves of the commit record name `9cad52f`; the build report matches the code; and
the dependency record is right.

**This is a reading of the evidence and it is not an approval.** It recommends that Badge's
name may go into a version. A human decides whether that happens.

### What writing this verdict does to the row

Worth stating because it is automatic. `Development` rule 4 fires when `Astro Link`,
`Release Review` and `Release Verdict = Cleared` are all set. All three now are, so **the row
will read `Released`** as soon as these cells are written — the first component in this system
to do so.

`Released` appearing in the registry is the formula reading three cells. It is **not** a human
having approved the release, and nothing in the base distinguishes the two. If anything
downstream — DevOps's version gate in particular — treats either `Released` or this `Cleared`
cell as the approval itself, that would make an agent the final approver, which `CLAUDE.md`
forbids. Per `.claude/agents/release.md`, this review says so and stops here.

## Findings that are not blocking

- **`Staging Storybook` points at a build older than the reviewed commit.** The cell names
  `lumo-design-system-107qdzn14-…`, whose stylesheet binds `--color-text-warning` and
  `--color-text-negative` — `badge.css` as it stood at `ebcd8f6`. It renders Warning at
  `#b15c16` (4.36 against its surface) and Danger at `#e31628` (4.23), both under AA, which is
  the failure `9cad52f` fixed. No gate covers the staging cell and the ladder has moved past
  precedence 7, so this blocks nothing — but anyone sent to that link to look at Badge sees the
  pre-fix component. **Owner: `engineer`**, which owns `Staging Storybook`.
- **`docs/badge.md` says nothing about forced colors, though `badge.css` implements it.** At
  `9cad52f` the file carries `@media (forced-colors: active) { .lumo-badge { border:
  var(--border-width-default) solid CanvasText; } }`, and the build report has no entry for it.
  The 2026-10-15 Switch review treated an equivalent silence as part of a gate-6 failure, so
  this is a deliberate departure and the reasoning is owed. That failure was carried jointly by
  a *false* claim — the doc said pressed was unobserved when QA had observed it — and Badge
  makes no false claim. And the omission is repo-wide: `docs/button.md`, `docs/field.md` and
  `docs/accordion.md` are silent about forced-colors blocks their components implement, while
  `docs/card.md` and `docs/progress.md` document theirs. That is an unwritten documentation
  convention, not Badge misdescribing itself. **Owner: `engineer`**, and a human ratifying the
  gates may reasonably decide the gate should cover silences too. Given this verdict is
  `Cleared`, this is the finding most worth a second opinion.
- **No QA row covers Badge's forced-colors behaviour.** The five rows are one per tone. Stories
  exist for label lengths and in-context use, and there is a forced-colors rule in the CSS, and
  none of the three has a test row. Gate 1 as written asks only that a pass exists, which it
  does. **Owner: `qa`**, if a human decides coverage belongs in the gate.
- **`Attachment` is empty on all five rows.** QA has no host for evidence and `reports/` is
  gitignored, so the durable evidence that column exists to hold does not exist. Structural and
  not Badge's; unchanged since 2026-10-15.
- **The staleness rule still cannot work as written.** The skill calls a review stale once
  `Last Modified` is later than the commit it read, but `Last Modified` moves on *any* cell
  write — today's `Astro Link` write already moved it past `9cad52f`, and writing this review's
  own two cells will move it again. The rule needs to compare against the component's code, not
  the row's last touch. Open question 3 in the gate file.
- **Nothing in the registry observes a merge.** Registry Flag 9. `Production Storybook` means
  "DevOps opened a build and wrote it down", not "this is what production serves"; there is no
  project-wide alias (`lumo-design-system.vercel.app` returns `404: NOT_FOUND`), so each cell is
  a per-deployment snapshot that nothing updates when a later commit ships. It happens to be
  current for Badge. That is a fact about today, not a property of the mechanism. Closing it is
  a change to the base and therefore a human's.

## Where this review's own evidence is weaker than it looks

- **The gate list is unratified**, and a `Cleared` leans on the completeness of that list in a
  way a `Blocked` would not.
- **The deployment's build sha was not read from Vercel.** The connector has no project access,
  so gate 2's ancestry rests on served content — the twoTone CSS rules, and a story index
  containing Field — rather than on deployment metadata. Both are sound, and both are inference
  from what the build contains.
- **This review got the production column wrong on its first pass** and was corrected by another
  session. The correction is recorded at the top rather than quietly folded in, because a report
  that hides its own errors is worth less than one that shows them.
- **Nothing here re-verified the Figma node.** Gates 4 and 6 compare the repo and the reference
  page; the page's claims about what Figma says were read from the page, which is the
  doc-generator's work, not this review's.
- **The behaviour evidence is QA's, not reproduced here.** That is the role working as intended
  — this review confirms a pass exists and does not re-run it — but it means gate 1 carries QA's
  confidence rather than a second independent one.

## Not done, deliberately

No code, doc or registry cell was fixed — including `Staging Storybook`, which is stale and is
`engineer`'s to correct. No test was re-run. Nothing was deployed and no version was cut.
`Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two cells
this review owns — `Release Review` and `Release Verdict` — were written together.
