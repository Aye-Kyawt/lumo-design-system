---
name: release-review
description: The seven gates and six checks a shipped component is reviewed against before its name goes into a version, and how to write the report and the recommended verdict. Use when the registry wakes the release agent on `Completed`.
---

# The release review

> ## ⚠️ This file replaced a different set of seven gates
>
> Until 2026-10-17 this file held seven **evidence** gates, reconstructed from
> `.claude/agents/release.md` and from the six reviews written on 2026-10-15. They asked
> whether a QA pass existed, whether production served the reviewed commit, whether the test
> evidence was still current, whether a reference page existed, whether the registry named the
> right commit, whether `docs/<name>.md` still matched the code, and whether `Composes` was
> honest.
>
> The seven gates below are **content** gates. They are a different question: not "is there
> evidence for this component" but "is this component finished enough to put its name in a
> version". Both are reasonable; they do not overlap much.
>
> **Dropping the old seven was not reviewed by anyone.** They are listed in full under
> *What this replaced* so nothing is lost, and the old banner's warning still applies to this
> one: until a human who owns the design system ratifies this file, a review may cite it as
> *the current gates* and must not present them as settled. Say in the commit who ratified it.
>
> Open questions are at the end. **Owner: a human.**

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

## The seven gates

A gate establishes that the component is finished. **A gate you cannot evaluate is a failed
gate, not a skipped one** — say which, and why you could not evaluate it.

### 1. Intent is written

`src/components/<name>/<name>.intent.json` exists, parses, and was written from a Figma usage
region rather than invented. Read it against
`.claude/skills/component-intent/SKILL.md`.

Empty `use_when` and `dont_use_when` **with a matching entry in `gaps`** is an honest file and
a failed gate: the component is documented as undecided, and an undecided component is not
ready to have its name in a version. Empty with no gap recorded is worse — it means nobody
looked.

**Never write or edit this file.** **Owner of a failure:** `doc-generator` to transpose it;
`human:designer` if the usage region itself does not exist.

### 2. `Development` reads `Completed`

Read the registry row. `Development` is a formula and no agent writes it, so this gate is
really a check that the ladder underneath it is genuinely satisfied rather than that the cell
happens to display the word.

Read the linked Staging Testing rows directly, not `Synchronization %`. A blank `Testing
Results` counts toward `Total Staging Tests` and not toward `Staging Passed Count`, and the
ladder ignores blanks entirely (registry Flag 4) — so a row can read `Completed` with cases
nobody executed.

**Owner of a failure:** `qa` for blank rows; `devops` if `Production Storybook` is unset.

### 3. Tokens are clean

Every visual value in the component's CSS resolves to a semantic token. No raw hex, no raw px,
no raw font name, and no `--primitives-*` reached for directly — a component touching the base
layer has skipped the semantic token that should sit in front of it.

**Strip the comments before you grep.** This is not fussiness; a naive grep fails all nine
components today, and every hit is a false positive:

```
find src/components/<name> -name '*.css' ! -name '*.stories.css' -exec cat {} + \
  | perl -0pe 's{/\*.*?\*/}{}gs' \
  | grep -nE '#[0-9a-fA-F]{3,8}|[0-9]+px|var\(--primitives-'
```

Two exclusions, both load-bearing:

- **`*.stories.css`** — story scaffolding is not shipped, so a raw value there is not a gate
  failure.
- **comments** — this repo documents its design gaps *in the CSS*, by naming the raw number
  Figma used and then binding a semantic token instead. `switch.css` says "the node's 40px track
  width binds no variable" and then writes
  `--lumo-switch-track-width: var(--size-control-md)`. The sentence is the record that the gap
  was raised; the declaration is the component being clean. A grep that reads the comment blocks
  the component for the one thing it did right.

Run it with the comments stripped and all nine components return zero today. A hit after
stripping is a real failure, even when it looks harmless. A component with no such comments and
no hits is also clean — the absence of the documentation is a gate 6 question, not this one.

**Owner of a failure:** `engineer`.

### 4. The public surface is decided

The component's place in `src/index.ts` is deliberate and recorded. Either it is exported and
`docs/public-api.md` says why, or it is internal and `docs/public-api.md` says why.

