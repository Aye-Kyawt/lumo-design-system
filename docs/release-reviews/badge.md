# Release review — Badge

**Component row:** `recmGZQtjDVLuQ7du` · **Reviewed at commit:** `9cad52f` ·
**Reviewed:** 2026-10-16 · **Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

This replaces the review of 2026-10-15, which also recommended `Blocked`. Both of that
review's reasons have since been addressed — see *What changed since 2026-10-15* — and the
block now rests on something neither review had established before: the deployment the
registry calls production is not serving the reviewed commit.

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

Where a gate's outcome turns on the reconstructed wording rather than on precedent, this
report says so at that gate.

## What changed since 2026-10-15

Both of the previous review's blocking reasons are gone, and each was verified here rather
than taken on trust.

| Previous reason | State now |
|---|---|
| `Astro Link` empty, and no site existed to hold a page | A Starlight site is live and the page carries all seven intent fields — gate 4 below |
| `Commit` named `ebcd8f6`, one commit before what shipped | `Commit` now names `9cad52f` in full, and the `GitHub Commits` table carries a row for it — gate 5 below |

What has not changed, and what this review found, is gate 2. The 2026-10-15 review recorded
the twoTone label colours — `rgb(130, 71, 23)` and `rgb(130, 23, 32)` — as read from "the
deployed build at `Production Storybook`". Reading that cell's own URL today returns different
values, and the difference is not a theme or a mode: the stylesheet the deployment serves
binds different tokens. Those twoTone values are what the **staging** deployment serves. This
report draws no conclusion about how the earlier reading was taken; it records that the URL in
the cell does not serve them, with the rule text to show it.

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

**FAIL. Owner: `devops`.**

`Production Storybook` is
`https://lumo-design-system-107qdzn14-aye-kyawts-projects.vercel.app/?path=/story/components-badge--all-tones`.
It was opened and Badge renders — five tones, `60.67×24`, `999px` radius, `4px 8px` padding,
Inter 12/500. So the link is not dead.

But the build behind it is not `9cad52f`. Read from that deployment's own stylesheet
(`/assets/badge-C2ce1DeB.css`):

```
.lumo-badge--warning { --lumo-badge-bg: var(--color-bg-warning-tonal-idle); --lumo-badge-fg: var(--color-text-warning); }
.lumo-badge--danger  { --lumo-badge-bg: var(--color-bg-negative-tonal-idle); --lumo-badge-fg: var(--color-text-negative); }
```

That is the source `badge.css` carried at `ebcd8f6`, verbatim. At `9cad52f` the two rules bind
`--color-text-orange-twotone` and `--color-text-red-twotone` instead — that commit is *only*
those two lines plus comments and the build report. The rendered labels follow:

| Tone | Served by `Production Storybook` | Expected at `9cad52f` |
|---|---|---|
| warning | `rgb(177, 92, 22)` = `#b15c16` — `text/warning` | `#824717` — `text/orange/twoTone` |
| danger | `rgb(227, 22, 40)` = `#e31628` — `text/negative` | `#821720` — `text/red/twoTone` |

Both twoTone variables exist and resolve correctly in that same deployment
(`--color-text-orange-twotone` reads `#824717`, `--color-text-red-twotone` reads `#821720`),
so this is not a missing token. The CSS rule simply predates the rebind.

`9cad52f` reached `main` at merge `8942000` on 2026-10-13. The deployment also has no
`components-empty-state` entry in its `index.json`, and Empty State merged at `07617b8`, after
`8942000`. Both facts place the build before `9cad52f` was on `main`.

**So `9cad52f` is not an ancestor of the commit this deployment was built from, and the gate
fails as written.** The practical reading: the two tones this review's QA evidence exists to
cover — the two that used to fail AA — are being served at their pre-fix values by the build
the registry names as production. Warning at `#b15c16` on `#faf4ef` is 4.36:1, under AA;
Danger at `#e31628` on `#faeff0` is 4.23:1, under AA. The reviewed commit clears both.

**This is a recording failure, not a rebuild.** A deployment serving `9cad52f` exists: Badge's
own `Staging Storybook` cell
(`lumo-design-system-4twqf837q-…`) serves the twoTone rules and renders
`rgb(130, 71, 23)` / `rgb(130, 23, 32)`. There is no project-wide production alias to fall back
on — `lumo-design-system.vercel.app` returns `404: NOT_FOUND` — so `Production Storybook` is a
per-deployment snapshot and nothing updates it when a later commit ships. That is registry
Flag 9 showing up on a specific row.

DevOps owns `Production Storybook`. This review did not write it, did not deploy, and did not
promote anything.

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

`Last Modified` on the row reads 2026-10-16 14:25, later than `9cad52f`. That is the
`Astro Link` write, not a code change; see the standing finding below about why that comparison
cannot work as the skill states it.

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
source explains. Both are declared on the page rather than smoothed over, which is the
behaviour this gate wants.

## Gate 5 — the registry row names the right commit

**Pass.**

`Commit` reads
`https://github.com/Aye-Kyawt/lumo-design-system/commit/9cad52fe90abe684108a1d36807aec100e11d9cb`
— the full sha, not the `ebcd8f6` the previous review found.

Established independently rather than from the cell. `9cad52f` is the newest of exactly three
commits that have ever touched `src/components/badge/` (`54c65d4` → `ebcd8f6` → `9cad52f`), it
is an ancestor of `origin/main`, and nothing after it touches Badge. It is therefore the commit
that shipped the reviewed code.

