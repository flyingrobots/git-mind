# Feature Profile: Query Receipts

Status: draft for Hill 2 implementation

Related:

- [Git Mind Product Frame](../git-mind.md)
- [ROADMAP.md](../../../ROADMAP.md)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer, reviewer, or agent asking a concrete repository question.

Job to be done:

- When I ask what implements, explains, blocks, or changed an artifact, give me
  an answer backed by graph facts, provenance, confidence, and history.

Hill:

- Hill 2: Queryable answers with receipts.

Playback evidence:

- A user asks a small set of day-one questions and receives answers with
  machine-readable receipts instead of only graph dumps.

## User Stories

- As a maintainer, I can ask what implements a spec and see the file/module
  evidence.
- As a reviewer, I can ask what ADR explains a module and see the source
  relationship and confidence.
- As an agent, I can consume answer JSON that cites graph edges, provenance, and
  relevant commit history.
- As a skeptical user, I can distinguish direct graph evidence from inferred or
  low-confidence evidence.

## Requirements

### Functional

- Define an initial question set tied to real repository-understanding jobs.
- Return answer payloads that include answer items, receipts, confidence,
  provenance, and graph refs.
- Support JSON output first; human output can be terse but must cite receipts.
- Handle no-answer and low-confidence-answer cases explicitly.
- Reuse existing views, diff, provenance, and node/edge APIs rather than
  inventing a second query substrate.

### Non-Functional

- Answers must be inspectable, not magical.
- Query contracts must be schema-versioned.
- The first question set should be narrow and excellent.
- Query runtime must be bounded on medium graphs.

## Initial Question Set

- What implements this spec?
- What docs or ADRs explain this module or file?
- What changed semantically in this area?
- What is blocked by this task?
- What issue or PR references shaped this path?
- What weak or missing connections should I review?

## Test Plan

Fixtures:

- `query-receipts-service`: known docs, ADRs, specs, files, and commits.
- `low-confidence-map`: same graph with mixed confidence edges.
- `no-answer-map`: valid graph with missing relationships.
- `history-shaped`: graph with semantic changes across refs.

Golden path:

- Query returns direct answer with receipt edge IDs and provenance.
- Query returns inferred answer with confidence and evidence.
- Query returns no-answer result with suggested follow-up.
- JSON validates against a query-answer schema.

Edge cases:

- Multiple equally valid answers.
- Conflicting high and low-confidence relationships.
- Cycles in dependency/blocker paths.
- Query target missing from graph.
- Time-scoped query at historical ref.

Known failures:

- Unknown question type fails with typed error.
- Missing provenance on an inferred edge produces degraded receipt warning.
- Invalid node ID fails before graph read.

Fuzz:

- Generate valid and invalid node IDs.
- Generate random graph shapes with cycles and disconnected components.
- Generate answer payloads against schema with missing receipt fields.

Stress:

- 100k edges with question-specific indexes absent.
- Large fan-in/fan-out around central specs.
- Repeated query loop for deterministic ordering.

Regression:

- Answer ordering stays stable.
- Receipts survive export/import.
- No answer should not exit as a crash.
- Query output schema does not drift without version bump.

Golden artifacts:

- JSON answer snapshots for each initial question.
- Human output transcripts for common questions.
- No-answer and low-confidence-answer fixtures.

Playback:

- Repository archaeology becomes a query with receipts rather than manual grep,
  commit browsing, and memory reconstruction.
