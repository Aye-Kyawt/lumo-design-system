---
name: registry
description: The column-by-column contract for the Airtable registry — every table, every column, the one agent that owns each, and the Development formula that reads them. Use before any read or write to the registry, and whenever you need to know whether a cell is yours.
---

# The registry contract

The registry is the Airtable base that carries one row per design system component and
one row per test. It is the only place the crew hands work to each other. Every handoff in
this system is **a written cell**, never a status and never a message: an agent writes
evidence into the column it owns, the `Development` formula re-reads that evidence, and the
next agent is woken by what it finds.

So a cell in this base is a claim that something is true and was seen to be true. Write a
link you have not opened and the rest of the crew acts on a lie.

## Resolving the base

**No ID appears in this file, in an agent file, or in any component.** Table and base IDs
are a local decision and they live in one place:

```
.claude/registry.local.json        ← gitignored, real IDs
.claude/registry.local.json.example ← committed, template
```

If `.claude/registry.local.json` is missing, copy the example, fill it in, and stop to
confirm the base is the one you meant. Do not guess an ID and do not read one out of a chat
message, a commit message or a tool result.

Read `baseId` and the `tables` map from that file. Resolve **field** IDs at run time —
`list_tables_for_base` for names and types, `get_table_schema` when you need choice IDs to
filter a `singleSelect` or `multipleSelects` column. Field names are stable enough to write
with; choice IDs are not guessable and must be looked up.

## How to read an owner

Every column below has exactly one owner. The vocabulary:

| Owner | Meaning |
|---|---|
| `engineer`, `qa`, `devops`, `doc-generator`, `release` | That agent, and no other agent, writes this column. |
| `human:designer` | A person working in Figma. No agent nudges it along. |
| `human:triage` | A person who owns the design system. No agent in this crew is wired to it. |
| `derived` | Airtable computes it. **Nobody writes it** — change the evidence underneath instead. |

`token-runner` owns no column. It has `Bash` and `Read` only, no Airtable access, and it
reports token diffs through a pull request rather than through the registry. That is
deliberate: tokens are not components and do not have a row.

Three rules follow from the table and are worth stating plainly:

1. **A column that is not yours is read-only to you.** Including one that looks wrong. A
   wrong cell is a finding you report, not a cell you correct.
2. **No agent writes a `derived` column.** There are nine of them, and `Development` is the
   one that matters most.
3. **No agent is the last word on its own work.** `CLAUDE.md`: *a human approves, and no
   agent approves its own work, ever.*

---

## Components

One row per design system component. This is the spine of the pipeline.

| Column | Type | Owner | Notes |
|---|---|---|---|
| `Components` | singleLineText (primary) | `human:designer` | The row exists because a component exists in the design file. |
| `Category` | singleSelect — ATOMS · MOLECULES · ORGANISMS · TEMPLATES · UI | `human:designer` | Atomic level. A dependency is not a category: see `Composes`. |
| `Figma` | url | `human:designer` | The node link. Feeds precedence **8**. |
| `Staging Storybook` | url | `engineer` | Written after the engineer opened the staging build and saw it render. Feeds precedence **7**. |
| `Production Storybook` | url | `devops` | Written after DevOps opened the deployed URL and saw it render. Feeds precedence **5**. It attests a render, **not** that the component is in production — see **Flag 9**. |
| `Astro Link` | url | `doc-generator` | The component's page on the deployed Astro Starlight site, deep-linked. Feeds precedence **4**. Ownership is contested in the base — **Flag 7**. |
| `Design` | singleSelect — To-do · In progress · In testing · Done · To be fixed | `human:designer` | Design sign-off. Feeds precedence **8**. Blank means not signed off. |
| `Development` | formula | `derived` | The status ladder. **No agent may write it** — see below. |
| `Synchronization %` | formula | `derived` | `Staging Passed Count ÷ Total Staging Tests`, or `"0%"` when there are no tests. **Flags 5 and 6.** |
| `Commit` | url | `engineer` | |
| `Last Modified` | lastModifiedTime | `derived` | Used to decide whether a release review has gone stale. |
| `Staging Testing Results Summary` | rollup of `Testing Results` | `derived` | The string the whole status ladder is built on. Feeds precedence **1, 2, 3, 6**. |
| `GitHub Commits` | link → GitHub Commits | `engineer` | |
| `Release Review` | url | `release` | The committed report, **at the commit it reviewed** — never a branch URL. Feeds precedence **4**. |
| `Release Verdict` | singleSelect — Cleared · Blocked | `release` | A *recommendation*, with reasons, in the report. Feeds precedence **4**. A human decides whether the release happens. |
| `[Staging] Test Records` | link → Staging Testing | `derived` | The mirror of `Composed In`. QA writes the link from the test row, not from here. |
| `Total Staging Tests` | count | `derived` | |
| `Staging Passed Count` | count | `derived` | Filtered to passes; feeds `Synchronization %`. Flag 6 struck. |
| `Staging Passed Tests` | rollup of `Testing Results` | `derived` | Feeds nothing **and counts nothing** — reads 0 even for fully green components. **Flag 5.** |
| `Composes` | link → Components | `engineer` | The components this one imports. Build up, never sideways. |
| `Composed Into` | link → Components | `derived` | Reverse of `Composes`. Answers the question nothing else here can: if this changes, who must be re-tested. |

