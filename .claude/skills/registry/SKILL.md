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
| `Production Storybook` | url | `devops` | Written after DevOps opened the deployed URL and saw it render. Feeds precedence **5**. |
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
| `Staging Passed Count` | count | `derived` | Feeds `Synchronization %`. **Flag 6.** |
| `Staging Passed Tests` | rollup of `Testing Results` | `derived` | Feeds nothing. **Flag 5.** |
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
itself. That refusal is not a nicety; **it is the only thing standing between this hole and
an untested component in production.**

**Flag 5 — `Staging Passed Tests` claims to feed `Synchronization %`, and does not.**
Its description reads "Counts only test rows marked Passed. Feeds Synchronization %."
`Synchronization %` references `Total Staging Tests` and `Staging Passed Count`. It does not
reference `Staging Passed Tests` at all, which currently feeds nothing.

**Flag 6 — `Staging Passed Count` may not count only passes.**
It is a `count` over the same link field as `Total Staging Tests`, and the API exposes no
filter on either. If it is in fact unfiltered, `Synchronization %` is structurally 100%
whenever any test row exists, and is therefore meaningless. **This one is unverified**: all
12 components have zero test rows today, so every row reads `0` and `0%` and the two counts
cannot be told apart from the data. Check the filter in the Airtable UI before trusting that
percentage, or before putting it on a dashboard.

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
