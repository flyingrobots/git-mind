# git-warp Upgrade Audit

Status: draft for execution

Related:

- [ROADMAP.md](../../ROADMAP.md)
- [ADR-0005](../adr/ADR-0005.md)
- [ADR-0006](../adr/ADR-0006.md)
- [Repo Fixture Strategy](./repo-fixture-strategy.md)
- issue [#312](https://github.com/flyingrobots/git-mind/issues/312)

## Purpose

Define the next enabling cycle before major Hill 1 implementation:

> audit and upgrade Git Mind's `@git-stunts/git-warp` dependency so new Hill 1 work is not built on an outdated substrate by accident.

This is not a generic dependency bump.
It is a boundary audit plus upgrade cycle.

## Sponsor User

- A Git Mind maintainer extending the product who needs confidence that core graph, provenance, and time-travel behavior still behaves as Git Mind expects on a current git-warp version.

## Job To Be Done

- When I build new Git Mind behavior on top of git-warp, help me do it against a revalidated substrate with explicit compatibility evidence instead of stale assumptions.

## Context

Current local dependency state:

- declared in `package.json` as `^11.5.0`
- locked and installed at `11.5.0`

Live npm registry state checked on 2026-03-25:

- latest published `@git-stunts/git-warp` version: `14.16.2`

That means Git Mind is currently three major versions behind the latest published package.

This does not automatically mean "upgrade immediately no matter what."
It does mean Git Mind should not keep expanding Hill 1 behavior without auditing the real upgrade surface first.

## Why This Cycle Exists

The goal is explicitly **not** to build a lot of new behavior on top of git-warp right now.

The goal is:

- understand the dependency boundary Git Mind actually uses
- strengthen the tests around that boundary
- upgrade deliberately
- keep future Hill 1 work from inheriting avoidable substrate drift

## Observed Dependency Boundary

Based on current code inspection, Git Mind directly imports and depends on a relatively narrow but important git-warp surface.

### Direct Imports

From `@git-stunts/git-warp`, Git Mind currently imports:

- default export `WarpGraph`
- `GitGraphAdapter`
- `CONTENT_PROPERTY_KEY`

### Verified Graph Instance Methods Used In `src/`

Git Mind currently relies on these graph instance methods:

- `createPatch()`
- `hasNode()`
- `getNodeProps()`
- `getNodes()`
- `getEdges()`
- `getContentOid()`
- `getContent()`
- `materialize({ ceiling })`
- `observer(name, config)`
- `discoverTicks()`

### Verified Patch Methods Used In `src/`

Git Mind currently relies on these patch methods:

- `addNode()`
- `addEdge()`
- `removeEdge()`
- `setProperty()`
- `setEdgeProperty()`
- `attachContent()`
- `commit()`

### High-Risk Semantics

The upgrade should pay special attention to:

1. `WarpGraph.open(...)` and `GitGraphAdapter` initialization semantics
2. time-travel behavior of `materialize({ ceiling })`
3. observer/filter behavior via `graph.observer(...)`
4. content attachment and retrieval APIs
5. tick discovery / historical traversal assumptions
6. patch commit semantics and idempotency

## Known Mismatches Already Exposed

At least one contributor-facing document still says Git Mind depends on git-warp via a local path.

That no longer matches the actual package metadata and should be corrected as part of this cycle.

## Acceptance Criteria

This cycle succeeds when:

1. Git Mind's actual git-warp dependency surface is documented and reviewed.
2. Compatibility-sensitive behaviors are protected by tests.
3. The upgrade target version is chosen deliberately, not by vibes.
4. Git Mind installs and tests cleanly against the chosen upgraded version.
5. Docs reflect the real dependency model afterward.

## Execution Model

Per [ADR-0006](../adr/ADR-0006.md), this cycle should follow the normal design-to-test flow:

1. finalize the upgrade-audit design artifact
2. translate the risky boundary into failing tests
3. use shared repo fixtures where repository-shaped behavior matters
4. upgrade and implement until tests are green
5. run a playback / retrospective
6. update README and contributor docs if reality changed

## Recommended First Work Sequence

1. Inventory git-warp touchpoints in `src/` and relevant tests.
2. Add or strengthen tests around:
   - graph open/init
   - node/edge mutation
   - content attachment
   - time-travel / epoch behavior
   - observer behavior if still relevant
3. Review upstream changes between `11.5.0` and the candidate target.
4. Upgrade the dependency and lockfile on a dedicated branch.
5. Fix breakage explicitly rather than papering over it.

## Playback Questions

Use these questions for the cycle retrospective:

1. Did we actually reduce substrate risk, or just move version numbers?
2. Are the important git-warp assumptions now executable as tests?
3. Did the upgrade simplify or complicate future Hill 1 work?
4. Did we discover any Git Mind behavior that was depending on accidental substrate quirks?
5. What follow-on work should be backlogged before deeper Hill 1 implementation resumes?