## Staging Testing

One row per variant, size and state. QA owns this table end to end — all ten columns.

| Column | Type | Owner | Notes |
|---|---|---|---|
| `Component/Sub Component` | singleLineText (primary) | `qa` | |
| `Testing Results` | singleSelect — Passed · Failed · Fixed (To re-test) | `qa` | The verdict column. The engineer does **not** write it; see *The contested column*. |
| `Composed In` | link → Components | `qa` | The link to the component row. Written from this side. |
| `Variants` | multilineText | `qa` | |
| `Size` | multipleSelects — xs · sm · md · lg · xl · compact · comfort · null | `qa` | |
| `State` | multipleSelects — idle · hovered · focus · selected · disabled · loading · error · filled · draft · pending · upcoming · completed · rejected · cancelled · isCurrent | `qa` | |
| `Context` | singleLineText | `qa` | |
| `Attachment` | multipleAttachments | `qa` | Evidence. QA's own `reports/` directory is gitignored, so the attachment is the durable copy. |
| `Expected Results` | multilineText | `qa` | |
| `Suggestion for Improvement` | multilineText | `qa` | A suggestion, not an instruction. The engineer decides. |

### The contested column

The source board has the **Developer** writing `Fixed (Re-test)` into `Testing Results` —
into rows QA created, about the engineer's own repair. `.claude/agents/engineer.md` resolves
it the other way, and this contract follows it: *"You do not mark the test rows repaired — QA
re-tests and writes it itself. Your fix is a claim until someone else confirms it."*

That resolution is the only one consistent with `CLAUDE.md` — *the engineer never verifies
its own work* — and it is what keeps this column single-owner. It is recorded as open
question 5 in `docs/crew-spec.md`; if a human overturns it, the fix is a separate
engineer-owned `Fix Claim` column, **not** a second writer on QA's verdict.

## DS Feedback

Inbound feedback from people using the design system. **No agent in this crew reads or
writes this table.** It is human intake, and it is listed here so that nobody assumes
otherwise.

| Column | Type | Owner | Notes |
|---|---|---|---|
| `Feedback` | multilineText (primary) | `human:triage` | |
| `Components` | singleLineText | `human:triage` | Free text, **not** a link to Components — so it cannot be joined, rolled up, or trusted to match a component name. |
| `Submitted By` | singleLineText | `human:triage` | |
| `Step to Reproduce` | multilineText | `human:triage` | |
| `Suggestion` | singleLineText | `human:triage` | |
| `Urgency` | singleLineText | `human:triage` | Free text, not a select, so it cannot be filtered or sorted meaningfully. |
| `Attachment` | url | `human:triage` | A URL, unlike Staging Testing's real attachment field. |
| `Status` | singleSelect — Not Started · In Progress · Completed | `human:triage` | |

