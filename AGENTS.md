# Agent instructions

## Decision log

- **Before editing:** read `docs/decisions/README.md` and the entries relevant to the work. If an accepted decision conflicts with the task, flag the conflict; never silently reverse it.
- **When to log:** one record when a change makes a choice a future maintainer needs explained: architecture, a dependency or provider, a public API or data format, a migration or deployment strategy, or a lasting change to security, privacy or cost. Skip routine fixes, formatting and refactors that change no behaviour or constraint. Explain why, not what changed line by line.
- **Where:** `docs/decisions/`, one file per decision, `NNNN-short-kebab-case-title.md`; add a linked row (ID, title, status) to `docs/decisions/README.md`. Put the entry in the same PR as the change, or in the proposal PR if the choice is still open.
- **Status:** Accepted only when the decision was actually approved; otherwise Proposed. Never invent approval, rationale, benchmarks or test results.
- **Length:** 80–150 words: what forced the choice, what was chosen, a credible alternative and why it lost, the trade-off we now own, and what would make us revisit. Link the PR, issue, tests or code. Never include secrets or private data.
- **History:** replacing an accepted decision means a new record; link both ways and mark the old one Superseded in its file and the index, keeping its reasoning intact.
- **Hand-off:** name the record in the PR or final summary, or say "Decision record: not needed".

Template:

```
# NNNN: <decision stated in plain language>
- Date: YYYY-MM-DD
- Status: Proposed
- Related: <PR, issue, or repository path>

**Context:** <What problem or constraint forced a choice?>
**Decision:** <What are we doing and why? Which alternative did we reject, and why?>
**Consequences:** <What gets better? What does this cost or make harder?>
**Revisit when:** <What concrete change would justify reconsidering?>
```
