# Feature Profile: Review Refinement

Status: draft for Hill 1 and Hill 3 implementation

Related:

- [Git Mind Product Frame](../git-mind.md)
- [Hill 1 Semantic Bootstrap Spec](../h1-semantic-bootstrap.md)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer or agent refining inferred repository meaning.

Job to be done:

- When Git Mind suggests weak or uncertain relationships, help me accept,
  reject, or adjust them without rebuilding the map manually.

Hills:

- Hill 1: Semantic bootstrap.
- Hill 3: Living map with low manual upkeep.

Playback evidence:

- Low-confidence bootstrap output flows into `git mind review`, review decisions
  persist atomically, and future pending suggestions reflect those decisions.

## User Stories

- As a reviewer, I can accept a suggestion and promote its confidence.
- As a reviewer, I can reject a bad suggestion and stop seeing it as pending.
- As a reviewer, I can adjust type, rationale, or confidence in one operation.
- As an agent, I can batch accept or reject pending suggestions using JSON
  contracts.

## Requirements

### Functional

- Pending suggestions must be derived from low-confidence unreviewed edges.
- Review decisions must be stored as graph nodes with source, target, edge type,
  action, confidence, reviewer, rationale, and timestamp.
- Accept, reject, adjust, and batch operations must commit atomically.
- Review history must skip malformed decision nodes safely.
- JSON output must distinguish pending suggestions from review history.

### Non-Functional

- Review should refine the map, not require users to build it from scratch.
- Batch operations must be deterministic.
- Failed review operations must not leave partial graph state.

## Test Plan

Fixtures:

- `bootstrap-low-confidence`
- `reviewed-suggestions`
- `malformed-decisions`
- `batch-review`

Golden path:

- Accept promotes confidence and records decision.
- Reject removes or suppresses edge and records decision.
- Adjust changes edge type or properties and records decision in one patch.
- Batch accept/reject processes all pending suggestions deterministically.

Edge cases:

- Suggestion already reviewed.
- Edge removed between listing and review action.
- Adjustment changes type to an existing edge.
- Multiple pending suggestions for same source and target.

Known failures:

- Invalid review action fails.
- Invalid edge type fails before write.
- Malformed decision nodes are ignored in history, not fatal.
- Concurrent stale review attempts fail predictably.

Fuzz:

- Generate pending suggestions with random valid node IDs and edge types.
- Generate malformed decision nodes.
- Generate reviewer/rationale strings around size limits.

Stress:

- 10k pending suggestions.
- Batch review with many source/target collisions.
- Long review history over repeated bootstrap cycles.

Regression:

- Adjust remains single-patch atomic.
- Rejected suggestions do not reappear as unreviewed.
- Batch JSON contract stays schema-stable.
- Review history sorting remains deterministic.

Golden artifacts:

- Pending suggestions JSON.
- Review history JSON.
- Graph export after accept, reject, adjust, and batch flows.

Playback:

- A maintainer can review the weak parts of a bootstrap map in minutes and see
  the graph become more trustworthy rather than more cluttered.