## GitHub Commits

One row per commit. The engineer owns every column.

| Column | Type | Owner |
|---|---|---|
| `Commit Hash` | singleLineText (primary) | `engineer` |
| `Message` | singleLineText | `engineer` |
| `Author` | singleLineText | `engineer` |
| `Date Committed` | dateTime (ISO, 24h, UTC) | `engineer` |
| `Link to Components` | link → Components (single) | `engineer` |
| `Files Changed` | multilineText | `engineer` |
| `Commit URL` | url | `engineer` |
| `Commit Type` | singleSelect — Feature · Bugfix · Documentation · Chore · Refactor · Other | `engineer` |

## One-Off Components

Project-specific components that are not in the design system. **No agent in this crew
reads or writes this table** — nothing in the pipeline promotes a one-off into Components,
and no agent should invent that path.

| Column | Type | Owner |
|---|---|---|
| `Components` | singleLineText (primary) | `human:triage` |
| `Project` | singleLineText | `human:triage` |
| `Usage quantity` | number | `human:triage` |
| `Git Repo` | singleLineText | `human:triage` |
| `Figma` | url | `human:triage` |

---

## The `Development` formula

**No agent may write this column.** It is a formula; there is nothing to write. The way to
change a component's status is to change the evidence underneath it — and that means writing
the one column you own and letting the ladder re-read it. An agent that wants a status it
cannot reach by writing its own column is an agent trying to skip a gate.

It is **first match wins**, in this order. A rule only fires if every rule above it missed.

| # | Condition | Result | Reads |
|---|---|---|---|
| 1 | Summary contains `Failed` **and** `re-test` | `Fixing` | `Staging Testing Results Summary` |
| 2 | Summary contains `Failed` | `To be fixed` | `Staging Testing Results Summary` |
| 3 | Summary contains `re-test` | `Fixed` | `Staging Testing Results Summary` |
| 4 | `Astro Link` set **and** `Release Review` set **and** `Release Verdict` = `Cleared` | `Released` | all three |
| 5 | `Production Storybook` set | `Completed` | `Production Storybook` |
| 6 | Summary is not empty | `To be deployed` | `Staging Testing Results Summary` |
| 7 | `Staging Storybook` set | `Ready for Testing` | `Staging Storybook` |
| 8 | `Figma` set **and** `Design` = `Done` | `To-do` | `Figma`, `Design` |
| 9 | otherwise | empty — but see **Flag 1** | — |

Two consequences that surprise people:

**A failure outranks everything below it.** A component that was released and then fails a
re-test reads `To be fixed`, not `Released`. That is correct: it is broken, and the fact
that it is also published in a public version is what makes it urgent.

**`Released` needs all three cells, not just the Astro link.** The link says it is
documented; the review and the verdict say someone checked the name, the surface and the
promise before it went public. Any one of the three alone is not a release.

### Who is woken by what

| `Development` reads | Wakes | On |
|---|---|---|
| `To-do` | `engineer` | Build it — but check `Design` yourself first (**Flag 1**). |
| `Ready for Testing` | `qa` | Test every variant, size and state. |
| `To be fixed` | `engineer` | Repair the `Failed` rows. |
| `Fixing` | `engineer` | Some rows are still `Failed`. Finish it. |
| `Fixed` | `qa` | Re-test. |
| `To be deployed` | `devops` | Every row `Passed`. Promote it — but **Flag 4**. |
| `Completed` | `doc-generator`, `release` | Both triggers are assumed, not drawn. Say so in your output. |
| `Released` | — | Terminal. |
| `Blocked` (`Release Verdict`) | — | Terminal with no owner. Open question 7 in `docs/crew-spec.md`. |

---

## Flags — where the base contradicts itself