`GitHub Commits` links all three, and the row for `9cad52f` carries the right hash, message and
`Date Committed` (`2026-10-12T14:41:22Z`, matching the commit's own timestamp). Both halves of
this gate name the same commit.

## Gate 6 — the component's own documentation matches what it is

**Pass.** `docs/badge.md` is byte-identical at `9cad52f` and at `HEAD`, and its claims hold
against `badge.css` and `badge.jsx` at that commit:

- the per-tone table names `--color-text-orange-twotone` and `--color-text-red-twotone` for
  Warning and Danger, which is what the CSS binds;
- the shared table's radius, both paddings and `--label-label1` match the rule;
- the matrix is five tones, matching the `TONE` array in `badge.jsx`;
- "no interaction states" matches a file with no `:hover`, `:active` or `:focus` rule and a
  `<span>` that takes no `onClick`;
- the mode-dependence table and the five contrast ratios match the measurements the deployed
  staging build returns.

One omission is recorded below as non-blocking rather than as a gate failure; the reasoning is
given there, because a human may want to rule the other way.

## Gate 7 — the dependency record is honest

**Pass.** `Composes` is empty, and that is correct: at `9cad52f`, `badge.jsx` imports only
`./badge.css`, and `index.js` re-exports only Badge. The component imports nothing from the
library. `Composed Into` is empty too, which follows — no component in `src/components/`
imports Badge.

## Why `Blocked`

**One gate fails: gate 2.** The deployment that `Production Storybook` names does not contain
the reviewed commit, and the two tones it serves differently are the two whose contrast fix is
the entire content of that commit. **Owner: `devops`**, which owns that cell. The fix is a
deployment that contains `9cad52f`, opened and recorded — not a change to Badge, whose code,
docs, tokens, QA evidence and reference page all check out.

Gates 1, 3, 4, 5, 6 and 7 pass.

## Findings that are not blocking

- **`docs/badge.md` says nothing about forced colors, though `badge.css` implements it.** At
  `9cad52f` the file carries `@media (forced-colors: active) { .lumo-badge { border:
  var(--border-width-default) solid CanvasText; } }`, and the build report has no entry for it;
  the only description lives in the CSS. The 2026-10-15 Switch review treated an equivalent
  silence as part of a gate-6 failure, so this is a deliberate departure and the reasoning is
  owed. That failure was carried jointly by a *false* claim — the doc said pressed was
  unobserved when QA had observed it — and Badge makes no false claim. And the omission is
  repo-wide, not Badge's: `docs/button.md`, `docs/field.md` and `docs/accordion.md` are silent
  about forced-colors blocks their components implement, while `docs/card.md` and
  `docs/progress.md` document theirs. That is a documentation convention nobody has written
  down, not Badge misdescribing itself. **Owner: `engineer`**, and a human ratifying the gates
  may reasonably decide the gate should cover silences too.
- **No QA row covers Badge's forced-colors behaviour.** The five rows are one per tone. Stories
  exist for label lengths and in-context use, and there is a forced-colors rule in the CSS, and
  none of the three has a test row. Gate 1 as written asks only that a pass exists, which it
  does, so this is not a block. **Owner: `qa`**, if a human decides coverage belongs in the
  gate.
- **`Attachment` is empty on all five rows.** QA has no host for evidence and `reports/` is
  gitignored, so the durable evidence that column exists to hold does not exist. Structural and
  not Badge's; unchanged since 2026-10-15.
- **The staleness rule still cannot work as written.** The skill calls a review stale once
  `Last Modified` is later than the commit it read, but `Last Modified` moves on *any* cell
  write — today's `Astro Link` write already moved it past `9cad52f`, and writing this review's
  own two cells will move it again. The rule needs to compare against the component's code, not
  the row's last touch. Reported in 2026-10-15 and still open; it is open question 3 in the
  gate file.
- **Per-component `Production Storybook` URLs are snapshots of different vintages.** Switch's
  production URL serves a Badge older still — `--color-icon-warning`, the pre-`ebcd8f6` build.
  Six `Completed` components point at six different deployments, none of them an alias, and
  nothing in the registry updates a cell when a later commit ships. The specific instance is
  gate 2 above; the general shape is registry Flag 9, and closing it is a change to the base
  and therefore a human's.

## Where this review's own evidence is weaker than it looks

- **The gate list is unratified**, and gate 2's wording ("the commit the row names must be an
  ancestor of the commit the deployment was built from") is a reconstruction. The underlying
  judgement does not depend on it: the deployment serves a CSS rule that `9cad52f` deleted.
- **The deployment's build commit was not read from Vercel.** The Vercel connector has no
  project access on this account, so the build was dated from what it serves — a pre-`9cad52f`
  CSS rule, and a story index with no Empty State — rather than from deployment metadata. Both
  bound it to before `8942000`, which is enough for this gate, but it is inference from content
  and not a commit sha read off the build.
- **Nothing here re-verified the Figma node.** Gates 4 and 6 compare the repo and the reference
  page; the page's own claims about what Figma says were read from the page, which is the
  doc-generator's work, not this review's.

## Not done, deliberately

No code, doc or registry cell was fixed — including `Production Storybook`, which is wrong and
is `devops`'s to correct. No test was re-run. Nothing was deployed and no version was cut.
`Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two cells
this review owns — `Release Review` and `Release Verdict` — were written together.
