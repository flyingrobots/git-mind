# Feature Profile: Doctor And Integrity

Status: active supporting-lane profile

Related:

- [Architecture Laws](../../ARCHITECTURE.md)
- [Review Rubric](../../REVIEW_RUBRIC.md)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer or agent deciding whether graph state can be trusted.

Job to be done:

- When graph state looks suspicious, diagnose integrity problems and safely fix
  repairable issues.

Hill or lane:

- Supporting lane: foundation.
- Supports all Hills by protecting trust.

Playback evidence:

- `git mind doctor` identifies dangling edges, malformed metadata, and repairable
  graph issues without damaging valid state.

## User Stories

- As a maintainer, I can run doctor and know if the graph is healthy.
- As an agent, I can run doctor in JSON mode before trusting a repo map.
- As a maintainer, I can apply safe fixes with `--fix`.

## Requirements

### Functional

- Detect dangling edges, malformed system nodes, invalid confidence values,
  orphaned nodes, and schema-like property issues where possible.
- `--fix` must only repair issues with deterministic safe remediation.
- JSON output must list issue type, severity, affected nodes/edges, and fix
  status.
- Doctor must respect time-travel and observer contexts where meaningful.

### Non-Functional

- No destructive repair without explicit `--fix`.
- Doctor must never hide unfixable issues.
- Repair operations must be atomic.

## Test Plan

Fixtures:

- `healthy-graph`
- `dangling-edges`
- `malformed-system-nodes`
- `invalid-confidence`
- `large-corrupt-graph`

Golden path:

- Healthy graph reports clean.
- Dangling edge is detected.
- `--fix` removes repairable dangling edge.
- JSON output validates against schema.

Edge cases:

- Orphan nodes that are valid standalone entities.
- Malformed decision nodes.
- Historical graph with issues not present at HEAD.
- Observer-filtered graph hiding one endpoint.

Known failures:

- Unfixable issue remains and reports `fixed: false`.
- Invalid graph storage fails with typed error.
- Repair conflict fails without partial commit.

Fuzz:

- Generate malformed node properties.
- Generate random edge endpoint deletion.
- Generate invalid confidence values and timestamps.

Stress:

- 100k edges with 10k dangling references.
- Large graph doctor run under memory bound.
- Repeated doctor/fix loop idempotency.

Regression:

- `--fix` skips non-fixable issues.
- Doctor JSON contract remains stable.
- Repair commits do not remove valid edges.

Golden artifacts:

- Doctor JSON snapshots for each issue type.
- Before/after graph exports for fixable issues.

Playback:

- A user can decide whether the semantic map is trustworthy before relying on
  query answers or bootstrap output.
