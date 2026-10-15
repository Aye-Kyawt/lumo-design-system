# Release review — Button

**Component row:** `recAWIHtsj5F52U8f` · **Category:** ATOMS ·
**Reviewed at commit:** `d501bea` · **Reviewed:** 2026-10-15 ·
**Recommended verdict: `Blocked`**

> This verdict is a reading of the evidence, not an approval. A human decides whether the
> release happens, bumps the version and tags it. `CLAUDE.md`: a human approves, and no agent
> approves its own work, ever.

**The trigger ordering is unresolved.** Stated in every report, per `.claude/agents/release.md`:
`Completed` wakes this review and DevOps sets `Completed`, but DevOps's version gate needs
`Release Verdict = Cleared` before cutting a version. As drawn the loop has no entry point. The
trigger was `Completed` and the order was not quietly changed.

**The gate list does not exist.** `.claude/agents/release.md` and the registry contract both
cite "the seven gates" in `.claude/skills/release-review/SKILL.md`; that file is not in the
repository, which holds only the `build`, `registry` and `test` skills. The gates were not
invented. This is a review against what the role file itself states, and it is explicitly not
the seven gates. Recorded identically in all six reviews; a human owns writing them down.

## What was checked

**A QA pass exists, and was not re-run.** 15 linked Staging Testing rows, **all 15 `Passed`**,
none blank and none `Failed`, read from the rows rather than from `Synchronization %`. Per the
role, this confirms a pass exists; no independent view of correctness was formed.

**Production serves the code that was reviewed.** The build at `Production Storybook` is
deployment `9pesg6euh`, built from `7cfa74d` on `main`. `d501bea` — the commit the row names and
the one QA tested — is an ancestor of it. Opened, and Button renders: 15 `.lumo-button`
instances, the fill variant resolving to `rgb(22, 149, 177)` (`bg/primary/idle`), radius `8px`
(`radius/button` → `radius/md`), height 36px, font Inter.

**The evidence is current.** `git log d501bea..origin/main -- src/components/button/` is empty,
and nothing has touched the component or `tokens/` since the deployed commit. Neither the code
nor the tokens beneath it have moved.

## Why `Blocked`

**No reference page exists, and no site exists to hold one.** `Astro Link` is empty, and there
is no Astro documentation site in this repository — no `astro` or `starlight` dependency in
`package.json`, no such file tracked anywhere on `main`. The role file is explicit: *"A missing
reference page is a `Blocked` reason, not a gap for you to fill."* The cell is not unwritten but
unwritable, which is why nothing in this system has reached `Released`.

**Owners:** the Doc-generator owns `Astro Link` but cannot link a site that does not exist.
Standing it up is a dependency and tooling decision, routed by `CLAUDE.md` through `tools.md`
and a human.

## Finding for a human: QA finding F4 is unaccounted for

The commit that closed Button's QA findings is `d501bea`, *"Fix QA findings F1, F2, F3, F5 on
Button"*. **F4 is named in no commit in this repository** — `git log --all --grep=F4` returns
only that same commit, which does not claim to fix it, and Button has only two commits in total.

This review cannot tell whether F4 was fixed under another description, withdrawn by QA as
invalid, or simply dropped. All 15 current rows read `Passed`, so whatever F4 was, no open
`Failed` row records it today. But a release that cannot say what happened to a numbered finding
is a release with a hole in its record.

**Owner:** a human, to establish which of the three it was. If it was dropped rather than
resolved, the owner becomes the Engineer.

## Findings that are not blocking

- **`Attachment` is empty on all 15 rows.** QA has no host for evidence and `reports/` is
  gitignored, so the durable evidence that column exists to hold does not exist. Structural and
  common to every component in this base, not specific to Button.
- **The staleness rule cannot work as written.** It calls a review stale once `Last Modified`
  passes the reviewed commit, but `Last Modified` moves on any cell write — writing this row's
  `Commit` cell earlier today already pushed it past `d501bea`. The rule needs to compare against
  the component's code, not the row's last touch.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no version
was cut. `Astro Link`, `Staging Storybook` and `Production Storybook` were not written. The two
cells this review owns were written together.
