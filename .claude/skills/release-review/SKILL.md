---
name: release-review
description: The gates a shipped component is reviewed against before its name goes into a version, and how to write the report and the recommended verdict. Use when the registry wakes the release agent on `Completed`.
---

# The release review

> ## ⚠️ These gates are derived, not agreed
>
> `.claude/agents/release.md` says to review "per the `Release-review` skill and its gates",
> and the registry base refers twice to "the seven gates in
> `.claude/skills/release-review/SKILL.md`". That file did not exist. The seven gates were
> referenced in three places and defined in none, and the six reviews written on 2026-10-15
> each said so and refused to invent them.
>
> **What follows was not invented either.** It is reconstructed from two sources that do
> exist: the steps and prohibitions stated in `.claude/agents/release.md`, and what those six
> reviews actually checked when left to their own judgement. Seven distinct checks recur
> across them; they are written down here so the next review does not have to re-derive them.
>
> **That is not the same as a human agreeing to them.** Until someone who owns the design
> system ratifies this file, a review may cite it as *the reconstructed gates* and must not
> call them *the seven gates* as though they were settled. Delete this banner when it is
> ratified, and say in the commit who ratified it.
>
> Open questions are listed at the end. **Owner: a human.**

## When to use this

The registry wakes the release agent when `Development` reads `Completed` — DevOps has written
`Production Storybook`, so the component is live and its name is about to go into a version.

Say in every report that the trigger ordering is unresolved. The source board runs the dashed
line into Release from `Completed`, which DevOps sets, but DevOps's version gate needs
`Release Verdict` = `Cleared` before it cuts a version. Run after DevOps promotes and before
DevOps versions, and do not quietly pick a different order.

A `Blocked` row keeps reading `Completed`, because `Released` needs all three of `Astro Link`,
`Release Review` and `Release Verdict` = `Cleared`. So a component can legitimately be
re-reviewed — but nothing will wake you to do it. `Blocked` is terminal with no owner
(`docs/crew-spec.md`, open question 7), so a re-review is always started by a human.

## The gates

Each gate says what it establishes, how to establish it, and who owns a failure. A gate you
cannot evaluate is a failed gate, not a skipped one — say which and why.

### 1. A QA pass exists, and was not re-run

Read the linked Staging Testing rows directly. Every row must carry a `Testing Results`
verdict and every verdict must read `Passed`.

**Read the rows, not `Synchronization %`.** A blank verdict counts toward `Total Staging Tests`
and not toward `Staging Passed Count`, and the `Development` ladder ignores blanks entirely
(registry Flag 4) — so a component can read `To be deployed` with cases nobody executed. The
percentage cannot tell you that; the rows can.

Confirm the pass **exists**. Never form your own view of whether the component is correct, and
never test it yourself. Missing or blank rows are a reason to block.

**Owner of a failure:** `qa`.

### 2. Production serves the code that was reviewed

Open the URL in `Production Storybook` and see the component render. Then establish that the
build actually contains the reviewed commit: the commit the row names must be an ancestor of
the commit the deployment was built from.

A link nobody opened is a lie in a cell, and a deployment from an unrelated commit means the
review describes something the public is not being served.

**Owner of a failure:** `devops`.

### 3. The test evidence is current

The QA pass describes the component at the commit QA tested. Establish that nothing has moved
under it since:

```
git log <reviewed-sha>..origin/main -- src/components/<name>/
```

Check `tokens/` the same way — a token change can alter a component without touching its
files. Anything returned means the evidence is stale and the row needs re-testing.

Cross-check `Last Modified` on the row for the same reason: a review older than the row's last
modification is describing something that no longer exists.

**Owner of a failure:** `qa` re-tests; `engineer` if the change was an unreviewed edit.

### 4. A reference page exists

`Astro Link` must be set, must open, and must carry the component's intent — what it is for,
when not to reach for it, what it pairs with — not merely render.

A page that renders but records no intent does not satisfy this gate. The cell says the
component is documented; a shell says only that a URL resolves.

**Never write this cell.** A missing reference page is a `Blocked` reason, not a gap for you to
fill. **Owner of a failure:** `doc-generator`.

### 5. The registry row names the right commit

`Commit` and the `GitHub Commits` link must name the commit that actually shipped the
reviewed code. A row pointing at the wrong commit makes every other gate unverifiable, because
there is no agreed answer to "which code is this review about".

**Owner of a failure:** `engineer`.

### 6. The component's own documentation matches what it is

Read the component's build report in `docs/<name>.md` against the code at the reviewed commit.
Claims about variants, states, tokens or measurements must still be true.

This is not a style review. It is a check that the written record does not contradict the
artefact, because the record is what the next person will trust.

**Owner of a failure:** `engineer`.

### 7. The dependency record is honest

`Composes` must name the library components this one imports, and must be empty only when the
answer is genuinely none.

Subcomponents that live inside the component's own folder are not entries here — the column
means components this one imports, and a file beside it is not one. An organism that imports
Button and declares nothing has an unusable `Composed Into`, which is the only thing in the
base that can answer "if this changes, who must be re-tested".

**Owner of a failure:** `engineer`.

## Forming the verdict

`Cleared` or `Blocked`, and the reasons are the review. A bare `Blocked` is an obstruction
rather than a review; a bare `Cleared` is worse, because it will be acted on.

- Any failed gate → `Blocked`, naming the gate and the agent that owns the fix.
- Every gate passed → `Cleared`, which recommends release and **is not** an approval.
- A finding that fails no gate goes in the report under findings that are not blocking. Do not
  inflate it into a block, and do not drop it.

**Your `Cleared` is a reading of the evidence.** `CLAUDE.md`: *a human approves, and no agent
approves its own work, ever.* A human decides whether the release happens, bumps the version
and tags it. If anything starts treating this cell as the approval itself, say so and stop.

## The report

Commit it to `docs/release-reviews/<name>.md`, then write `Release Review` and
`Release Verdict` **together, or neither**.

The report link is a **commit URL, never a branch URL** — a branch points at whatever the file
says today, so it cannot say what was true when the verdict was formed.

Every report carries: the reviewed commit; a statement that the trigger ordering is unresolved;
each gate with the evidence that settled it; every `Blocked` reason with its owner; findings
that are not blocking; and anything deliberately not done.

Where your own evidence is weaker than it looks — a cell you reconstructed, a check you could
not run — disclose it in the report rather than letting the verdict rest on it silently.

## Never

- **Never fix anything.** Not code, not docs, not a registry cell that looks wrong. What you
  find is a finding.
- **Never re-run QA.** Missing rows are a reason to block, not an invitation to test.
- **Never deploy and never cut a version.**
- **Never write `Astro Link`, `Staging Storybook` or `Production Storybook`.**
- **Never clear a component you cannot show was independently tested.** "It looks fine" is not
  a review.

## Open questions for a human

1. **Are these the seven gates?** They are reconstructed from precedent, not ratified. Gates
   4–7 in particular were each derived from a single review that happened to block on them.
2. **Is seven even right?** The number comes from the registry's field descriptions. Nothing
   states what the seven were meant to be, so the count matching is not evidence.
3. **What clears a stale review?** Gate 3 fails whenever anything moves under the component.
   For a component already `Released`, it is unclear whether that is a re-review, a re-test, or
   both.
4. **Who restarts a `Blocked` row?** Open question 7 in `docs/crew-spec.md` is unresolved, and
   this file assumes a human does it.
5. **`VERSIONING.md` is cited by the registry base and does not exist.** The relationship
   between a `Cleared` verdict and a version bump is undefined.
