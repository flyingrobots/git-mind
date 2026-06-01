# Git Mind Feature Profiles

Status: draft planning set for issue #322

This directory breaks the Git Mind product surface into feature profiles. Each
profile uses the same IBM Design Thinking frame:

- sponsor user
- job to be done
- relevant Hill or supporting lane
- user stories
- requirements
- playback evidence
- test plan

The intent is to keep future implementation work from starting as an
architecture exercise. A feature is ready to implement only when the profile can
explain who it helps, what repository-understanding job it improves, and which
tests prove the claim.

## Sponsor User

The shared sponsor user for this profile set is a technical lead, staff
engineer, architect, or autonomous coding agent entering an unfamiliar
repository and needing a trustworthy semantic map quickly.

## Product Hills

- Hill 1: Zero-input semantic bootstrap
- Hill 2: Queryable answers with receipts
- Hill 3: Living map with low manual upkeep

Supporting lanes exist to strengthen those Hills. They are not product centers
by themselves.

## Profile Catalog

### Hill 1: Semantic Bootstrap

- [Bootstrap Command](./bootstrap-command.md)
- [Repo Fixture Builder](./repo-fixture-builder.md)
- [Artifact Inventory](./artifact-inventory.md)
- [Entity Extraction](./entity-extraction.md)
- [Relationship Inference](./relationship-inference.md)
- [Provenance And Confidence](./provenance-confidence.md)
- [Review Refinement](./review-refinement.md)

### Hill 2: Queryable Answers With Receipts

- [Query Receipts](./query-receipts.md)
- [Views And Lenses](./views-lenses.md)
- [Time Travel And Semantic Diff](./time-travel-diff.md)
- [Import Export Interchange](./import-export-interchange.md)
- [Agent Contracts](./agent-contracts.md)

### Hill 3: Living Map With Low Manual Upkeep

- [Living Map Updates](./living-map-updates.md)
- [Doctor And Integrity](./doctor-integrity.md)
- [Trust And Observer Contexts](./trust-observers.md)

### Supporting Lanes

- [Graph Substrate](./graph-substrate.md)
- [Content On Node](./content-on-node.md)
- [Extensions Runtime](./extensions-runtime.md)
- [Packaging And Adoption](./packaging-adoption.md)

## Common Test Plan Taxonomy

Each profile should name tests in these buckets.

- Fixtures: repository or graph shapes needed to test the feature.
- Golden path: expected behavior on representative clean inputs.
- Edge cases: valid but tricky inputs.
- Known failures: invalid inputs, ambiguity, missing dependencies, or blocked
  features that must fail predictably.
- Regression cases: bugs or review findings that must not return.
- Fuzz cases: generated or randomized inputs that probe parser, scanner, or
  graph assumptions.
- Stress cases: large or deep scenarios that protect performance and memory
  behavior.
- Golden artifacts: stable snapshots, schema samples, or CLI output contracts
  that can be compared over time.
- Playback evidence: the human or agent demonstration that proves the Hill
  moved, not just that code ran.

## Fixture Strategy

Repository-shaped behavior should use the canonical fixture strategy:

1. fluent repo builder first
2. reusable base repos second
3. scenario overlays for history, ambiguity, and references
4. archived snapshots only when exact Git object state is the subject

Feature profiles may request new base repos or overlays. They should not
invent one-off setup patterns unless the risk is truly local to the test.

## Implementation Sequencing

The recommended next implementation sequence remains:

1. Bootstrap command contract and JSON output
2. Fixture builder support needed by bootstrap tests
3. Artifact inventory
4. Entity extraction
5. Relationship inference
6. Provenance and confidence surfacing
7. Review refinement and query receipts

That sequence keeps Hill 1 executable before expanding into richer query and
living-map work.

## Review Rule

When a feature profile and implementation disagree, update the profile or stop
the implementation. Silent divergence is product debt.
