# Release review — Badge

**Component row:** `recmGZQtjDVLuQ7du` · **Reviewed at commit:** `9cad52f` ·
**Reviewed:** 2026-10-15 · **Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

## The trigger ordering is unresolved

Stated in every report, per `.claude/agents/release.md`. `Completed` wakes this review, and
DevOps sets `Completed`. But DevOps's version gate needs `Release Verdict = Cleared` before it
cuts a version. So the review must run after DevOps promotes and before DevOps versions, and
as drawn the loop has no entry point. This review was triggered by `Completed` and the order
was not quietly changed.

## The gate list this review was supposed to run does not exist

`.claude/agents/release.md` says to "run the review per the `Release-review` skill and its
gates", and the registry contract refers twice to "the seven gates in
`.claude/skills/release-review/SKILL.md`".

**That file does not exist.** `.claude/skills/` contains `build`, `registry` and `test`, and
nothing else. The seven gates are referenced in three places and defined in none.

They were not invented here. `CLAUDE.md` says to report a gap rather than fill it in, and a
fabricated gate list would be worse than a missing one: it would read as criteria a human had
agreed to. What follows is a review against what the role file itself states, and it is
explicitly **not** the seven gates.

**Owner:** a human owns the design system and owns writing those gates down.

## What was checked

### A QA pass exists, and was not re-run

Five linked Staging Testing rows, one per tone — Primary, Success, Warning, Danger, Neutral.
**All five read `Passed`; none is blank and none is `Failed`.** Confirmed by reading the rows,
not by trusting `Synchronization %`.

Per the role, this confirms a pass *exists*. No independent view of correctness was formed and
no test was re-run.

### Production serves the code that was reviewed

The deployed build at `Production Storybook` was opened and Badge rendered. Computed label
colours, read from the production DOM:

| Tone | Rendered | Note |
|---|---|---|
| primary | `rgb(23, 110, 130)` | `#176E82` |
| success | `rgb(23, 130, 62)` | `#17823E` |
| warning | `rgb(130, 71, 23)` | `#824717` — twoTone tier |
| danger | `rgb(130, 23, 32)` | `#821720` — twoTone tier |
| neutral | `rgb(99, 102, 121)` | `#636679` |

Warning and Danger carry the twoTone values that commit `9cad52f` introduced, not the
superseded `#E37316` / `#E31628`. That is independent evidence the deployed build is the
reviewed commit rather than an earlier one.

### The test evidence is current

All five rows were re-tested on 2026-10-13 against `9cad52f`, and their `Context` cells say so.
`git log 9cad52f..origin/main -- src/components/badge/ tokens/` returns nothing: no commit has
touched Badge or the tokens since the commit those rows judged.

## Why `Blocked`

### 1. No reference page exists — and no site exists to hold one

`Astro Link` is empty. The role file is unambiguous that this is a blocking reason and not a
gap for this review to fill: *"A missing reference page is a `Blocked` reason, not a gap for
you to fill."*

The cause is worse than an unwritten page. **There is no Astro documentation site in this
repository at all** — no `astro` or `starlight` dependency in `package.json` and no such file
tracked anywhere on `main`. So `Astro Link` is not merely unwritten, it is currently
unwritable, which is why no component in this system has ever reached `Released`.

**Owners:** the Doc-generator owns `Astro Link`. But it cannot write a link to a site that does
not exist, so standing that site up comes first, and that is a dependency and tooling decision
which `CLAUDE.md` routes through `tools.md` and a human.

### 2. `Commit` names the wrong commit

The row's `Commit` cell points at `ebcd8f6`. The code that shipped, and that QA tested, is
`9cad52f` — one commit later, and the one that moved Warning and Danger onto the twoTone tier.
So the registry's own record of what shipped is stale by exactly the change that made the
current tests necessary.

This is cosmetic in production and not cosmetic in the board: a reviewer following `Commit`
lands on code whose Warning and Danger values the deployed build no longer uses.

**Owner:** the Engineer owns `Commit`.

## Findings that are not blocking

- **`Attachment` is empty on all five rows.** QA has no host to put evidence behind and
  `reports/` is gitignored, so the durable evidence that column exists to hold does not exist —
  for this component or, as far as this review can see, any other. Structural, not Badge's.
- **The staleness rule cannot work as written.** The role file says a review is stale once
  `Last Modified` is later than the commit it read. `Last Modified` updates on *any* cell write,
  including DevOps writing `Production Storybook` — which happened after `9cad52f` and would
  therefore mark this review stale the moment it is filed. The rule needs to compare against the
  component's code, not the row's last touch. Reported, not worked around.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no
version was cut. `Astro Link`, `Staging Storybook` and `Production Storybook` were not written.
The two cells this review owns — `Release Review` and `Release Verdict` — were written
together.
