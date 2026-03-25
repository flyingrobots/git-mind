# Changelog

All notable changes to this project will be documented in this file.

This is release history, not the canonical product frame.
Older entries will naturally reflect prior roadmap eras and product language.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0] - 2026-02-25

### Breaking

- **`getNodes(graph)` wrapper** — Use `graph.getNodes()` directly (#295)
- **`hasNode(graph, id)` wrapper** — Use `graph.hasNode(id)` directly (#295)
- **`saveGraph(graph)` wrapper** — Dead code with zero call sites (#295)
- **`queryEdges(graph, filter)` wrapper** — Use `graph.getEdges()` with inline filter (#295)
- **`getNodesByPrefix(graph, prefix)` wrapper** — Use `graph.getNodes()` with `startsWith()` filter (#295)

### Changed

- **All internal `loadGraph()` calls replaced with `initGraph()`** — `loadGraph` kept as deprecated alias for public API backward compatibility (#295)

## [4.0.1] - 2026-02-22

### Fixed

- **OID guard in `writeContent()`** — Throw if `getContentOid()` returns null after a successful write, enforcing the `WriteContentResult.sha: string` contract (#284)
- **Error cause chain in `readContent()`** — Capture original error via `{ cause: err }` so callers can distinguish blob-not-found from infrastructure failures (#284)
- **Null guard in `readContent()`** — Changed `!contentBuf` to explicit `contentBuf == null` for clearer null/undefined intent (#284)
- **Null guard in `hasContent()`** — Changed `sha !== null` to `sha != null` to catch both null and undefined from `getContentOid()`, consistent with other callers (#284)
- **ROADMAP stale integrity-check language** — Corrected binary content backlog item to reflect WARP-native blob storage; reframed `--verify` flag as OID existence check (#284)
- **JSDoc typedef terminology** — Changed "Git blob SHA" / "Written blob SHA" to "Git blob OID" in `ContentMeta` and `WriteContentResult` typedefs (#284)
- **Dead `execSync` import** — Removed unused `execSync` from `test/content.test.js`; only `execFileSync` is used (#284)

### Added

- **Empty content edge-case test** — Verifies `writeContent()` handles empty string input correctly (size 0, round-trip intact) (#284)

## [4.0.0] - 2026-02-22

### Changed

- **BREAKING: Migrate content system to git-warp native API** — Replaced custom CAS layer (`git hash-object` / `git cat-file`) with `@git-stunts/git-warp` native `setContent()` / `getContent()` API. Content properties now use WARP's `CONTENT_PROPERTY_KEY` instead of custom `_content.sha`. Removes all direct git subprocess calls from content module (#284)
- **Test count** — 577 tests across 29 files (was 571)

## [3.3.0] - 2026-02-22

### Added

- **Content-on-node (M13 VESSEL)** — Attach rich content to graph nodes using git's native CAS. Content stored as git blobs via `hash-object`, SHA and metadata recorded as WARP node properties under the `_content.*` prefix (#271)
- **`git mind content set <node> --from <file>`** — Attach content from a file. MIME auto-detected from extension, `--mime` override supported. `--json` output (#273)
- **`git mind content show <node>`** — Display attached content. `--raw` for piping (body only, no metadata header). `--json` output (#273)
- **`git mind content meta <node>`** — Show content metadata (SHA, MIME, size, encoding). `--json` output (#273)
- **`git mind content delete <node>`** — Remove content attachment from a node. `--json` output (#273)
- **Content store API** — `writeContent()`, `readContent()`, `getContentMeta()`, `hasContent()`, `deleteContent()` exported from public API (#272)
- **SHA integrity verification** — `readContent()` re-hashes retrieved blob and compares to stored SHA on every read (#272)
- **JSON Schema contracts for content CLI** — `content-set.schema.json`, `content-show.schema.json`, `content-meta.schema.json` in `docs/contracts/cli/` (#274)
- **ADR-0004: Content Attachments Belong in git-warp** — Decision record establishing that CAS-backed content-on-node is a git-warp substrate responsibility, not a git-mind domain concern. Aligns with Paper I's `Atom(p)` attachment formalism (#252)
- **Chalk formatting for `extension list`** — `formatExtensionList()` renders extension names in cyan bold, versions dimmed, `[builtin]` in yellow / `[custom]` in magenta, consistent with all other CLI commands (#265)
- **Prefix collision detection** — `registerExtension()` now checks incoming domain prefixes against all registered extensions and throws a descriptive error on overlap. Idempotent re-registration of the same extension name is still allowed (#264)
- **Imperative views declared in extension manifests** — `milestone` and `progress` views added to the roadmap manifest; `traceability`, `coverage`, and `onboarding` views added to the architecture manifest. Purely declarative — makes `extension list` show the full picture (#268)
- **`git mind extension remove <name>` subcommand** — Removes a custom extension from the registry. Throws on built-in or non-existent extensions. `--json` output supported. `removeExtension()` exported from public API (#263)
- **JSON Schema contracts for extension CLI output** — 4 new schemas in `docs/contracts/cli/`: `extension-list`, `extension-validate`, `extension-add`, `extension-remove`. Valid samples added to the contract test harness (#262)
- **Deferred items documented in ROADMAP** — #261 (ephemeral registration) and #269 (`--extension` flag) documented with rationale and recommended H2 slot

### Fixed

- **CRITICAL: Command injection in `readContent()`** — Replaced all `execSync` shell interpolation with `execFileSync` arg arrays + SHA validation regex. Zero shell invocations in content module (#276)
- **Dead `encoding` parameter removed** — Removed unused `encoding` field from content store, CLI format, JSON Schema contracts, and tests. Content is always UTF-8 (#276)
- **Static imports in content CLI** — Replaced dynamic `await import('node:fs/promises')` and `await import('node:path')` with static imports (#276)
- **`nodeId` in `content show` metadata** — Non-raw `content show` now passes `nodeId` to `formatContentMeta` for consistent display (#276)
- **Schema `if/then/else` conditional** — `content-meta.schema.json` enforces `sha`, `mime`, and `size` required when `hasContent` is `true`; forbids them when `false` (#276)
- **Redundant null check** — Removed dead `sha !== undefined` in `hasContent()` — `?? null` guarantees non-undefined (#276)
- **Misleading integrity test** — Split into blob-not-found test + genuine integrity mismatch test using non-UTF-8 blob (#276)
- **Test SHA assertions accept both SHA-1 (40 chars) and SHA-256 (64 chars)** (#276)
- **Schema test compile-once** — Content schema validators compiled once in `beforeAll` instead of per-test; removed `$id` stripping workaround (#276)
- **Error-path CLI tests** — 4 new tests: nonexistent file, node without content, non-existent node for show/delete (#276)
- **MIME map extended** — Added `.css` → `text/css` and `.svg` → `image/svg+xml` (#276)
- **YAML MIME type** — Changed `.yaml`/`.yml` mapping from `text/yaml` to `application/yaml` (IANA standard) (#276)
- **Missing `content-delete.schema.json` contract** — Added JSON Schema for `content delete --json` output (#276)
- **Content subcommand positional parsing** — `extractPositionals()` helper properly skips `--flag value` pairs instead of naive `!startsWith('--')` check (#276)

### Changed

- **Upgraded `@git-stunts/git-warp`** from v11.3.3 to v11.5.0
- **`registerBuiltinExtensions()` memoized** — Module-level `builtInsLoaded` flag prevents redundant YAML file reads on repeated invocations within the same process (#266)
- **Test count** — 571 tests across 29 files (was 537)

## [3.2.0] - 2026-02-17

### Changed

- **Upgraded `@git-stunts/git-warp`** from v10.3.2 to v11.3.3

### Added

- **Composable view lenses** — Post-filter views with chainable lenses using colon syntax: `git mind view roadmap:incomplete:frontier`. Lenses compose left-to-right (#250)
- **5 built-in lenses** — `incomplete` (filter to unfinished nodes), `frontier` (leaf nodes — ready to start), `critical-path` (longest dependency chain via DP), `blocked` (nodes with unresolved blockers), `parallel` (nodes with no mutual dependencies) (#250)
- **DAG utilities** — Pure graph helpers in `src/dag.js`: `buildAdjacency`, `topoSort`, `detectCycles`, `walkChain`, `findRoots` (#250)
- **Lens registry and composition API** — `defineLens`, `getLens`, `listLenses`, `composeLenses`, `resetLenses`, `captureBuiltIns` exported from `src/lens.js` and public API (#250)
- **`view-lens.schema.json` contract** — JSON Schema for `git mind view --json` output when lenses are applied, including `lenses` array and strict edge constraints (#250)
- **Governance tooling** — Pre-commit hook, mechanical architecture gate CI workflow, PR template with hard-gate checkboxes, review checklist script (#250)
- **Architecture docs** — `docs/VISION_NORTH_STAR.md`, `docs/ARCHITECTURE.md`, `docs/RISK_REGISTER.md`, `docs/REVIEW_RUBRIC.md`, ADR-0001, ADR-0002 (#250)

### Changed

- **`renderView` accepts `options.lenses`** — View pipeline applies lens composition after view filtering. Node properties fetched only when view or any lens requires them (#250)
- **`git mind view` help** — Usage string updated to `view [name[:lens1:lens2]]` with lens list (#250)
- **`view --json` payload** — `{ ...result, viewName, lenses? }` — spread order fixed so `renderView` properties are never shadowed (#250)
- **Blocker and onboarding views** — Refactored to use DAG helpers from `src/dag.js` (#250)
- **`defineLens` warns on built-in overwrite** — Console warning emitted if a registered built-in is overwritten before `resetLenses()` is called (#250)
- **Test count** — 461 tests across 24 files (was 412)

## [3.1.0] - 2026-02-14

### Added

- **`git mind set <nodeId> <key> <value>` command** — Set node properties directly from the CLI. Returns `previous` value and `changed` boolean for idempotent automation. Supports `--json` output (#222)
- **`git mind unset <nodeId> <key>` command** — Remove a node property. Returns `previous` value and `removed` boolean. Supports `--json` output (#222)
- **`setNodeProperty()` + `unsetNodeProperty()` API** — Programmatic node property CRUD in `src/nodes.js`, exported from public API (#222)
- **`classifyStatus()` helper** — Normalizes status values with synonym mapping (`WIP` → `in-progress`, `Done` → `done`, etc.). Canonical values: `todo`, `in-progress`, `blocked`, `done`. Exported from `src/views.js` and public API (#222)
- **`progress` view** — Groups `task:` and `feature:` nodes by `status` property, shows completion percentage and per-status counts. Uses `classifyStatus()` for synonym normalization (#222)
- **JSON Schema contracts** — `set.schema.json`, `unset.schema.json`, and `view-progress.schema.json` in `docs/contracts/cli/` with integration canary tests (#222)
- **`--json` flag for `view` command** — `git mind view progress --json` returns structured output validated against `view-progress.schema.json` (#222)
- **`--scope` flag for `view progress`** — `git mind view progress --scope task` filters by prefix. Default scope: `task,feature` (#222)
- **`ratio` and `remaining` in progress summary** — `meta.summary` now includes `ratio` (e.g. `"3/5"`) and `remaining` count for JSON consumers (#222)
- **Sorted progress bucket IDs** — `meta.byStatus` arrays are alphabetically sorted for deterministic output (#222)

### Changed

- **`renderView` passes node properties and options** — View filter functions receive a third `nodeProps` argument and fourth `options` argument. Only properties fetched when the view declares `needsProperties: true`, so existing views have zero overhead (#222)
- **`ViewDefinition` typedef updated** — `filterFn` signature now reflects all four parameters (`nodes`, `edges`, `nodeProps`, `options`) and the `needsProperties` option (#222)
- **`formatView` uses explicit view name** — Progress view routing now checks `viewName === 'progress'` instead of duck-typing `meta.summary.pct` (#222)
- **`set` command rejects flags as values** — `git mind set task:a status --json` now errors instead of storing `"--json"` as the property value (#222)
- **Same-tick diff shortcut marks result as skipped** — `stats.skipped: true` and `total: null` distinguish "graph unchanged" from "empty graph" (#222)
- **`formatProgressMeta` shows remaining count** — Terminal header now reads `Progress: 60% (3/5 done, 2 remaining)` (#222)
- **`DiffResult` typedef nullable totals** — JSDoc updated: `nodes.total` and `edges.total` are `{ before, after } | null` when diff is skipped (#222)
- **Test count** — 412 tests across 22 files (was 371)
- **Suppress `DEP0169` warning** — Shebang updated to `--disable-warning=DEP0169`; silences `url.parse()` deprecation from transitive dep `roaring` → `@mapbox/node-pre-gyp` (#222)

## [3.0.0] - 2026-02-13

### Added

- **`schemaVersion: 1` and `command` fields in all `--json` outputs** — Every CLI command that supports `--json` now includes a `schemaVersion` (integer, currently `1`) and `command` (string) field in its output envelope. The CLI layer is authoritative via the `outputJson()` helper (#205)
- **JSON Schema files** — 13 Draft 2020-12 JSON Schema files in `docs/contracts/cli/` for programmatic validation of every `--json` output. Strict `additionalProperties: false` at top level; open objects where extensibility is intentional (node properties, prefix maps) (#205)
- **Contract validation tests** — `test/contracts.test.js` (17 unit tests) validates schema compilation, envelope requirements, sample payloads, and optional field handling. `test/contracts.integration.test.js` (12 CLI canary tests) executes the real binary and validates output against schemas using `ajv` (#205)
- **CLI Contracts documentation** — `docs/contracts/CLI_CONTRACTS.md` with version policy, command-to-schema table, programmatic validation example, and migration guide (#205)

### Breaking

- **`nodes --json` output wrapped** — Previously returned a bare JSON array; now returns `{ schemaVersion: 1, command: "nodes", nodes: [...] }`. Migration: `jq '.[]'` → `jq '.nodes[]'` (#205)
- **`review --json` output wrapped** — Previously returned a bare JSON array; now returns `{ schemaVersion: 1, command: "review", pending: [...] }`. Migration: `jq '.[].source'` → `jq '.pending[].source'` (#205)

### Changed

- **Test count** — 371 tests across 22 files (was 342 across 20)

## [2.0.0-alpha.5] - 2026-02-13

### Added

- **`git mind diff` command** — Compare the knowledge graph between two historical commits. Resolves git refs to epoch markers, materializes both snapshots, and reports node/edge additions and removals with summary tables. Supports range syntax (`A..B`), two-arg syntax (`A B`), and shorthand (`A` for `A..HEAD`). `--json` output includes `schemaVersion: 1` for forward compatibility. `--prefix` scopes the diff to a single node prefix (#203)
- **Diff API** — `computeDiff(cwd, refA, refB, opts)` for full orchestration, `diffSnapshots(graphA, graphB, opts)` for pure snapshot comparison in `src/diff.js`. Both exported from public API (#203)

### Fixed

- **`--prefix` value leaks into positional args** — `git mind diff HEAD~1..HEAD --prefix task` incorrectly treated `task` as a second ref argument. Extracted `collectDiffPositionals()` helper that skips flag values consumed by non-boolean flags (#203)
- **Same-tick shortcut reports zero totals** — When both refs resolve to the same Lamport tick, `computeDiff` returned `total: { before: 0, after: 0 }` which misrepresents an unchanged graph as empty. Now includes `stats.sameTick: true` so JSON consumers can distinguish "unchanged" from "empty graph" (#203)

### Changed

- **Test count** — 342 tests across 20 files (was 312 across 19)

## [2.0.0-alpha.4] - 2026-02-13

### Added

- **`git mind at <ref>` command** — Time-travel: materialize the graph at a historical point via epoch markers. Resolves git refs to Lamport ticks and filters the CRDT graph to that ceiling. Supports `--json` output with epoch metadata (#202)
- **Epoch API** — `getCurrentTick(graph)`, `recordEpoch(graph, sha, tick)`, `lookupEpoch(graph, sha)`, `lookupNearestEpoch(graph, cwd, sha)`, `getEpochForRef(graph, cwd, ref)` in `src/epoch.js` (#202)
- **Automatic epoch recording** — `processCommit` now records an epoch marker after processing each commit, correlating the commit SHA to the current Lamport tick (#202)

### Fixed

- **Shell injection in `src/epoch.js`** — Replaced `execSync` string interpolation with `execFileSync` array args in `lookupNearestEpoch` and `getEpochForRef`, preventing command injection via crafted ref names (#202)
- **Missing `contents` permission in `gitmind-review.yml`** — Workflow now includes `contents: read` so `actions/checkout` can fetch the repo; unspecified scopes default to `none` when `permissions` is explicit (#200)
- **`action.yml` ignores workflow-level `GITMIND_AGENT`** — Validation step no longer overrides inherited env var with empty `inputs.agent`; suggest step falls back to `env.GITMIND_AGENT` (#199)
- **`parseReviewCommand` accepts index 0** — Now returns `null` for index `< 1` since suggestions are 1-indexed (#200)
- **Backtick characters in PR suggestion table** — `formatSuggestionsAsMarkdown` strips backticks from source/target to prevent breaking inline code spans (#200)
- **`findMarkdownFiles` swallows all errors** — Now only catches `ENOENT`/`ENOTDIR`; permission errors and other failures propagate (#196)
- **`extractGraphData` strips extension from directory name** — `String.replace` with `extname` only replaced the first `.md` occurrence; now uses `slice` to target only the trailing extension (#196)
- **`qualifyNodeId` unhelpful error for non-prefixed IDs** — Now throws a descriptive error mentioning `prefix:identifier` format instead of falling through to `buildCrossRepoId`'s generic validation (#197)
- **`qualifyNodeId` accepts multi-colon local IDs** — `a:b:c` now throws a clear error instead of falling through to `buildCrossRepoId`'s generic validation (#197)
- **`formatSuggestionsAsMarkdown` crashes on missing `type`** — All suggestion fields (`source`, `target`, `type`, `confidence`, `rationale`) now have null-coalescing guards (#200)
- **Empty pending list produces confusing range** — `reviewCmd` now says "No pending suggestions to review" instead of "Index N out of range (1-0)" (#200)
- **`import`/`export` positional arg breaks with preceding flags** — Both `git mind import --dry-run file.yaml` and `git mind export --format json file.yaml` now scan for the first non-flag argument (#196, #195)
- **Frontmatter closing delimiter matches `---suffix`** — `parseFrontmatter` now requires `---` followed by newline or EOF (#196)
- **Doctor orphan detection uses hardcoded prefixes** — Now uses `SYSTEM_PREFIXES` from validators plus `decision` instead of hardcoded `startsWith` checks (#201)
- **Epoch SHA truncation too short** — Widened from 8 to 12 characters to reduce birthday-paradox collision risk (#202)
- **`serializeExport` silently falls back to YAML** — Now throws on unsupported format instead of silently defaulting (#195)
- **Empty `catch` in `processCommit`** — Epoch recording errors now logged when `GITMIND_DEBUG` is set (#202)
- **`gitmind-review.yml` `echo` for untrusted input** — Replaced with `printf '%s'` to prevent `-n`/`-e`/backslash misbehavior (#200)

### Changed

- **`epoch` added to `SYSTEM_PREFIXES`** — Epoch markers use the `epoch:` prefix, classified as system. Excluded from export and doctor orphan detection (#202)
- **Permission test skipped under root** — `findMarkdownFiles` chmod test now skips when running as root (CI containers) (#196)
- **Test count** — 312 tests across 19 files (was 286 across 18)

## [2.0.0-alpha.3] - 2026-02-12

### Added

- **`git mind export` command** — Serialize the graph to YAML or JSON in v1 import-compatible format, enabling round-trip workflows. Supports `--format yaml|json`, `--prefix <prefix>` filtering, file output or stdout, and `--json` for structured metadata (#195)
- **Export API** — `exportGraph(graph, opts)`, `serializeExport(data, format)`, `exportToFile(graph, path, opts)` in `src/export.js` (#195)
- **`git mind import --from-markdown` command** — Import nodes and edges from markdown file frontmatter. Auto-generates `doc:` IDs from file paths, recognizes all 8 edge types as frontmatter fields. Supports `--dry-run`, `--json`, glob patterns (#196)
- **Frontmatter API** — `parseFrontmatter(content)`, `extractGraphData(path, frontmatter)`, `findMarkdownFiles(basePath, pattern)`, `importFromMarkdown(graph, cwd, pattern, opts)` in `src/frontmatter.js` (#196)
- **`importData` shared pipeline** — Extracted from `importFile` in `src/import.js` for reuse by frontmatter import and future merge (#196)
- **Cross-repo edge protocol** — `repo:owner/name:prefix:identifier` syntax for referencing nodes in other repositories. `git mind link --remote <owner/name>` qualifies local IDs. Validators accept cross-repo format, `extractPrefix` returns inner prefix (#197)
- **Remote API** — `parseCrossRepoId`, `buildCrossRepoId`, `isCrossRepoId`, `extractRepo`, `qualifyNodeId` in `src/remote.js` (#197)
- **`git mind merge` command** — Merge another repository's graph into the local graph with cross-repo qualification. Supports `--from <path>`, `--repo-name <owner/name>`, `--dry-run`, `--json`. Auto-detects repo identifier from origin remote (#198)
- **Merge API** — `mergeFromRepo(localGraph, remotePath, opts)`, `detectRepoIdentifier(repoPath)` in `src/merge.js` (#198)
- **GitHub Action** — Composite action (`action.yml`) that runs `git mind suggest` on PRs and posts formatted suggestions as a comment. Configurable agent command via action input or `.github/git-mind.yml` (#199)
- **PR suggestion display** — `formatSuggestionsAsMarkdown` renders suggestions as a markdown table with `/gitmind accept|reject|accept-all` commands. `parseReviewCommand` parses slash commands from comment bodies (#200)
- **Slash command workflow** — `.github/workflows/gitmind-review.yml` handles `/gitmind accept N`, `/gitmind reject N`, and `/gitmind accept-all` commands in PR comments (#200)

### Fixed

- **Privileged workflow checkout** — `gitmind-review.yml` now checks out the default branch (trusted code) instead of the PR head ref, preventing untrusted code execution in `issue_comment` context. Permissions scoped to `pull-requests: write` and `issues: write` only (#200)
- **Shell injection in `post-comment.js`** — Comment body passed via stdin (`--input -`) instead of shell interpolation, preventing backtick command substitution. Repo and PR number validated before use (#199)
- **`BOOLEAN_FLAGS` missing `dry-run` and `validate`** — `parseFlags` now treats `--dry-run` and `--validate` as boolean flags instead of consuming the next argument as their value (#195, #198)
- **Pipe characters in markdown table** — `formatSuggestionsAsMarkdown` escapes `|` in rationale and type fields to prevent table row corruption (#200)
- **Frontmatter CRLF handling** — `parseFrontmatter` now finds the first newline dynamically instead of assuming `\n` at offset 4, supporting Windows line endings (#196)
- **`buildCrossRepoId` validation** — Throws on malformed `localId` missing `prefix:identifier` format instead of producing an invalid cross-repo ID (#197)
- **Orphaned JSDoc** — `formatExportResult` moved above `formatImportResult`'s JSDoc block to restore correct documentation association (#195)
- **Accept/reject workflow stubs** — Individual `/gitmind accept N` and `/gitmind reject N` now respond with "not yet supported" instead of silently appearing to succeed (#200)
- **`action.yml` stderr mixing** — Suggest step redirects stderr to `/dev/null` instead of mixing it into JSON output (#199)

### Changed

- **`repo` added to `SYSTEM_PREFIXES`** — Cross-repo IDs use the `repo:` prefix, now classified as system (#197)
- **Test count** — 286 tests across 18 files (was 208 across 13)

## [2.0.0-alpha.2] - 2026-02-11

### Added

- **`git mind doctor` command** — Graph integrity checking with four composable detectors: dangling edges (error), orphan milestones (warning), orphan nodes (info), low-confidence edges (info). Supports `--fix` to auto-remove dangling edges, `--json` for structured output. Exit code 1 on errors (#193)
- **Doctor API** — `runDoctor(graph)`, `fixIssues(graph, issues)`, and individual detectors (`detectDanglingEdges`, `detectOrphanMilestones`, `detectOrphanNodes`, `detectLowConfidenceEdges`) in `src/doctor.js` (#193)
- **Git context extraction** — `src/context.js` extracts file, commit, and graph context for LLM prompts. Language inference from file extensions. Size-bounded prompt generation (~4000 chars) (#193)
- **`git mind suggest` command** — AI-powered edge suggestions via `GITMIND_AGENT` env var. Shells out to any command (stdin prompt, stdout JSON). Supports `--agent <cmd>`, `--context <sha-range>`, `--json`. Zero new dependencies (#193)
- **Suggest API** — `callAgent(prompt)`, `parseSuggestions(text)` (handles raw JSON and markdown code fences), `filterRejected(suggestions, graph)`, `generateSuggestions(cwd, graph)` in `src/suggest.js` (#193)
- **`git mind review` command** — Interactive review of pending suggestions with `[a]ccept / [r]eject / [s]kip` prompts via readline. Non-interactive batch mode via `--batch accept|reject`. `--json` output (#193)
- **Review API** — `getPendingSuggestions(graph)`, `acceptSuggestion` (promotes confidence to 1.0), `rejectSuggestion` (removes edge), `adjustSuggestion` (updates edge props), `skipSuggestion` (no-op), `getReviewHistory`, `batchDecision` in `src/review.js` (#193)
- **Decision provenance** — Review decisions stored as `decision:` prefixed nodes with action, source, target, edgeType, confidence, rationale, timestamp, and reviewer properties. Rejected edges excluded from future suggestions (#193)
- **`coverage` view** — Code-to-spec gap analysis: identifies `crate:`/`module:`/`pkg:` nodes lacking `implements` edges to `spec:`/`adr:` targets. Returns `meta.linked`, `meta.unlinked`, and `meta.coveragePct` (#191)
- **Echo ecosystem seed fixture** — `test/fixtures/echo-seed.yaml` with 55 nodes and 70 edges for integration testing (#191)
- **PROVING GROUND integration tests** — `test/proving-ground.test.js` validates 5 real project management questions against the Echo seed with deterministic ground truth (#191)
- **Dogfood session transcript** — `docs/dogfood-session.md` documents CLI walkthrough of all 5 questions (#191)

### Fixed

- **`parseFlags` boolean flag handling** — `--json` and `--fix` no longer consume the next argument as a value, fixing `git mind suggest --json --agent <cmd>` (#193)
- **Shell injection in `extractCommitContext`** — `opts.range` validated against shell metacharacters; commit SHAs validated as hex before interpolation into `execSync` (#193)
- **ReDoS in `parseSuggestions`** — Replaced polynomial regex for code fence extraction with non-backtracking pattern; replaced greedy array regex with `indexOf`/`lastIndexOf` (#193)
- **Agent subprocess timeout** — `callAgent` now enforces a configurable timeout (default 2 min) via `opts.timeout`, killing hung agent processes (#193)
- **Readline leak in interactive review** — `rl.close()` now called via `try/finally` to prevent terminal state corruption on error (#193)
- **Non-atomic edge type change in `adjustSuggestion`** — New edge created before old edge removed, preventing data loss if `createEdge` throws (#193)
- **Magic confidence default** — `adjustSuggestion` now preserves `original.confidence` instead of silently defaulting to 0.8 (#193)
- **`batchDecision` action validation** — Throws on invalid action instead of silently falling through to reject (#193)
- **Loose file node matching** — `extractGraphContext` uses exact match (`file:${fp}`) or suffix match instead of `includes()` to prevent false positives (#193)
- **`fixResult.details` guard** — `formatDoctorResult` handles undefined `details` array with nullish coalescing (#193)
- **`makeDecisionId` JSDoc** — Updated to say "unique" instead of "deterministic" since it includes `Date.now()` (#193)
- **`fixIssues` named properties** — Uses `issue.source`/`issue.target`/`issue.edgeType` instead of positional destructuring (#193)
- **N+1 query optimization** — `getPendingSuggestions`, `getReviewHistory`, and `filterRejected` use `Promise.all` for concurrent node prop fetches (#193)
- **Consistent flag handling** — `doctor`, `suggest`, `review` CLI commands read `--json`/`--fix` from `parseFlags` instead of mixing `args.includes()` (#193)
- **Sanitize `opts.limit`** — `extractCommitContext` coerces limit to safe integer (1–100) before shell interpolation (#193)
- **Expanded sanitization blocklist** — `sanitizeGitArg` now also rejects `<`, `>`, `\n`, `\r` (#193)
- **Unused import removed** — `extractPrefix` import removed from `src/doctor.js` (#193)
- **Decision nodes excluded from orphan detection** — `detectOrphanNodes` skips `decision:` prefix nodes (#193)
- **Defensive guard on `result.errors`** — `formatSuggestions` uses optional chaining for `result.errors` (#193)
- **ReDoS fence regex eliminated** — Replaced regex-based code fence extraction with `indexOf`-based approach (#193)
- **`skipSuggestion` documented as deferred** — JSDoc clarifies skip is intentional defer, not dismiss (#193)
- **Single-writer assumption documented** — `acceptSuggestion` and `adjustSuggestion` JSDoc notes edge must exist (#193)
- **`formatDecisionSummary` guard** — `result.decisions` now defaults to `[]` via nullish coalescing to prevent TypeError (#193)
- **`DoctorIssue` typedef updated** — Added optional `source`, `target`, `edgeType` properties used by dangling-edge issues (#193)
- **`adjustSuggestion` sets `reviewedAt` on type change** — New edge created during type change now receives a `reviewedAt` timestamp (#193)
- **`generateSuggestions` rejection diagnostic** — Returns `rejectedCount` and logs a diagnostic when all suggestions were previously rejected (#193)
- **`child.stdin` error handler** — `callAgent` attaches a no-op error listener on stdin to prevent uncaught EPIPE exceptions (#193)
- **Doctor test fixture corrected** — Dangling-edge test issue now includes `source`/`target`/`edgeType` matching `fixIssues` expectations (#193)
- **`buildPrompt` defensive guards** — Handles nullish `context.graph`/`commits`/`files` with defaults instead of throwing TypeError (#193)
- **`fetchDecisionProps` shared helper** — Extracted duplicated decision-node fetch logic from `getPendingSuggestions` and `getReviewHistory` into a reusable helper (#193)

### Changed

- **`suggest` and `review` stubs replaced** with full implementations (#193)
- **Test count** — 208 tests across 13 files (was 143 across 8)

## [2.0.0-alpha.1] - 2026-02-11

### Added

- **Node query API** — `src/nodes.js` promotes nodes from implicit edge endpoints to first-class queryable entities: `getNodes()`, `hasNode()`, `getNode()`, `getNodesByPrefix()`
- **`getNode()` returns full node info** — ID, extracted prefix, prefix classification (`canonical`/`system`/`unknown`), and properties from the materialized graph
- **`git mind nodes` command** — List and inspect nodes with `--prefix <prefix>` filtering, `--id <nodeId>` single-node detail, and `--json` output
- **Node formatting** — `formatNode()` and `formatNodeList()` in `src/cli/format.js` for terminal display
- **`git mind status` command** — Graph health dashboard showing node counts by prefix, edge counts by type, blocked items, low-confidence edges, and orphan nodes. Supports `--json` for CI pipelines
- **Status computation API** — `computeStatus(graph)` in `src/status.js` returns structured summary of graph state
- **YAML import pipeline** — `git mind import <file>` with schema-validated ingestion (`version: 1` required), idempotent merge semantics, reference validation (no dangling edges), and atomic writes (all-or-nothing)
- **Import API** — `importFile(graph, path, { dryRun })`, `parseImportFile()`, `validateImportData()` in `src/import.js`; exported from public API
- **Import CLI flags** — `--dry-run` validates without writing, `--validate` (alias), `--json` for structured output
- **Node properties in import** — YAML nodes can declare `properties:` key/value maps, written via `patch.setProperty()`
- **Declarative view engine** — `declareView(name, config)` compiles prefix/type filter configs into views; existing `roadmap`, `architecture`, `backlog` views refactored to declarative configs
- **`milestone` view** — progress tracking per milestone: child task counts, completion percentage, blockers
- **`traceability` view** — spec-to-implementation gap analysis: identifies unimplemented specs/ADRs, reports coverage percentage
- **`blockers` view** — transitive blocking chain resolution with cycle detection, root blocker identification
- **`onboarding` view** — topologically-sorted reading order for doc/spec/ADR nodes with cycle detection
- **Schema validators** — `src/validators.js` enforces GRAPH_SCHEMA.md at runtime: node ID grammar (`prefix:identifier`), edge type validation, confidence type safety (rejects NaN/Infinity/strings), self-edge rejection for `blocks` and `depends-on`, prefix classification with warnings for unknown prefixes
- **Validator exports** — `validateNodeId`, `validateEdgeType`, `validateConfidence`, `validateEdge`, `extractPrefix`, `classifyPrefix`, plus constants `NODE_ID_REGEX`, `NODE_ID_MAX_LENGTH`, `CANONICAL_PREFIXES`, `SYSTEM_PREFIXES`

### Fixed

- **`buildChain` stack overflow on cyclic graphs** — Root blocker leading into a cycle (e.g., `C → A → B → A`) caused infinite recursion; added visited guard (#189)
- **Duplicate cycle reports in blockers view** — Per-root DFS visited sets caused the same cycle to be reported from multiple entry points; switched to global visited set (#189)
- **O(n*m) lookups in traceability/onboarding views** — Replaced `Array.includes()` with `Set.has()` for spec and sorted membership checks (#189)
- **YAML arrays now rejected by `parseImportFile`** — `typeof [] === 'object'` no longer bypasses the guard; arrays produce "not an object" error instead of a confusing "Missing version" (#187)
- **Array-typed `node.properties` rejected during validation** — `validateImportData` now rejects arrays in `properties`, preventing `Object.entries` from writing numeric-indexed keys (#187)
- **Edge `createdAt` renamed to `importedAt`** — The timestamp on imported edges now honestly reflects import time; avoids misleading "creation" semantics on re-import (#187)
- **`--validate` alias documented in CLI help** — Usage text now shows `--dry-run, --validate` (#187)

### Changed

- **`blockedItems` now counts distinct blocked targets** — Previously counted `blocks` edges; now uses a `Set` on edge targets so two edges blocking the same node count as one blocked item (#185)
- **`isLowConfidence()` shared helper** — Low-confidence threshold (`< 0.5`) extracted from `status.js` and `views.js` into `validators.js` to keep the threshold in one place (#185)
- **`createEdge()` now validates all inputs** — Node IDs must use `prefix:identifier` format, confidence must be a finite number, self-edges rejected for blocking types
- **`EDGE_TYPES` canonical source** moved to `validators.js` (re-exported from `edges.js` for backwards compatibility)
- **`resetViews()` for test cleanup** — Removes test-registered views from the module-level registry, restoring built-in-only state (#189)
- **`builtInNames` initialized defensively** — Prevents `TypeError` if `resetViews()` is called before module finishes init (#189)
- **Removed dead `|| 0` fallback in onboarding view** — `inDegree` map is pre-initialized for all doc nodes, so the guard was unreachable (#189)
- **Milestone view returns self-contained subgraph** — Edge filter tightened from `||` to `&&` so returned edges only reference nodes in the result; eliminates dangling `implements` references to spec nodes (#189)
- **Onboarding view returns self-contained subgraph** — Same `||` → `&&` fix applied to `docEdges` filter; prevents non-doc nodes (e.g., `file:`) from appearing as dangling edge endpoints (#189)
- **`declareView` validates `config.prefixes`** — Throws on missing or empty prefixes array, surfacing misconfiguration early (#189)
- **Milestone view O(M×E) → O(E+M) edge lookups** — Pre-indexes `belongs-to` and `blocks` edges by target before the milestone loop (#189)
- **Onboarding ordering loop uses pre-filtered `docEdges`** — Eliminates redundant `docSet.has()` checks in dependency graph construction (#189)
- **Test count** — 143 tests across 8 files (was 74)

## [2.0.0-alpha.0] - 2026-02-07

Complete rewrite from C23 to Node.js on `@git-stunts/git-warp`.

### Added

- **Graph module** — Initialize, load, and checkpoint WARP graphs in any Git repo
- **Edge CRUD** — Create, query, and remove typed edges with confidence scores
- **8 edge types** — `implements`, `augments`, `relates-to`, `blocks`, `belongs-to`, `consumed-by`, `depends-on`, `documents`
- **Observer views** — Filtered projections: `roadmap`, `architecture`, `backlog`, `suggestions`
- **Commit hooks** — Parse directives (`IMPLEMENTS:`, `AUGMENTS:`, etc.) from commit messages to auto-create edges
- **CLI** — `git mind init`, `link`, `list`, `view`, `suggest` (stub), `review` (stub)
- **25 tests** — Full coverage of graph, edges, views, and hooks modules

### Changed

- **License** — Changed from MIND-UCAL-1.0 to Apache-2.0
- **Architecture** — Replaced C23 hexagonal architecture (libgit2, libsodium, CBOR, Roaring Bitmaps) with a thin Node.js wrapper around git-warp's CRDT graph engine

### Removed

- All C23 source code (archived on `archive/c23-final` branch)
- Meson build system
- Docker-based CI/CD
- All C-specific documentation

[5.0.0]: https://github.com/neuroglyph/git-mind/releases/tag/v5.0.0
[4.0.1]: https://github.com/neuroglyph/git-mind/releases/tag/v4.0.1
[4.0.0]: https://github.com/neuroglyph/git-mind/releases/tag/v4.0.0
[3.3.0]: https://github.com/neuroglyph/git-mind/releases/tag/v3.3.0
[3.2.0]: https://github.com/neuroglyph/git-mind/releases/tag/v3.2.0
[3.1.0]: https://github.com/neuroglyph/git-mind/releases/tag/v3.1.0
[3.0.0]: https://github.com/neuroglyph/git-mind/releases/tag/v3.0.0
[2.0.0-alpha.5]: https://github.com/neuroglyph/git-mind/releases/tag/v2.0.0-alpha.5
[2.0.0-alpha.4]: https://github.com/neuroglyph/git-mind/releases/tag/v2.0.0-alpha.4
[2.0.0-alpha.3]: https://github.com/neuroglyph/git-mind/releases/tag/v2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/neuroglyph/git-mind/releases/tag/v2.0.0-alpha.2
[2.0.0-alpha.0]: https://github.com/neuroglyph/git-mind/releases/tag/v2.0.0-alpha.0