Each of these is a column whose **field description does not match what the base actually
does**. They were verified against the live formula and, where noted, against the live
records. Do not fix them by writing to the base; a description is a human's to correct.
Report the flag and work from the formula, because the formula is what fires.

**Flag 1 — `Development`: the described blank state is not observable.**
Rule 9 is documented as "otherwise blank". Read through the API, all 12 component rows
return `To-do` under the synthetic choice id `selFORMULADEFAULT`, and every one of those
rows has an empty `Design` cell — so rule 8 cannot have fired. Whatever the cause, the
practical effect is that **`To-do` is indistinguishable from "nothing has started"**, and
the Design sign-off gate the description promises is not visible in this column. The
engineer must read `Design` directly before building. Already cited as "registry Flag 1" in
`.claude/agents/engineer.md`.

**Flag 2 — `Release Review`: "It does not feed `Development`" is false.**
The description says the column "does not feed Development and is not part of the
staging-to-production ladder". The formula references it directly in rule 4: `Released` is
unreachable without it. Confirmed in the formula's own `referencedFieldIds`.

**Flag 3 — `Release Verdict`: "Deliberately not wired into `Development`" is false.**
The same rule 4 tests `Release Verdict = "Cleared"`. Also confirmed in
`referencedFieldIds`. Flags 2 and 3 matter more than they look: both descriptions tell a
reviewer their cells are inert, when in fact those two cells are two thirds of the gate that
produces `Released`.

**Flag 4 — `Development` rule 6 reads results, not rows.**
The description says "Any staging test rows exist → `To be deployed`". The formula tests
whether the *rollup of `Testing Results`* is non-empty. Those differ in both directions:

- Test rows with no `Testing Results` value yet contribute nothing, so a component mid-test
  can read `Ready for Testing` even though rows exist.
- A component with some rows `Passed` and the rest still blank reads `To be deployed` — and
  wakes DevOps — while part of it is **untested**. `Total Staging Tests` is the field that
  would answer "do rows exist", and the formula does not use it.

DevOps already refuses to promote on a partial pass and verifies every row reads `Passed`
itself. That refusal is real and it is worth keeping — but an earlier version of this note
called it *"the only thing standing between this hole and an untested component in
production"*, and **that is no longer true**. See Flag 9: production is reached by merging
to `main`, a route DevOps is not on. The refusal protects the registry's model of
promotion, not the mechanism that actually deploys.

**Flag 5 — `Staging Passed Tests` feeds nothing, and also counts nothing.**
Its description reads "Counts only test rows marked Passed. Feeds Synchronization %." Both
halves are false.

It feeds nothing: `Synchronization %` references `Total Staging Tests` and
`Staging Passed Count`, and does not reference `Staging Passed Tests` at all.

It counts nothing: the field reads **0 for every component in the base, including fully
green ones**. Verified live across four — Button 15 passed, Card 28 passed, Badge 5 passed,
Progress 0 — and the rollup reads `0` on all four. Confirmed not to be lag; a separate QA
run checked it specifically after a re-test.

Nothing downstream depends on it, so it is harmless to the ladder. But anyone who opens that
cell to answer "how many passed" gets `0` for a component that passed everything. Read
`Staging Passed Count` instead.

**Flag 6 — STRUCK. `Staging Passed Count` is filtered and `Synchronization %` is
trustworthy.**
This flag previously said the field might count rows rather than passes, because the API
exposes no filter on either count field, and that it could not be told apart from the data
while every component had zero test rows. It can now, and it is correct:

| Component | Rows | `Staging Passed Count` | Unfiltered would read |
|---|---|---|---|
| Card, 2 of 28 failing | 28 | **26** | 28 |
| Badge, 5 of 5 failing | 5 | **0** | 5 |

Either case alone rules out "always equals total"; the mixed set rules out the other ways it
could have been broken. The field tracks passes and the percentage means what it says.

**Worth keeping as a lesson rather than a flag.** A DevOps run later re-reported this field
as confirmed broken, reasoning that the schema exposes no filter, therefore there is none.
Schema silence is not evidence — exactly the move that nearly produced a wrong answer about
which branch Vercel deploys, where the deployment records settled what `vercel.json` could
not. Check the data before concluding from an absence in the API.