A component that is neither — absent from `src/index.ts` and unmentioned in the record — has
not had the decision made, and shipping it leaves consumers unable to tell whether importing it
is supported. Subcomponents are expected to be internal; what this gate wants is the decision
written down, not a particular answer.

**This gate cannot be evaluated yet.** Both files it depends on exist only as uncommitted
changes in one working tree — neither `src/index.ts` nor `docs/public-api.md` is present on
`origin/main` or on `origin/astro`. Until that work lands, say in the report that the gate could
not be evaluated and why, rather than failing the component for a decision somebody has in fact
made but not merged. Re-check before relying on this paragraph; it stops being true the moment
that branch merges.

**Owner of a failure:** `engineer`.

### 5. Names are final

Prop names match the Figma property names exactly, per `CLAUDE.md`. Where they cannot — a
reserved word, a collision with a DOM attribute — the divergence is recorded in
`docs/naming-conflicts.md`, which `CLAUDE.md` requires.

An undocumented divergence fails this gate. Renaming a prop after release is a breaking change,
so this is the last moment it is free.

**Owner of a failure:** `engineer`.

### 6. States are complete

Every interaction state the product uses is implemented, has a story, and is behaviour rather
than a class that changes colour: default, hovered, pressed, focused, disabled, error, loading,
as applicable.

"As applicable" is decided by the design, not by convenience. A state the Figma set does not
define is a design gap and belongs in `docs/<name>.md` — a gap recorded there is a pass on this
gate, because the absence was raised rather than papered over. A state the set *does* define
and the code does not implement is a failure.

**Owner of a failure:** `engineer` to implement; `human:designer` if the set never defined it.

### 7. The version's meaning is known

There is a written answer to "what does the number this component is about to enter mean", and
to what a consumer may rely on at that number.

**This gate fails today, for every component.** The repo carries no `VERSIONING.md`, no
`CHANGELOG`, and no git tags; `package.json` reads `0.1.0`, `private: true`, and
`docs-site/src/releaseInfo.ts` records `tagged = false` precisely so the site does not imply a
release nobody cut. Until a human writes what the versioning scheme is, no review can establish
this, and every review must say so rather than passing it quietly.

Do not resolve it by choosing a scheme. **Owner of a failure:** a human.

## The six checks

A check reads the intent file's **content**. Checks produce findings; findings are reported in
full whether or not they block.

**Check 2 is a warning and never a blocker.** The other five block when they fail.

| # | Check | What it establishes | Blocks? |
|---|---|---|---|
| 1 | **Fields present** | Every field in the schema exists, with the right type. An absent field is not the same as an empty one | yes |
| 2 | **Every `dont_use_when` names an alternative** | A prohibition sends the reader somewhere. Where the usage region named no alternative and the file records that, it is still a warning — the gap is the designer's, not the file's | **no — warning only** |
| 3 | **`a11y` is specific, not generic** | Each fact is about *this* component and cites the line that makes it true. "Is accessible", "supports screen readers", "follows WCAG" are generic and fail: they would be equally true of any component, so they carry no information and cannot be checked | yes |
| 4 | **`required_tokens` resolve in the built output** | Run `npm run build:tokens`, then confirm every name is declared in `build/css/web/tokens.css` or `tokens-dark.css`. A token that resolves in the source and not in the build is a component that renders unstyled in production | yes |
| 5 | **All variants covered** | Every variant property and value in the code appears in `variant_intent`. A value with a `null` meaning and a recorded gap is covered; a value simply absent is not | yes |
| 6 | **No two components claim the same job** | Read this component's `use_when` against every other `*.intent.json`. Two components whose `use_when` cannot be told apart means a consumer cannot choose between them, and one of them is probably the other's variant | yes |

Check 6 is the only one that needs the whole set. Say in the report how many intent files existed
when you ran it — a uniqueness check across three files is weaker evidence than one across all
nine, and the report should not imply otherwise.

## Forming the verdict

`Cleared` or `Blocked`, and the reasons are the review. A bare `Blocked` is an obstruction
rather than a review; a bare `Cleared` is worse, because it will be acted on.

