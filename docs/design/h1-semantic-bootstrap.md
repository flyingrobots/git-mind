# Hill 1 Semantic Bootstrap Spec

Status: draft for execution

Related:

- [Git Mind Product Frame](./git-mind.md)
- [ROADMAP.md](../../ROADMAP.md)
- [ADR-0005](../adr/ADR-0005.md)
- issue [#303](https://github.com/flyingrobots/git-mind/issues/303)

## Purpose

Define the first executable slice of Hill 1:

> point `git-mind` at an unfamiliar repository and get an immediately useful semantic map with low manual input.

This document turns the Hill into a concrete engineering target so implementation work can be scoped against one coherent first slice instead of spreading across packaging, content, and hardening work without a visible product center.

## Sponsor User

- A technical lead, staff engineer, architect, or autonomous coding agent dropped into an unfamiliar repository who needs a trustworthy mental model quickly.

## Job To Be Done

- When I point `git-mind` at a repository, help me understand how its code, docs, ADRs, and recent changes relate without making me manually author the graph first.

## Playback Standard

The first slice succeeds if, on a representative unfamiliar repository:

1. Git Mind produces a useful first semantic map before the user feels like they are doing graph data entry.
2. At least a small set of inferred relationships are surfaced with visible provenance and confidence.
3. The user can answer a few repository-understanding questions faster than they could with filenames, grep, and commit browsing alone.
4. The system is obviously incomplete, but already worth using.

## First-Slice Scope

This first slice is intentionally narrow.

It should define and implement:

- the first repo-local artifact set
- the first extracted entity types
- the first inferred relationship types
- the first provenance receipt shape for inferred assertions
- the first confidence model
- the first user-visible bootstrap commands / outputs

It should not try to solve:

- hosted issue tracker ingestion
- PR API ingestion
- autonomous reflection loops
- broad ontology design
- multi-repo graphing
- content authoring UX
- extension ecosystems

## Artifact Set: v0 Bootstrap Inputs

The first slice should operate only on repo-local inputs that are already present in a checked-out repository:

1. Repository file tree
2. Source files
3. Markdown documentation
4. ADR markdown files
5. Git commit history
6. Repo-local textual references to issues / PRs / commits

This keeps the first slice:

- local-first
- deterministic
- reproducible in CI
- usable on any repo without needing external API setup

## Entity Types: v0

The bootstrap should extract or synthesize the following first-pass entities:

- `file:` for source files and key project files
- `doc:` for general markdown documents
- `adr:` for ADR documents
- `module:` for inferred modules or packages where structure is obvious
- `commit:` for recent relevant commits already supported by the substrate
- `issue:` only when referenced in repo-local artifacts
- `pr:` only when referenced in repo-local artifacts

Notes:

- `module:` should be conservative in v0.
- If module inference is weak, file-level output is preferable to a fake module abstraction.
- `issue:` and `pr:` are placeholder semantic nodes backed by repo-local references, not API-enriched tracker records yet.

## Relationship Types: v0

The first slice should infer only a small, legible set of relationship types:

1. `documents`
   - doc/adr describes or explains a file/module/path

2. `references`
   - artifact explicitly references another artifact or ticket/PR/commit

3. `touches`
   - commit changes a file

4. `groups`
   - module groups file(s) when structure is obvious

5. `implements`
   - only when evidence is strong enough from explicit textual cues or durable repo conventions

Non-goal:

- Do not infer a large taxonomy in the first slice.
- A small number of understandable relationships is better than broad weak semantics.

## Provenance Model: v0

Every inferred relationship should carry a provenance payload that answers:

- what artifact(s) produced the assertion?
- what extraction rule produced it?
- what text span, path match, or commit evidence supports it?

Minimum provenance fields:

- `sourceKind`
- `sourceRef`
- `extractor`
- `evidence`
- `inferredAt`

Examples:

- markdown frontmatter path match
- explicit mention of `src/auth.js` in `docs/auth.md`
- ADR title or filename convention
- commit touching a file
- textual mention of `#123` in a changelog or ADR

## Confidence Model: v0

Confidence should be deliberately simple and inspectable.

Suggested bands:

- `high`
  - explicit structured evidence
  - exact path / identifier match
  - explicit frontmatter or strong convention

- `medium`
  - strong lexical evidence
  - unambiguous file/doc references

- `low`
  - fuzzy heuristic association
  - similarity-based guesses that are not yet reviewed

Rules:

- high-confidence edges may be shown directly in bootstrap output
- low-confidence edges should be clearly marked and easy to filter
- confidence should be rule-based in v0, not ML-derived

## User Surface: v0

The first slice should introduce one clear bootstrap flow.

Suggested command shape:

```bash
git mind bootstrap
```

Possible compatible aliases later:

- `git mind analyze`
- `git mind ingest`

But the first slice should pick one and make it real.

The command should:

1. scan the repo-local artifact set
2. infer first-pass entities and relationships
3. persist them into the graph
4. emit a summary of what was found
5. point the user at a follow-up inspection flow

Example follow-up flows:

```bash
git mind status
git mind view architecture
git mind nodes --prefix doc
git mind review
```

## Bootstrap Output Requirements

At minimum, `git mind bootstrap` should report:

- artifacts scanned
- entities created
- inferred relationships created
- relationship counts by type
- confidence counts
- notable weak-confidence suggestions

JSON output should include machine-readable counts and summary structure.

## Day-One Questions

This first slice should materially help with at least these five questions:

1. What docs or ADRs appear to explain this area of the repo?
2. What files or modules seem central to this part of the project?
3. What recent commits touched the artifacts I care about?
4. What issue / PR references are embedded in the repo’s own artifacts?
5. Where are the obvious weakly connected or undocumented parts of the repo?

## Out of Scope For First Slice

Do not expand the first slice into:

- hosted GitHub / Jira / Linear ingestion
- semantic embeddings
- AI summarization
- fully automated query answering
- review workflow redesign
- extension/plugin APIs
- authored content UX
- cross-repo merge / federation work

If a feature does not improve the first unfamiliar-repo bootstrap experience, it does not belong in the first slice.

## Implementation Slices

This spec suggests the following sequence:

### Slice A: Bootstrap Command Contract

- define CLI contract for `git mind bootstrap`
- define summary output and JSON shape
- define dry-run / write behavior if needed

### Slice B: Repo-Local Artifact Inventory

- discover and classify candidate source files, docs, ADRs, and key project files
- define repo scanning boundaries and defaults

### Slice C: First-Pass Entity Extraction

- create `file:`, `doc:`, `adr:`, and conservative `module:` nodes

### Slice D: First-Pass Relationship Inference

- infer `documents`, `references`, `touches`, `groups`
- add conservative `implements` only where evidence is strong

### Slice E: Provenance + Confidence Surfacing

- attach provenance metadata
- attach rule-based confidence
- expose summary and weak-confidence review path

## Exit Criteria

This spec is complete when:

1. the first-slice artifact/entity/relationship set is accepted
2. the bootstrap command surface is defined
3. provenance/confidence rules are explicit enough to implement
4. follow-on implementation issues can be created directly from the slices above

## Decision Rule

If a tradeoff is unclear, choose the option that makes the first unfamiliar-repo bootstrap more useful, more inspectable, and less dependent on manual graph authoring.
