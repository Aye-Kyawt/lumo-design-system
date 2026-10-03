# Crew Evidence Loop — actor spec

Source: FigJam board [Crew Evidence Loop](https://www.figma.com/board/NJUJw4Y3Gc4GNvxmNgE64x/Crew-Evidence-Loop?node-id=2002-572), node `2002:572`.

**Provenance caveat.** This was read from the board's render at full resolution.
The structured FigJam MCP tool failed on this node (response truncated at
~35,000 characters, on two attempts), so nothing here came from the board's
underlying data. Anything placed outside node `2002:572`, or any text too small
to rasterise legibly, would not have been seen.

**Status: not yet agreed.** The ambiguities at the end are open questions, not
rhetorical ones. They are listed rather than resolved precisely because the crew
is to be minted in one pass — a quiet resolution here becomes four agents wrong
in the same direction.

---

## The substrate everything shares

Work is tracked in **Airtable**. The board shows two distinct shapes:

- A **Components** table — one record per component. Columns seen: `Figma`,
  `Staging Storybook`, `Production Storybook`, `Astro Site`, `Release Review`,
  `Release Verdict`, plus a `Development Status`.
- A **Staging Testing** table — **one record per variant, state, and prop**,
  with a `Testing Result` field.

The pattern repeated at every handoff is:

> an actor writes a **link or value** into a registry column → a **conditional
> formula** fires on that column → `Development Status` flips → a dashed
> **"Provoke"** line wakes the next actor.

**The status is never the handoff. The written cell is.**

---

## 1 · Client — Human

| | |
|---|---|
| **Reads** | Nothing shown on the board. |
| **Writes** | A `Prompt`, through a chat interface (Claude cowork / code). |
| **Hands off when** | No condition drawn. The prompt dashes into the Designer's Figma/FigJam surface. |
| **Refuses** | Not stated on the board. |

## 2 · Designer — Human

| | |
|---|---|
| **Reads** | The Client's prompt. |
| **Writes** | Tokens and Components in Figma/FigJam, then a **Figma node link** into the Components table `Figma` column. |
| **Tasks** | `1` design implementation · `2` design fix. |
| **Hands off when** | `Figma` column has a link → status **To-do** → provokes Developer. |
| **Refuses** | Not stated on the board. |

## 3 · Developer — Agent

Two distinct entry paths.

### Path A — "New"

| | |
|---|---|
| **Reads** | Figma / FigJam, via an AI IDE. |
| **Writes** | Tokens, Components, a Staging URL; branch → PR → merged into the **Git staging branch**; then the **staging link** into `Staging Storybook`. |
| **Hands off when** | `Staging Storybook` has a link → **Ready for testing** → provokes QA. |

### Path B — "Fix in staging"

| | |
|---|---|
| **Reads** | Figma **and Airtable Records** (QA's findings), via an AI IDE. |
| **Writes** | A new commit → PR → merged into the staging branch; updates `Testing Result` to **"Fixed (Re-test)"**. |
| **Hands off when** | Two formulas on the same column: **all** results marked `Fixed (Re-test)` → **Fixed**; **few** results marked, i.e. partially → **Fixing**. Both routes run back toward QA. |

**Tasks:** `1` Code Implementation · `2` Bug and Error Fixing from Staging ·
`2` *(sic — numbered 2 twice on the board)* Bug and Error Fixing from Production.

**Refuses:** Not stated on the board.

## 4 · QA — Agent

| | |
|---|---|
| **Reads** | The **Figma UI Kit** and the **Component Library Staging URL**. The board's wording is "Test against Figma UI Kit". |
| **Writes** | Records into the **Staging Testing** table — one record per variant, state, prop. |
| **Hands off when** | **One or more = "Failed"** → **To be fixed** → provokes Developer. **All = "Passed"** → **To be deployed** → provokes DevOps. |
| **Refuses** | Not stated on the board. |

**Tasks:** `1` Testing Outputs from Devs against Designer Outputs ·
`2` Testing Fixed Result from Devs again · `3` Testing TIP Fixed result from Devs again.

## 5 · DevOps — Agent

| | |
|---|---|
| **Reads** | The Component Library. |
| **Writes** | Merges **Git Staging → Main**; writes the **production link** into `Production Storybook`. Separately emits a **Design System VX.X.X**. |
| **Hands off when** | `Production Storybook` has a link → **Completed**. |
| **Second gate** | The versioned Design System is emitted only when `Component = "Completed"` **AND** `Release Verdict = "Cleared"`. |
| **Refuses** | Not stated on the board. |

## 6 · Doc-generator — Agent

| | |
|---|---|
| **Reads** | **Figma Documentation**, compared against the **Component Library repo**. |
| **Writes** | An intent record for each component, and the Astro site → `Astro Site` column. |
| **Skills** | **Component-Intent** (`use_when`, `dont_use_when`, `variant_intent`, `placement`, `pairs_with`, `required_tokens`, `any…`) and **Astro-Page**. |
| **Hands off when** | → **Released**. **No conditional formula is drawn on this edge.** |
| **Refuses** | Not stated on the board. |

## 7 · Release — Agent

| | |
|---|---|
| **Reads** | The Component Library repo. |
| **Writes** | A **Release Review Report** and a **Release Verdict** → the `Release Review` and `Release Verdict` columns. |
| **Skill** | **Release-review**. |
| **Hands off when** | On `result` → **Cleared** or **Blocked**. |
| **Refuses** | Not stated on the board. |

---

## Transition summary

| From | Written cell | Condition | Status | Wakes |
|---|---|---|---|---|
| Client | — | none drawn | — | Designer |
| Designer | `Figma` | link exists | To-do | Developer |
| Developer (new) | `Staging Storybook` | link exists | Ready for testing | QA |
| QA | Staging Testing records | one or more = "Failed" | To be fixed | Developer |
| QA | Staging Testing records | all = "Passed" | To be deployed | DevOps |
| Developer (fix) | `Testing Result` | all = "Fixed (Re-test)" | Fixed | QA |
| Developer (fix) | `Testing Result` | partially marked | Fixing | QA |
| DevOps | `Production Storybook` | link exists | Completed | Doc-generator / Release |
| Doc-generator | `Astro Site` | **none drawn** | Released | — |
| Release | `Release Verdict` | on result | Cleared / Blocked | DevOps (version gate) |

---

## The thing the board does not contain

**No actor on this board has a refusal.** There is not one "does not", "never",
or "refuses" annotation anywhere on it.

Four of the seven actors are agents to be minted from this. Refusals are exactly
the part that does not survive being guessed: a crew minted from this board as
drawn will have seven actors that each believe they may do anything they can
reach.

`CLAUDE.md` in this repo carries two — *the engineer builds and fixes, it never
verifies its own work*, and *QA tests and reports, it never repairs* — and the
board is consistent with both. But the board does not state them, and
`CLAUDE.md` says nothing about what DevOps, Doc-generator, Release, or the
Designer refuse to do.

---

## Ambiguities — open, deliberately unresolved

### Mechanism

1. **"Provoke" is undefined.** Is a status change an automation that wakes the
   next agent, or does a human run it? Who owns the trigger?
2. **"All = Passed" has no scope.** All records for that component? The rollup
   from N per-variant records to one component status is not drawn.
3. **The two tables are not linked.** Components ↔ Staging Testing — link field,
   rollup, or convention?
4. **`Development Status` may be more than one field.** To-do, Ready for
   testing, Fixed, Fixing, To be fixed, To be deployed, Completed and Released
   read as one column; Cleared and Blocked sit under a separate "Release
   Verdict" heading. Which values are mutually exclusive?

### Ownership

5. **The Developer writes into QA's table.** The Developer sets
   `Testing Result = "Fixed (Re-test)"` on records QA created. Is the engineer
   allowed to mark its own work fixed in the tester's own records?
6. **Who approves?** `CLAUDE.md` says a human approves and no agent approves its
   own work. The board has **Release — an Agent** — emitting Cleared/Blocked. Is
   Release the approval, or is there a human above it who is not drawn?
7. **Nothing owns "Blocked".** It is a terminal box with no outgoing arrow.

### Loops

8. **"Fixing" and "Fixed" both return to QA.** Does QA re-test a partially-fixed
   set, or wait for all-fixed? If it re-tests, what does it do with the rows
   still broken?
9. **Release and DevOps are circular with no entry.** The Design System gate
   needs `Release Verdict = "Cleared"`, so Release must run *before* DevOps
   finishes — but Release sits after DevOps on the board and is provoked from
   **Completed**.
10. **Doc-generator has neither an entry condition nor an exit formula.** Every
    other actor has one.
11. **No path back to the Designer.** The Designer has "Task 2 = design fix",
    but nothing on the board routes a QA or Release failure to a human designer.
12. **Production defects have no source.** The Developer has a task "Bug and
    Error Fixing from Production", but nothing on the board creates or routes a
    production defect.

### Wording

13. **The Developer has two "Task 2"s** — is the second meant to be Task 3?
14. **"TIP" in QA Task 3** is unexplained — acronym or typo?
15. **Component-Intent's last field is cut off**, reading `any…` — possibly
    `anatomy`. That list is the doc-generator's entire output contract.
16. **"UI Kit" vs the Designer's Figma file** — the same library, or a separate
    published UI Kit?
17. **"Git Staging → Main"** — PR, or direct push? (`CLAUDE.md` says main accepts
    PRs from staging only.)
18. **Is the Client in the loop after kickoff?** The prompt dashes toward the
    Designer and a second dashed line reaches the Developer's surface; whether
    the Client re-enters later is not drawn.
