# git-warp Upgrade Audit

Status: completed. The original 14.x audit ran on
`feat/git-warp-upgrade-audit`; the v17 continuation completed in issue
[#320](https://github.com/flyingrobots/git-mind/issues/320) and PR
[#321](https://github.com/flyingrobots/git-mind/pull/321).

Related:

- [ROADMAP.md](../../ROADMAP.md)
- [ADR-0005](../adr/ADR-0005.md)
- [ADR-0006](../adr/ADR-0006.md)
- [Repo Fixture Strategy](./repo-fixture-strategy.md)
- issue [#312](https://github.com/flyingrobots/git-mind/issues/312)
- issue [#320](https://github.com/flyingrobots/git-mind/issues/320)

## Purpose

Record the completed enabling cycle before major Hill 1 implementation:

> audit and upgrade Git Mind's `@git-stunts/git-warp` dependency so new Hill 1 work is not built on an outdated substrate by accident.

This was not a generic dependency bump.
It was a boundary audit plus upgrade cycle.

## Sponsor User

- A Git Mind maintainer extending the product who needs confidence that core graph, provenance, and time-travel behavior still behaves as Git Mind expects on a current git-warp version.

## Job To Be Done

- When I build new Git Mind behavior on top of git-warp, help me do it against a revalidated substrate with explicit compatibility evidence instead of stale assumptions.

## Context

Cycle starting state:

- declared in `package.json` as `^11.5.0`
- locked and installed at `11.5.0`

Live npm registry state checked on 2026-03-25:

- latest published `@git-stunts/git-warp` version: `14.16.2`

Chosen upgrade target for this cycle:

- `14.16.2`

That means this cycle upgrades Git Mind across three major versions of the substrate.

This does not automatically mean "upgrade immediately no matter what."
It does mean Git Mind should not keep expanding Hill 1 behavior without auditing the real upgrade surface first.

## 2026-05-31 v17 Continuation

The original audit cycle moved Git Mind to the 14.x substrate. The follow-on
modernization moved Git Mind to:

- `@git-stunts/git-warp`: `17.0.0`
- `@git-stunts/plumbing`: `3.0.3`

`@git-stunts/git-warp@17.0.0` depends on `@git-stunts/plumbing@^3.0.3`, so the
upgrade moved those packages together.

The completed pass kept the upgrade sequence explicit:

1. freeze a sanitized Git-native fixture from the current v5 / git-warp 14 state
2. include only `HEAD` and the relevant `refs/warp/gitmind/*` graph refs
3. test that fixture in Docker without mounting this checkout into the container
4. pack the current Git Mind package and copy it into the Docker context
5. run graph/status/export assertions with a scrubbed home and Git config
6. upgrade to git-warp 17 / plumbing 3 and prove the migrated fixture still
   reads

This fixture is intentionally a Git bundle rather than a raw working-directory
archive. It preserves the exact Git object and WARP ref state under test while
excluding `node_modules`, local Git config, remotes, hooks, reflogs, stash state,
and host-specific paths.

Related issue: [#320](https://github.com/flyingrobots/git-mind/issues/320)

The local playback command for this safety rail remains:

```bash
npm run test:upgrade-fixture
```

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

This cycle exposed one concrete runtime compatibility change:

- `graph.getNodeProps()` now returns plain objects rather than `Map` instances

Git Mind must treat node property bags as a compatibility boundary rather than assuming a single container shape.

This cycle also started with contributor-facing docs that still claimed git-warp
was installed via local path. Those docs were corrected as part of the upgrade.

## Acceptance Criteria

This cycle succeeded when:

1. Git Mind's actual git-warp dependency surface is documented and reviewed.
2. Compatibility-sensitive behaviors are protected by tests.
3. The upgrade target version is chosen deliberately, not by vibes.
4. Git Mind installs and tests cleanly against the chosen upgraded version.
5. Docs reflect the real dependency model afterward.

## Execution Model

Per [ADR-0006](../adr/ADR-0006.md), this cycle followed the normal
design-to-test flow:

1. finalize the upgrade-audit design artifact
2. translate the risky boundary into failing tests
3. use shared repo fixtures where repository-shaped behavior matters
4. upgrade and implement until tests are green
5. run a playback / retrospective
6. update README and contributor docs if reality changed

## Executed Work Sequence

1. Inventory git-warp touchpoints in `src/` and relevant tests.
2. Add or strengthen tests around:
   - graph open/init
   - node/edge mutation
   - content attachment
   - time-travel / epoch behavior
   - observer behavior if still relevant
3. Review upstream changes between `11.5.0`, `14.16.2`, and `17.0.0`.
4. Upgrade the dependency and lockfile on dedicated branches.
5. Fix breakage explicitly rather than papering over it.

## Playback Questions

Use these questions for the cycle retrospective:

1. Did we actually reduce substrate risk, or just move version numbers?
2. Are the important git-warp assumptions now executable as tests?
3. Did the upgrade simplify or complicate future Hill 1 work?
4. Did we discover any Git Mind behavior that was depending on accidental substrate quirks?
5. What follow-on work should be backlogged before deeper Hill 1 implementation resumes?
