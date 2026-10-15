# Release review — Card

**Component row:** `rec3Z897rTPD8DeRz` · **Category:** ORGANISMS ·
**Reviewed at commit:** `5c7687c` · **Reviewed:** 2026-10-15 ·
**Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

**The trigger ordering is unresolved.** Stated in every report, per `.claude/agents/release.md`:
`Completed` wakes this review and DevOps sets `Completed`, but DevOps's version gate needs
`Release Verdict = Cleared` before cutting a version. As drawn the loop has no entry point. The
trigger was `Completed` and the order was not quietly changed.

**The gate list does not exist.** Both `.claude/agents/release.md` and the registry contract
cite "the seven gates" in `.claude/skills/release-review/SKILL.md`, and that file is not in the
repository. The gates were not invented; this reviews against what the role file itself states.
Recorded identically in all six reviews; a human owns writing them down.

## What was checked

**A QA pass exists, and was not re-run.** 28 linked Staging Testing rows, **all 28 `Passed`**,
none blank and none `Failed`, read from the rows rather than from `Synchronization %`.

The row set is notable for an organism and worth recording: it covers not only `Card` but
`Card / cardLayoutVertical`, `Card / cardHeader` and `Card / cardFooter` as named cases. That is
the subcomponent structure `CLAUDE.md` asks of components at the organism level being tested as
structure rather than as one opaque box.

**Production serves the code that was reviewed.** The build at `Production Storybook` is
deployment `4bvnsga0v`, built from `71c9226` on `main`. `5c7687c` — the commit the row names and
the one QA tested — is an ancestor of it. Opened, and Card renders:
`lumo-card lumo-card--padding-none` resolving to a white surface at radius `12px`
(`radius/card` → `radius/lg`).

**The evidence is current.** `git log 5c7687c..origin/main -- src/components/card/` is empty, and
nothing has touched the component or `tokens/` since the deployed commit.

**`Composes` is empty, and that is correct here.** Card's subcomponents — `cardHeader`,
`cardFooter`, `cardLayoutVertical` — are files inside `src/components/card/`, not separate rows
in the registry, so there is no library component for Card to declare a dependency on. The
column means "components this one imports", and the answer is genuinely none.

## Why `Blocked`

**No reference page exists, and no site exists to hold one.** `Astro Link` is empty, and there is
no Astro documentation site in this repository — no `astro` or `starlight` dependency in
`package.json`, no such file tracked anywhere on `main`. The role file is explicit: *"A missing
reference page is a `Blocked` reason, not a gap for you to fill."* The cell is unwritable rather
than unwritten.

This lands harder on Card than on an atom. Card is the component most likely to be assembled
wrongly by a consumer — it has three subcomponents, a padding scale and slots — and it is
precisely the component whose published reference page would carry that assembly guidance. A
released organism with no reference page ships its API as folklore.

**Owners:** the Doc-generator owns `Astro Link` but cannot link a site that does not exist.
Standing it up is a dependency and tooling decision, routed through `tools.md` and a human.

## Findings that are not blocking

- **`Attachment` is empty on all 28 rows.** Structural across this base: QA has no host for
  evidence and `reports/` is gitignored, so the durable evidence the column exists to hold does
  not exist. Not Card's.
- **The staleness rule cannot work as written.** It calls a review stale once `Last Modified`
  passes the reviewed commit, but `Last Modified` moves on any cell write — writing this row's
  `Commit` cell earlier today already pushed it past `5c7687c`. The rule needs to compare
  against the component's code, not the row's last touch.
- **Twelve of the 28 rows carry the bare primary value `Card`**, with the variant detail in other
  columns. That is legible in the base and much less legible in a rollup or a report, where a
  dozen identical labels cannot be told apart. A naming convention for the primary field, as the
  Empty State and Switch rows use, would make the test record readable without opening it.
  Cosmetic; QA owns it.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no version
was cut. `Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two
cells this review owns were written together.