- Any failed gate → `Blocked`, naming the gate and the agent that owns the fix.
- Any failed check except 2 → `Blocked`, naming the check.
- A failed check 2 → a warning in the report. It never changes the verdict.
- Every gate and check passed → `Cleared`, which recommends release and **is not** an approval.
- A finding that fails nothing still goes in the report. Do not inflate it into a block, and do
  not drop it.

**Your `Cleared` is a reading of the evidence.** `CLAUDE.md`: *a human approves, and no agent
approves its own work, ever.* A human decides whether the release happens, bumps the version
and tags it. If anything starts treating this cell as the approval itself, say so and stop.

Given gate 7, expect `Blocked` to be the honest verdict for every component until a human writes
the versioning scheme. Do not let that pressure the other gates into leniency, and do not drop
gate 7 to produce a verdict that looks more useful.

## The report

Commit it to `docs/release-reviews/<name>.md`, then write `Release Review` and
`Release Verdict` **together, or neither**.

The report link is a **commit URL, never a branch URL** — a branch points at whatever the file
says today, so it cannot say what was true when the verdict was formed.

Every report carries: the reviewed commit; a statement that the trigger ordering is unresolved;
a note that these gates are not ratified; each gate and each check with the evidence that
settled it; every `Blocked` reason with its owner; warnings and non-blocking findings; how many
intent files check 6 compared; and anything deliberately not done.

Where your own evidence is weaker than it looks — a cell you reconstructed, a check you could
not run — disclose it in the report rather than letting the verdict rest on it silently.

## Never

- **Never edit an intent file.** Not a typo, not a missing alternative, not an empty field.
  What you find is a finding. This is the one prohibition most likely to feel wrong in the
  moment: the fix is often one line, and making it would destroy the only independent read of
  that file.
- **Never fix anything else either.** Not code, not docs, not a registry cell that looks wrong.
- **Never publish.** No deploy, no version, no tag, no `npm publish`.
- **Never re-run QA.** Missing rows are a reason to block, not an invitation to test.
- **Never write `Astro Link`, `Staging Storybook` or `Production Storybook`.**
- **Never resolve gate 7 by picking a versioning scheme.**
- **Never clear a component you cannot show was independently tested.** "It looks fine" is not
  a review.

## What this replaced

The seven **evidence** gates this file held until 2026-10-17, kept so that dropping them stays
a visible decision. Each was derived from `.claude/agents/release.md` and from the six reviews
of 2026-10-15.

| # | Gate | Still covered? |
|---|---|---|
| 1 | A QA pass exists, and was not re-run | partly — gate 2 reads the rows |
| 2 | Production serves the code that was reviewed | **no** |
| 3 | The test evidence is current (`git log <sha>..origin/main -- src/components/<name>/`) | **no** |
| 4 | A reference page exists at `Astro Link`, carrying intent | partly — gate 1 reads the intent file, not the page |
| 5 | The registry row names the right commit | **no** |
| 6 | `docs/<name>.md` still matches the code | **no** |
| 7 | `Composes` is honest | **no** |

Five of the seven are now unchecked by anything. In particular nothing in the current set
establishes that **production serves the reviewed commit**, or that the test evidence has not
gone stale — both of which a previous review actually blocked on. Treat that as the first open
question, not as a tidy outcome.

## Open questions for a human

1. **Should the two sets be merged?** The content gates below and the evidence gates above ask
   different questions and a release arguably needs both. Nobody has decided; this file was
   replaced, not reconciled.
2. **Are these the seven gates?** Not ratified. The registry base and `.claude/agents/release.md`
   refer to "the seven gates in this file" without ever defining them, so a count of seven
   matching is not evidence of agreement.
3. **What does the version mean?** Gate 7 cannot pass until this is written. `VERSIONING.md` is
   cited by the registry base and does not exist.
4. **What clears a stale review?** The dropped gate 3 failed whenever anything moved under the
   component. For a component already `Released`, it is unclear whether that is a re-review, a
   re-test, or both.
5. **Who restarts a `Blocked` row?** Open question 7 in `docs/crew-spec.md` is unresolved, and
   this file assumes a human does it.
