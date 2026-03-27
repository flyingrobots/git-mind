# Documentation Map

This file defines which documents are canonical, which are transitional, and which are historical references.

Use it to avoid treating old planning artifacts as the active product story.

## Canonical Product Docs

These describe what Git Mind is now and how work should be judged:

- [README.md](../README.md) — current product summary
- [ROADMAP.md](../ROADMAP.md) — active Hills, supporting lanes, and playback cadence
- [Git Mind Product Frame](./design/git-mind.md) — IBM Design Thinking style product frame
- [Hill 1 Semantic Bootstrap Spec](./design/h1-semantic-bootstrap.md) — first executable Hill 1 slice
- [git-warp Upgrade Audit](./design/git-warp-upgrade-audit.md) — completed enabling cycle that revalidated the git-warp substrate before Hill 1 implementation
- [Git Mind North Star](./VISION_NORTH_STAR.md) — longer-form strategic articulation
- [ADR-0005](./adr/ADR-0005.md) — official planning and governance model
- [ADR-0006](./adr/ADR-0006.md) — official delivery cycle and tests-as-spec model

## Canonical Engineering Guardrails

These define constraints and contracts that remain in force:

- [GRAPH_SCHEMA.md](../GRAPH_SCHEMA.md) — graph contract
- [Architecture Laws](./ARCHITECTURE.md) — non-negotiable engineering laws
- [Review Rubric](./REVIEW_RUBRIC.md) — architectural review gates
- [Repo Fixture Strategy](./design/repo-fixture-strategy.md) — canonical repository-shaped test substrate strategy
- [ADRs](./adr/README.md) — durable architecture decisions
- [Contracts](./contracts/CLI_CONTRACTS.md) and related schemas — machine-facing contracts

## Transitional Docs

These are still useful, but they carry some older framing and should not be treated as the primary product narrative:

- [GUIDE.md](../GUIDE.md) — CLI and usage reference; still contains manual graph-authoring examples
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contributor workflow with current frame pointers added

## Historical Reference Docs

These should not drive planning or product identity without explicit review:

- [CHANGELOG.md](../CHANGELOG.md) — release history, not product strategy
- [TECH-PLAN.md](../TECH-PLAN.md) — deep technical artifact from an earlier planning era
- [Risk Register](./RISK_REGISTER.md) — bridge/platform-era risk control document
- [Risk Review Checklist](./RISK_REVIEW_CHECKLIST.md) — bridge/platform-era operating checklist
- [Strategic Conversation Summary](./notes/Git%20Mind%20Strategic%20Conversation%20Summary.md) — historical context
- [Dogfood Session](./notes/dogfood-session.md) — historical evidence, not current plan

## Practical Rule

When documents disagree:

1. trust the canonical product docs first
2. then trust canonical engineering guardrails
3. treat transitional docs as implementation help, not product truth
4. treat historical docs as reference only

## Planning Rule

GitHub issues are the execution backlog.

Hills and Playbacks live in:

- [ROADMAP.md](../ROADMAP.md)
- [Git Mind Product Frame](./design/git-mind.md)
- [ADR-0005](./adr/ADR-0005.md)

The execution cycle and tests-as-spec rules live in:

- [ADR-0006](./adr/ADR-0006.md)
- [Repo Fixture Strategy](./design/repo-fixture-strategy.md)

GitHub milestones are not the primary planning system for this repository.

## Contributor Rule

When planning work, start with:

1. sponsor user
2. jobs to be done
3. Hills
4. playback evidence

Do not start with architecture breadth, an old milestone, or a flat pile of backlog items.

When implementing substantial work, continue with:

1. explicit acceptance criteria
2. failing tests
3. shared repo fixtures where repository behavior matters
4. review-hygiene cleanup for stale threads and false positives before merge
5. playback evidence and README reality updates before cycle close
