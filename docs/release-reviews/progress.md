# Release review — Progress

**Component row:** `rec5jvJWQLqqryX6y` · **Category:** ATOMS ·
**Reviewed at commit:** `d64f7e7` · **Reviewed:** 2026-10-15 ·
**Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

**The trigger ordering is unresolved.** Stated in every report, per `.claude/agents/release.md`:
`Completed` wakes this review and DevOps sets `Completed`, but DevOps's version gate needs
`Release Verdict = Cleared` before cutting a version. As drawn the loop has no entry point. The
trigger was `Completed` and the order was not quietly changed.

**The gate list does not exist.** Both `.claude/agents/release.md` and the registry contract cite
"the seven gates" in `.claude/skills/release-review/SKILL.md`, and that file is not in the
repository. The gates were not invented; this reviews against what the role file itself states.
Recorded identically in all six reviews; a human owns writing them down.

## What was checked

**A QA pass exists, and was not re-run.** 22 linked Staging Testing rows, **all 22 `Passed`**,
none blank and none `Failed`, read from the rows rather than from `Synchronization %`.

**Production serves the code that was reviewed.** The build at `Production Storybook` is
deployment `4r5i88bvg`, built from `62e501e` on `main`. `d64f7e7` — the commit the row names and
the one QA tested — is an ancestor of it. Opened, and Progress renders: eight instances across
the `brand` and `positive` variants.

**The evidence is current.** `git log d64f7e7..origin/main -- src/components/progress/` is empty,
and nothing has touched the component or `tokens/` since the deployed commit. `d64f7e7` is also
the only commit that has ever touched `src/components/progress/`.

**One incidental observation, checked before it was written down.** The component roots carry no
`role` and no value attributes, which would be a defect in a progress indicator. They are on the
child: `.lumo-progress__track` carries `role="progressbar"` with `aria-valuenow`,
`aria-valuemin`, `aria-valuemax` and `aria-labelledby` pointing at the label's generated id —
eight of them, one per instance. **There is no finding here.** It is recorded only because the
first reading looked like one, and a review that reports its first reading rather than its
checked one is worse than no review.

## Why `Blocked`

### 1. No reference page exists, and no site exists to hold one

`Astro Link` is empty, and there is no Astro documentation site in this repository — no `astro`
or `starlight` dependency in `package.json`, no such file tracked anywhere on `main`. The role
file is explicit: *"A missing reference page is a `Blocked` reason, not a gap for you to fill."*
The cell is unwritable rather than unwritten.

**Owners:** the Doc-generator owns `Astro Link` but cannot link a site that does not exist.
Standing it up is a dependency and tooling decision, routed through `tools.md` and a human.

### 2. The promotion record says this component was promoted untested

Progress reached `main` through **PR #24, titled "Promote Progress to main (untested — see
reviewer notes)"**. The row today reads 22 of 22 `Passed` at 100%, so the component is tested
now.

What this review cannot establish is the order. Either the title was inaccurate when written, or
Progress was genuinely promoted to production before it was tested and the rows were filled in
afterwards. Those are very different facts about this pipeline, and the second one is the same
failure mode that put a known-broken Field into production today — a promotion that went ahead
while the evidence said not to.

The current test rows are evidence about the component. They are not evidence about the order in
which that component was shipped and tested, and a release review is exactly where that
distinction should be made rather than smoothed over.

**Owner:** a human, to say which it was. This is deliberately not treated as resolved by the
green matrix, because the matrix cannot speak to it.

## Findings that are not blocking

- **`Attachment` is empty on all 22 rows.** Structural across this base; QA has no host for
  evidence and `reports/` is gitignored. Not Progress's.
- **The staleness rule cannot work as written.** It calls a review stale once `Last Modified`
  passes the reviewed commit, but `Last Modified` moves on any cell write. The rule needs to
  compare against the component's code, not the row's last touch.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no version
was cut. `Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two
cells this review owns were written together.
