# git-mind

> Queryable repository meaning with receipts.

`git-mind` is a Git-native semantic intelligence layer for software repositories.

It exists to establish, infer, review, and surface semantic relationships between project artifacts such as:

- code
- docs
- ADRs
- tasks
- reviews
- issues
- commits

It keeps that knowledge in Git/WARP so it can be replayed, diffed, reviewed, and queried over time.

`git-mind` is not a personal thought-capture tool.
That thesis now lives in `think`.

## Planning Framework

Git Mind officially uses **IBM Design Thinking** to guide product work.

That means:

- sponsor user and jobs come before architecture expansion
- Hills define the product outcomes we are trying to achieve
- Playbacks are how we decide whether recent work actually moved a Hill
- GitHub issues are the execution backlog, not the product strategy

Canonical planning sources:

- [docs/design/git-mind.md](docs/design/git-mind.md)
- [ROADMAP.md](ROADMAP.md)
- [docs/adr/ADR-0005.md](docs/adr/ADR-0005.md)
- [docs/adr/ADR-0006.md](docs/adr/ADR-0006.md)

## Delivery Cycle

Git Mind officially uses a design-to-test cycle.

That means:

1. frame the work in a design artifact using sponsor user, job to be done, Hill, and acceptance criteria
2. translate those acceptance criteria into failing tests
3. cover not only the golden path, but also edge cases, failure modes, and fuzz/stress when warranted
4. implement until the tests are green
5. run a playback / retrospective and capture backlog items and follow-on ideas explicitly
6. update `README.md` if product reality changed
7. open the PR and process review feedback
8. resolve stale review threads and document false positives before merge
9. land the PR, then capture review-cycle learnings back into the backlog

For repository-shaped behavior, prefer canonical repo fixtures over one-off temporary repo setup.
See [docs/design/repo-fixture-strategy.md](docs/design/repo-fixture-strategy.md) and [docs/adr/ADR-0006.md](docs/adr/ADR-0006.md).

## What Git Mind Is For

`git-mind` is for the moment when you need to answer questions like:

- what implements this spec?
- what ADR explains this module?
- what issues and reviews shaped this area?
- what changed semantically between these two points in time?
- what does this repository actually mean, beyond its files?

Its job is to make repository meaning more explicit and less dependent on tribal knowledge, grep archaeology, and memory.

## Current Product Direction

Today, `git-mind` already provides a substantial graph substrate:

- repo-native graph storage on top of Git/WARP
- typed relationships and node metadata
- views and lenses over the graph
- import/export paths
- time-travel and semantic diff
- AI-assisted suggestion and review workflows
- content-on-node
- extension support

The next hill is not "more graph features."

The next hill is:

- point `git-mind` at a repository and get an immediately useful semantic map with provenance-backed answers, with as little manual input as possible

That is the make-or-break product test from here.

## Quick Start

```bash
# Install
npm install -g git-mind

# Initialize in a Git repository
cd /path/to/your/repo
git mind init

# Seed relationships from existing markdown docs where possible
git mind import --from-markdown "docs/**/*.md"

# Inspect the semantic graph
git mind nodes
git mind view architecture
git mind status

# Surface candidate relationships for review
git mind suggest
git mind review

# Compare repository meaning over time
git mind diff HEAD~10..HEAD
```

Manual edge creation remains supported, but it should increasingly be treated as refinement or override rather than the only path to value:

```bash
git mind link file:src/auth.js spec:auth --type implements
git mind link adr:0007 task:auth-rollout --type blocks
```

## Product Doctrine

- Low-input semantic bootstrap matters.
- Inference should precede heavy manual curation.
- Provenance must back meaningful assertions.
- Review should refine the map, not create it from scratch.
- The graph is the substrate, not the user's main mental model.
- Queryable value matters more than graph elegance.

## What Git Mind Is Not

`git-mind` is not:

- a personal capture product
- a reflective journal
- a manually maintained project wiki
- a generic PKM system
- a graph toy with no clear engineering question behind it

## Built On git-warp

`git-mind` is built on [`@git-stunts/git-warp`](https://github.com/nicktomlin/git-warp), which gives it:

- causal history
- deterministic replay
- conflict-free graph merging
- branch and merge semantics for knowledge state
- Git-native persistence without an external database

Those are not the product by themselves.
They are what make provenance-backed repository intelligence possible.

## Status

Current package version: `5.0.0`.

The repository is in a stabilize-and-clarify phase:

- the inward-facing cognition thesis has moved to `think`
- `git-mind` is being narrowed around semantic repository intelligence
- existing graph capabilities remain real and useful
- future work should be judged against the low-input semantic bootstrap hill

## Documentation

Canonical docs:

- [docs/README.md](docs/README.md)
- [GUIDE.md](GUIDE.md)
- [GRAPH_SCHEMA.md](GRAPH_SCHEMA.md)
- [ROADMAP.md](ROADMAP.md)
- [docs/adr/ADR-0005.md](docs/adr/ADR-0005.md)
- [docs/adr/ADR-0006.md](docs/adr/ADR-0006.md)
- [docs/VISION_NORTH_STAR.md](docs/VISION_NORTH_STAR.md)
- [docs/design/git-mind.md](docs/design/git-mind.md)
- [docs/design/repo-fixture-strategy.md](docs/design/repo-fixture-strategy.md)
- [docs/adr/](docs/adr/)

## License

[Apache-2.0](LICENSE)
