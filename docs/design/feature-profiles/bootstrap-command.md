# Feature Profile: Bootstrap Command

Status: draft for Hill 1 implementation

Related:

- [Hill 1 Semantic Bootstrap Spec](../h1-semantic-bootstrap.md)
- [Git Mind Product Frame](../git-mind.md)
- [ROADMAP.md](../../../ROADMAP.md)
- issue [#305](https://github.com/flyingrobots/git-mind/issues/305)
- issue [#310](https://github.com/flyingrobots/git-mind/issues/310)

## IBM Design Thinking Frame

Sponsor user:

- A technical lead, staff engineer, architect, or autonomous coding agent
  entering an unfamiliar repository.

Job to be done:

- When I point Git Mind at a repo, help me get a useful first semantic map
  before I have to model the graph by hand.

Hill:

- Hill 1: Zero-input semantic bootstrap.

Playback evidence:

- On a representative unfamiliar repository, `git mind bootstrap --dry-run
  --json` reports scanned artifacts, inferred entities, inferred
  relationships, confidence bands, and follow-up review guidance without
  writing graph state.
- The same command without `--dry-run` writes those entities and relationships
  to the graph and the follow-up `git mind status`, `git mind nodes`, and
  `git mind view architecture` commands show useful structure.

## User Stories

- As a maintainer entering a new repo, I can run one command and see what Git
  Mind found before committing to the graph writes.
- As an agent, I can request JSON output and receive a schema-stable summary
  that distinguishes artifacts scanned, entities found, relationships inferred,
  and weak suggestions.
- As a reviewer, I can see which inferred items need review and move directly
  into the review flow.
- As a skeptical user, I can run `--dry-run` repeatedly and get deterministic
  output for unchanged repo state.

## Requirements

### Functional

- `git mind bootstrap` must initialize or open the repo graph.
- `git mind bootstrap --dry-run` must run the same scan and inference pipeline
  without writing graph state.
- `--json` must emit a stable machine-readable summary.
- Human output must be terse and must point at follow-up inspection commands.
- Default mode must persist high, medium, and low-confidence inferred
  relationships with provenance and confidence metadata.
- The command must be idempotent over unchanged inputs.
- The command must separate scan warnings from fatal errors.

### Non-Functional

- The command must be local-first and must not require hosted API credentials.
- Output order must be deterministic.
- The first implementation must favor understandable rules over broad
  speculative inference.
- The command must run acceptably on medium repos before stress tuning begins.

## CLI Contract Sketch

```bash
git mind bootstrap
git mind bootstrap --dry-run
git mind bootstrap --json
git mind bootstrap --dry-run --json
```

Initial JSON shape:

```json
{
  "schemaVersion": 1,
  "dryRun": true,
  "artifacts": { "scanned": 0, "byKind": {} },
  "entities": { "created": 0, "unchanged": 0, "byPrefix": {} },
  "relationships": { "created": 0, "unchanged": 0, "byType": {} },
  "confidence": { "high": 0, "medium": 0, "low": 0 },
  "warnings": [],
  "followUp": []
}
```

## Out Of Scope

- Hosted GitHub, Jira, or Linear ingestion.
- Semantic embeddings.
- AI summarization.
- Cross-repo bootstrap.
- Interactive terminal review UI.

## Test Plan

Fixtures:

- `minimal-doc-code`: README, one source file, one doc with an explicit file
  reference, simple commit history.
- `adr-linked-service`: ADRs that mention modules and source paths.
- `noisy-repo`: ambiguous references, generated directories, vendored files,
  and weak signals.
- `history-shaped`: recent commits touching files that appear in docs.

Golden path:

- `bootstrap --dry-run --json` on `minimal-doc-code` returns deterministic
  counts and writes no WARP refs.
- `bootstrap --json` on `minimal-doc-code` writes graph state and returns the
  same summary with `dryRun: false`.
- Running bootstrap twice creates no duplicate nodes or edges.

Edge cases:

- Empty Git repo.
- Repo with docs but no source files.
- Repo with source files but no docs.
- Repo with ignored directories, binary files, symlinks, and nested packages.
- Existing graph with manually authored edges that overlap inferred edges.

Known failures:

- Outside a Git repo must fail with a typed error.
- Malformed Git state must fail before partial writes.
- Unknown flags must fail through the normal CLI flag parser.
- Permission-denied files must warn or fail according to scan policy, never
  crash with an unhandled exception.

Fuzz:

- Generate file paths with unusual but valid characters.
- Generate Markdown references with nested brackets, issue-like numbers, and
  invalid links.
- Generate random flag ordering and ensure parser output is stable.

Stress:

- 10k files with realistic ignore patterns.
- 5k Markdown links and references.
- 2k commits in history range.
- Repeated dry-run loop to detect nondeterministic output.

Regression:

- No hidden network calls.
- No writes in `--dry-run`.
- No graph duplicates on repeated runs.
- No output contract drift without schema version bump.

Golden artifacts:

- JSON summary fixture for each base repo.
- Human output transcript for the golden path.
- Graph export after default write mode.

Playback:

- A new maintainer can run bootstrap on the fixture repo and answer: what docs
  explain this area, what files look central, and what relationships need
  review?