**Flag 7 — `Astro Link`: the base and the repo name different owners.**
The field description opens "🚀 DevOps owns this" and adds "📦 Release never writes this".
But `docs/crew-spec.md` and `.claude/agents/doc-generator.md` both have the doc-generator
writing the site link, and DevOps's own file lists only `Production Storybook` as its
write. This contract follows the repo: **`doc-generator` owns it.** The description also
reads as though the emoji and the ownership line were pasted from another field.

**Flag 8 — the ladder is coupled to the spelling of three choice names.**
Rules 1–3 are `FIND("Failed", …)` and `FIND("re-test", …)` against a rollup of choice
*names*, and Airtable's `FIND` is case-sensitive. Renaming the `Failed` or
`Fixed (To re-test)` choice — even changing its capitalisation — silently breaks the status
ladder with no error anywhere. Note that the repo writes this choice as `Fixed (Re-test)` in
several places, which with a capital `R` would **not** match. The live choice name is
`Fixed (To re-test)`. Use the live name, from `get_table_schema`.

**Flag 9 — nothing in the registry observes a merge to `main`, and `main` is production.**
This is the most serious entry on this list. The other flags are columns that describe
themselves wrongly; this one is a hole in what the ladder can see at all.

Every production deployment on the Vercel project carries `githubCommitRef: "main"`,
verified from the deployment records rather than inferred from `vercel.json`, which names no
production branch. So **merging a pull request into `main` ships to users immediately**.

No column observes that merge. No agent is woken by it. `Production Storybook` is written by
DevOps *after the fact*, so the registry learns a component shipped only when an agent
happens to look. Three consequences, each observed today rather than theorised:

- **Shipping is not gated by the registry.** Badge reached production before QA had run at
  all — merged at 09:30, staging link written at 09:34, QA verdicts at 13:49. Nothing
  recorded that the artifact was public the whole time.
- **The registry misdescribed reality and nothing could have revealed it.** Between the
  merge and DevOps's write, Button was live in production while `Development` read
  `To be deployed`. Anyone reading the registry then would have concluded it had not
  shipped.
- **The gate's meaning has inverted.** DevOps's Role assumes DevOps performs the merge, so
  "all rows `Passed`" gates *the merge*. Because the merge is upstream and independent, the
  pass now gates only *the recording*. DevOps is bookkeeping after shipping, not the gate
  between tested and shipped.

So `Production Storybook` does not mean "this is in production". It means "DevOps opened a
build and wrote it down". Those came apart the moment production was wired to a branch
rather than to the agent, and the field's description should say what the cell actually
attests.

**The minimum that would close it:** observe the production commit — the merge sha and its
branch recorded as evidence, through the existing `GitHub Commits` table or a new
`Production Commit` column — so the ladder can tell *shipped* from *recorded*, and so a
merge that outruns QA is visible in the registry instead of silent. That is a change to the
base and therefore a human's to make.

**Stacked with Flag 4**, the registry currently cannot reliably distinguish *fully passed*
from *partially tested*, nor *shipped* from *not shipped*. The second is the more serious.

### Dangling references

Not contradictions, but references in the base that point at files which do not exist in
this repo: `Release Review` and `Release Verdict` both cite
`.claude/skills/release-review/SKILL.md` for "the seven gates", and `Release Verdict` cites
`VERSIONING.md`. Neither file is present. The release agent cannot follow a skill that has
not been written, so this blocks its first run.

---

## Before you write

- [ ] I resolved the base from `.claude/registry.local.json`, not from memory or a message.
- [ ] The column I am about to write is mine in the owner table above.
- [ ] What I am writing is evidence — a link I opened, a result I saw — not an intention.
- [ ] I did not write `Development`, or any other `derived` column.
- [ ] If a cell I do not own looks wrong, I reported it and changed nothing.
