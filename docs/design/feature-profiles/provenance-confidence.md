# Feature Profile: Provenance And Confidence

Status: draft for Hill 1 and Hill 2 implementation

Related:

- [Hill 1 Semantic Bootstrap Spec](../h1-semantic-bootstrap.md)
- [Git Mind Product Frame](../git-mind.md)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer, reviewer, or agent deciding whether to trust an inferred
  relationship.

Job to be done:

- When Git Mind asserts a relationship, show me why it believes the assertion
  and how confident it is.

Hills:

- Hill 1: Semantic bootstrap.
- Hill 2: Queryable answers with receipts.

Playback evidence:

- Every inferred edge can be traced to source artifacts, extractor rule, evidence
  text or path, confidence band, and inference time.

## User Stories

- As a reviewer, I can reject low-confidence edges without losing the evidence
  that caused them.
- As an agent, I can choose different behavior for high, medium, and low
  confidence facts.
- As a maintainer, I can audit how a relationship changed over time.

## Requirements

### Functional

- Every inferred edge must carry a provenance envelope.
- Provenance must include `sourceKind`, `sourceRef`, `extractor`, `evidence`,
  and `inferredAt`.
- Confidence must be rule-derived in v0 and expose both a numeric score and a
  band where practical.
- Manual edges must remain distinguishable from inferred edges.
- Review decisions must be able to update confidence or mark an assertion as
  accepted/rejected.

### Non-Functional

- Provenance payloads must be compact enough for Git-backed storage.
- Evidence must avoid storing unnecessary large document excerpts.
- Confidence rules must be documented and deterministic.
- Schema changes must bump output contract versions.

## Confidence Bands

- High: explicit structured evidence, exact path match, or explicit
  relationship syntax.
- Medium: strong lexical evidence or unambiguous reference.
- Low: fuzzy association, weak convention, or ambiguous but plausible signal.

## Test Plan

Fixtures:

- `explicit-frontmatter`
- `markdown-path-reference`
- `ambiguous-reference`
- `reviewed-suggestions`

Golden path:

- Each inferred relationship includes required provenance fields.
- Confidence band matches extractor rule.
- JSON output exposes provenance and confidence consistently.
- Accepted review updates are reflected in later graph reads.

Edge cases:

- Multiple evidence sources for one relationship.
- Evidence text longer than storage limit.
- Relationship inferred by two extractors with different confidence.
- Manual edge overlaps inferred edge.

Known failures:

- Missing provenance rejects write or records a fatal invariant failure.
- Invalid confidence value fails validation.
- Evidence that points outside repo root is rejected.

Fuzz:

- Generate provenance envelopes with missing, wrong-type, and oversized fields.
- Generate confidence scores around band boundaries.
- Generate evidence spans with unusual characters.

Stress:

- 100k inferred relationships with provenance.
- Many-to-one evidence fan-in for a central module.
- Repeated review cycles over the same relationship.

Regression:

- Provenance survives export/import.
- Provenance survives time-travel materialization.
- Confidence is stable across repeated bootstrap runs.
- Reviewed low-confidence items do not reappear as new unrelated suggestions.

Golden artifacts:

- Provenance envelope samples.
- Confidence rules fixture table.
- Graph export with reviewed and unreviewed inferred edges.

Playback:

- The user can inspect one surprising relationship and answer: what produced
  this, what evidence supports it, and should I trust it?
