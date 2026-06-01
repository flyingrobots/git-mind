# Feature Profile: Relationship Inference

Status: draft for Hill 1 implementation

Related:

- [Hill 1 Semantic Bootstrap Spec](../h1-semantic-bootstrap.md)
- issue [#307](https://github.com/flyingrobots/git-mind/issues/307)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer or agent trying to understand how repo artifacts connect.

Job to be done:

- When Git Mind has artifacts and entities, infer a small set of useful
  relationships with visible evidence instead of asking me to author every edge.

Hill:

- Hill 1: Zero-input semantic bootstrap.

Playback evidence:

- Bootstrap produces useful `documents`, `references`, `touches`, `groups`, and
  conservative `implements` edges with provenance and confidence.

## User Stories

- As a user, I can see which docs or ADRs appear to explain a file or module.
- As an agent, I can inspect why a relationship exists before acting on it.
- As a reviewer, I can accept, reject, or adjust weak inferred relationships.

## Requirements

### Functional

- Infer `documents` from explicit path mentions, doc frontmatter, ADR patterns,
  and strong naming conventions.
- Infer `references` from explicit artifact, issue, PR, and commit references.
- Infer `touches` from commit history.
- Infer `groups` from conservative package or directory boundaries.
- Infer `implements` only from strong explicit cues.
- Attach provenance and confidence to every inferred edge.
- Avoid duplicate edges across repeated runs.

### Non-Functional

- Inference rules must be explainable.
- Weak relationships must not be hidden.
- The first version must avoid opaque ML or embedding dependency.
- False positives should bias toward low confidence and reviewability.

## Relationship Policy

Initial inference should prefer precision over breadth. It is acceptable for the
first bootstrap map to be incomplete if the relationships it does emit are
understandable and reviewable.

## Test Plan

Fixtures:

- `adr-linked-service`
- `history-shaped`
- `issue-pr-reference-docs`
- `noisy-repo`

Golden path:

- Explicit doc path mentions produce `documents`.
- Markdown links and text references produce `references`.
- Recent commits touching files produce `touches`.
- Package directory membership produces `groups`.
- Explicit "implements spec:auth" style cues produce `implements`.

Edge cases:

- Multiple docs mention the same file.
- One doc references many issue IDs.
- Renamed files in commit history.
- Ambiguous lexical matches with common words.
- Generated docs that mention every file.

Known failures:

- No inferred edge may be written without provenance.
- Weak evidence must not become high confidence.
- Commit ranges that cannot resolve must fail predictably.
- Relationship endpoints missing from entity extraction must be reported.

Fuzz:

- Generate Markdown links, issue references, and path mentions.
- Generate random commit messages with directive-like text.
- Generate near-match filenames to test false positives.

Stress:

- 100k candidate artifact pairs with bounded inference time.
- 10k commits with file touches.
- Docs with very large reference lists.

Regression:

- Repeated bootstrap creates no duplicate edges.
- Inference output order is stable.
- Review decisions suppress or update future weak suggestions as designed.

Golden artifacts:

- Relationship JSON summary by type and confidence.
- Graph export containing inferred edge properties.
- False-positive fixtures with expected low or no inference.

Playback:

- A user can answer: what docs explain this area, what commits touched it, and
  what inferred relationships need review?
