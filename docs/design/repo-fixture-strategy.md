# Repo Fixture Strategy

Status: canonical engineering test strategy

Related:

- [ADR-0006](../adr/ADR-0006.md)
- [ADR-0005](../adr/ADR-0005.md)
- [Hill 1 Semantic Bootstrap Spec](./h1-semantic-bootstrap.md)
- issue [#309](https://github.com/flyingrobots/git-mind/issues/309)

## Purpose

Git Mind needs canonical repository-shaped test fixtures.

The product now aims to infer meaning from:

- file trees
- source files
- Markdown docs
- ADRs
- repo-local issue / PR / commit references
- commit history
- branches and merges over time

That means the test substrate should be **repositories with believable state and history**, not only loose files or ad hoc temp directories.

## Core Principles

1. Tests are the spec.
   - Fixture repos exist to make design acceptance criteria executable.

2. Prefer readable construction over opaque archives.
   - A contributor should be able to understand why a fixture exists and what shape it has.

3. Prefer reusable repo shapes over one-off setup boilerplate.
   - Repeated `mkdtemp + git init + config + write + commit` logic should converge into shared helpers.

4. Preserve realistic Git behavior where it matters.
   - Branches, merges, and commit history are part of the product surface.

5. Freeze exact Git object state only when necessary.
   - Archived fixture repos are a last resort, not the default pattern.

## Canonical Model

Git Mind fixture repos should use three layers:

### 1. Fluent repo builder

A shared helper should create and mutate temporary Git repos for tests.

Expected responsibilities:

- create temporary repos
- initialize Git
- configure test identity
- write, update, and delete files
- create commits with controlled messages
- create branches and merges
- expose useful handles for paths, refs, and repo root

### 2. Base repos

Base repos define a stable semantic starting point.

Examples:

- minimal docs + code repo
- ADR-driven service repo
- module-heavy repo
- intentionally noisy repo

Base repos answer:

- what repository shape are we testing?

### 3. Scenario overlays

Scenario overlays add state or evolution to a base repo.

Examples:

- add ADR references
- add issue / PR references
- add recent commit history
- add a feature branch and merge
- add ambiguous or low-confidence signals

Overlays answer:

- what happened to this repo?
- what additional evidence or ambiguity do we want to test?

## Preferred API Shape

The exact implementation can evolve, but the intended model is:

```js
const repo = await repoFixture()
  .base(minimalDocsAndCodeBase())
  .overlay(withAdrOverlay())
  .overlay(withIssueRefOverlay())
  .overlay(withFeatureBranchOverlay())
  .build();
```

Or, for smaller cases:

```js
const repo = await createRepoFixture('minimal-service')
  .withFile('README.md', '# Echo Service')
  .withFile('src/auth.js', 'export function auth() {}')
  .commit('feat: add auth module')
  .applyOverlay(withAdrOverlay())
  .build();
```

The point is not the exact method names.
The point is:

- readable setup
- reusable repo shapes
- composable history/state overlays

## Archived Repo Snapshots

Tarballs or archived repos are allowed when:

- exact `.git` object state matters
- merge topology must be preserved exactly
- performance or regression fixtures should be frozen
- recreating the scenario programmatically would be too brittle or too expensive

They should not be the default for routine tests.

Default rule:

- builder first
- archive only when exact historical state is the thing under test

## Initial Canonical Scenario Set

The first useful fixture catalog should likely include:

1. `minimal-doc-code`
   - a source file, README, one supporting doc, simple commit history

2. `adr-linked-service`
   - ADRs that explicitly point at modules or files

3. `history-shaped`
   - recent commits and references that support provenance testing

4. `branching-evolution`
   - a feature branch and merge for history-sensitive cases

5. `noisy-repo`
   - ambiguous references and weak signals for low-confidence behavior

## Test Expectations

When writing tests against this substrate:

- start from design acceptance criteria
- cover golden paths
- add negative and edge cases
- add fuzz or stress tests when the design risk justifies them
- name fixtures for the repository story they represent
- keep fixture intent obvious from the test body

## Migration Guidance

The existing suite already contains many temporary Git repo setups.
We do not need to rewrite all of them at once.

Recommended path:

1. build the shared repo fixture helper
2. add the first base repos and overlays
3. use them for new Hill 1 work first
4. gradually migrate older suites when they are touched

## Why This Matters For Hill 1

Hill 1 is about low-input semantic bootstrap on an unfamiliar repository.

That is a repository-shaped promise.

If our tests only exercise isolated helpers or handwritten one-off temp dirs, we will miss:

- artifact classification drift
- provenance blind spots
- history-sensitive edge cases
- ambiguous signal handling
- the real user experience of "point it at a repo and see what it finds"
