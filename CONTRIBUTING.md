# Contributing to git-mind

Thanks for your interest in contributing. This document covers the essentials.

Before changing product-facing behavior or docs, read these first:

- [README.md](README.md)
- [docs/README.md](docs/README.md)
- [docs/design/git-mind.md](docs/design/git-mind.md)
- [ROADMAP.md](ROADMAP.md)

Current product frame:

- `git-mind` is a Git-native semantic intelligence layer for software repositories
- current work should be judged against low-input semantic bootstrap, provenance-backed query, and living-map upkeep
- personal cognition tooling belongs in `think`, not here

## IBM Design Thinking Expectations

Git Mind officially uses IBM Design Thinking to guide product work.

Before proposing substantial product or workflow changes, identify:

- the sponsor user
- the job to be done
- the Hill this work moves, or the supporting lane it strengthens
- the playback evidence that would prove progress

Canonical planning references:

- [docs/design/git-mind.md](docs/design/git-mind.md)
- [ROADMAP.md](ROADMAP.md)
- [docs/adr/ADR-0005.md](docs/adr/ADR-0005.md)
- [docs/adr/ADR-0006.md](docs/adr/ADR-0006.md)

## Delivery Cycle

Git Mind uses a design-to-test delivery cycle.

For substantial work:

1. write or update the relevant design artifact
2. make the acceptance criteria explicit
3. translate those acceptance criteria into failing tests
4. implement until the tests are green
5. run a playback / retrospective and capture backlog follow-ups
6. update [README.md](README.md) if user-facing reality changed
7. open the PR, land it, and capture review-cycle learnings back into the backlog

This is not just for happy paths.
Tests should cover edge cases, failure modes, and fuzz/stress behavior when the design risk justifies it.

GitHub issues are the execution backlog.
GitHub milestones are not the primary planning surface for this repository.

## Prerequisites

- Node.js >= 20.0.0
- Git
- A local clone of [`@git-stunts/git-warp`](https://github.com/nicktomlin/git-warp) (git-mind depends on it via local path)

## Setup

```bash
git clone https://github.com/neuroglyph/git-mind.git
cd git-mind
npm install
npm test
```

## Making changes

1. Create a branch from `main` (or the current development branch)
2. For substantial work, start from a design artifact and acceptance criteria
3. Add or update failing tests before implementation when behavior is changing
4. Make your changes
5. Run the tests: `npm test`
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation only
   - `chore:` — maintenance, tooling
   - `refactor:` — code change that neither fixes a bug nor adds a feature
   - `test:` — adding or updating tests
7. Open a pull request

## Commit messages

Follow the conventional commit format:

```
type(scope): short description

Longer explanation if needed.

Refs #issue-number
```

Every commit should reference a GitHub issue. If one doesn't exist, create it.

## Code style

- Plain JavaScript with JSDoc type annotations (no TypeScript)
- ES modules (`import`/`export`)
- Format with Prettier: `npm run format`
- Lint with ESLint: `npm run lint`

## Tests

Tests use [vitest](https://vitest.dev/). Run them with:

```bash
npm test          # single run
npm run test:watch  # watch mode
```

Testing doctrine:

- tests are the executable form of design acceptance criteria
- cover golden paths, edge cases, failure cases, and fuzz/stress behavior where warranted
- prefer repository-shaped fixtures for repository-shaped behavior
- avoid copying `mkdtemp + git init + config` boilerplate across suites when a shared fixture helper would do better

Canonical fixture guidance lives in [docs/design/repo-fixture-strategy.md](docs/design/repo-fixture-strategy.md).
The intended direction is a fluent repo builder with reusable base repos and scenario overlays.

## Project structure

```
bin/git-mind.js      — CLI entry point
src/
  graph.js           — WarpGraph wrapper (init, load, save)
  edges.js           — Edge CRUD with types + confidence
  views.js           — Observer view definitions and rendering
  hooks.js           — Post-commit directive parser
  cli/
    commands.js      — CLI command implementations
    format.js        — Terminal output formatting
  index.js           — Public API exports
test/
  graph.test.js      — Graph lifecycle tests
  edges.test.js      — Edge CRUD tests
  views.test.js      — View filtering tests
  hooks.test.js      — Directive parsing tests
```

## License

By contributing, you agree that your contributions will be licensed under [Apache-2.0](LICENSE).
