# Release review — Empty State

**Component row:** `rec77d89FR1OFP9C1` · **Category:** MOLECULES ·
**Reviewed at commit:** `50cd21b` · **Reviewed:** 2026-10-15 ·
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

**A QA pass exists, and was not re-run.** 26 linked Staging Testing rows, **all 26 `Passed`**,
none blank and none `Failed`, read from the rows rather than from `Synchronization %`. The rows
are well named — size and boolean combinations, slot cases, tab order, focus inside the slot,
token bindings, platform and theme modes — and a reader can tell them apart without opening the
base, which is not true of every component here.

**Production serves the code that was reviewed.** The build at `Production Storybook` is
deployment `4bvnsga0v`, built from `71c9226` on `main` — the commit titled "Promote Empty State
to main". `50cd21b`, the commit the row names and the one QA tested, is an ancestor of it.
Opened, and Empty State renders: eight instances in the matrix, `lumo-empty-state--sm` among
them, drawing the icon, title and description.

**The evidence is current.** `git log 50cd21b..origin/main -- src/components/emptyState/` is
empty, and nothing has touched the component or `tokens/` since the deployed commit. `50cd21b`
is the only commit that has ever touched it.

**`Composes` is empty, and that is correct — verified rather than assumed.** The build report
describes Empty State as composing Button rather than copying it, which would normally mean
`Composes` should name Button. It should not: `emptyState.jsx` imports only `EmptyStateIcon` and
its own stylesheet. The Button arrives through the `children` slot, supplied by the consumer,
and only `emptyState.stories.jsx` imports Button — as story scaffolding, to prove a real Button
keeps its states inside the slot. The component imports nothing from the library, so the column
is right to be empty.

## Why `Blocked`

**No reference page exists, and no site exists to hold one.** `Astro Link` is empty, and there is
no Astro documentation site in this repository — no `astro` or `starlight` dependency in
`package.json`, no such file tracked anywhere on `main`. The role file is explicit: *"A missing
reference page is a `Blocked` reason, not a gap for you to fill."* The cell is unwritable rather
than unwritten.

**Owners:** the Doc-generator owns `Astro Link` but cannot link a site that does not exist.
Standing it up is a dependency and tooling decision, routed through `tools.md` and a human.

## Disclosure: this row's staging evidence was reconstructed after the fact

A reviewer should know how one cell on this row came to be filled. Until earlier today
`Staging Storybook` was **empty** while `Production Storybook` was set — the component had been
promoted to production with no record of the staging build it came from.

That cell was filled today, by me acting in the Engineer's seat, by locating the
`component/empty-state` branch's preview deployment, opening it and confirming the component
rendered before writing the link. The link is therefore honest about what it points at, and it
is **not** contemporaneous evidence recorded at the time of the staging pass. It was
reconstructed from the deployment history, three days later.

I am disclosing it because I wrote it and I am now reviewing the row that contains it, which is
as close to reviewing my own work as this report comes. Nothing in the verdict rests on that
cell. A human may reasonably want someone other than me to confirm it.

## Findings that are not blocking

- **`Attachment` is empty on all 26 rows.** Structural across this base; QA has no host for
  evidence and `reports/` is gitignored, so the durable evidence the column exists to hold does
  not exist. Not Empty State's.
- **The staleness rule cannot work as written.** It calls a review stale once `Last Modified`
  passes the reviewed commit, but `Last Modified` moves on any cell write — today's
  `Staging Storybook` and `Commit` writes already pushed this row past `50cd21b`. The rule needs
  to compare against the component's code, not the row's last touch.
- **The build report records six reported gaps** against the Figma node, and PR #30's title names
  four findings for a human. Neither number was re-derived here; QA confirmed the component
  against the node and that is the pass this review relies on. Flagged only so a human reading
  the two numbers side by side knows this review did not reconcile them.

## Not done, deliberately

No code, doc or registry cell was fixed. No test was re-run. Nothing was deployed and no version
was cut. `Astro Link` and `Production Storybook` were not written, and `Staging Storybook` was
not written *by this review* — see the disclosure above. The two cells this review owns were
written together.
