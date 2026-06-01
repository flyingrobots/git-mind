# Feature Profile: Living Map Updates

Status: future Hill 3 profile

Related:

- [Git Mind Product Frame](../git-mind.md)
- [ROADMAP.md](../../../ROADMAP.md)

## IBM Design Thinking Frame

Sponsor user:

- A team or agent workflow that wants the semantic map to stay useful as the
  repository changes.

Job to be done:

- When repo artifacts evolve, update the semantic map and surface reviewable
  semantic deltas without making me maintain a second wiki.

Hill:

- Hill 3: Living map with low manual upkeep.

Playback evidence:

- New commits produce semantic deltas, confidence updates, and reviewable
  suggestions rather than leaving the map stale.

## User Stories

- As a maintainer, I can refresh the map after changes and see what changed.
- As an agent, I can identify semantic drift before editing related files.
- As a reviewer, I can review new low-confidence updates after a PR.

## Requirements

### Functional

- Detect changed artifacts since a prior bootstrap or commit.
- Re-run relevant extractors incrementally where possible.
- Add, update, or deprecate inferred relationships with provenance.
- Surface semantic deltas for review.
- Track last-seen metadata for inferred entities and relationships.

### Non-Functional

- Upkeep cost must stay low.
- Incremental updates must be deterministic.
- Stale inferred facts must not silently masquerade as current truth.

## Test Plan

Fixtures:

- `living-map-base`
- `artifact-renamed`
- `doc-updated`
- `relationship-obsoleted`
- `branching-evolution`

Golden path:

- Change a doc reference and map update changes relationship provenance.
- Rename a file and map update records replacement or stale relationship policy.
- New commit touching a file creates or updates `touches`.
- Removed evidence lowers confidence or marks inferred edge stale by policy.

Edge cases:

- File renamed and edited.
- Commit reverts prior evidence.
- Branch merge introduces conflicting inferred relationships.
- Manual review decision exists for an edge now inferred again.

Known failures:

- Missing prior state fails with bootstrap-required message.
- Uncommitted work policy is explicit.
- Stale relationship handling is explicit and tested.

Fuzz:

- Generate sequences of file edits, renames, and deletes.
- Generate alternating evidence and evidence removal.
- Generate random update order and assert deterministic graph state.

Stress:

- Incremental update across 10k changed files.
- Long-lived repo with many stale inferred facts.
- Parallel update attempts fail or serialize predictably.

Regression:

- Reviewed decisions are not overwritten silently.
- Stale facts remain inspectable.
- No duplicate inferred relationships across refresh cycles.

Golden artifacts:

- Semantic delta JSON.
- Graph export before and after update.
- Stale fact policy examples.

Playback:

- The map evolves alongside the repo and exposes what needs review, rather than
  decaying into a stale knowledge base.
