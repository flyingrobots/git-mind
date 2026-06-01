import { execFileSync } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

const TEST_AUTHOR = {
  name: 'Git Mind Test',
  email: 'git-mind-test@example.com',
};

const FIRST_COMMIT_DATE_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

/**
 * Create a fluent temporary Git repository fixture builder.
 * @param {string} [name]
 * @returns {RepoFixtureBuilder}
 */
export function repoFixture(name = 'repo-fixture') {
  return new RepoFixtureBuilder(name);
}

/**
 * Alias for tests that read better with a verb phrase.
 * @param {string} name
 * @returns {RepoFixtureBuilder}
 */
export function createRepoFixture(name) {
  return repoFixture(name);
}

class RepoFixtureBuilder {
  constructor(name) {
    this.name = name;
    this.operations = [];
    this.expected = { semanticFacts: [] };
  }

  /**
   * Apply a named base repository recipe.
   * @param {(builder: RepoFixtureBuilder) => void} recipe
   * @returns {RepoFixtureBuilder}
   */
  base(recipe) {
    return this.overlay(recipe);
  }

  /**
   * Apply a scenario overlay.
   * @param {(builder: RepoFixtureBuilder) => void} recipe
   * @returns {RepoFixtureBuilder}
   */
  overlay(recipe) {
    if (typeof recipe !== 'function') {
      throw new TypeError('Repo fixture overlay must be a function');
    }
    recipe(this);
    return this;
  }

  /**
   * Alias for callers that prefer explicit overlay language.
   * @param {(builder: RepoFixtureBuilder) => void} recipe
   * @returns {RepoFixtureBuilder}
   */
  applyOverlay(recipe) {
    return this.overlay(recipe);
  }

  /**
   * Write or replace a file.
   * @param {string} filePath
   * @param {string|Buffer} content
   * @param {{ mode?: number, executable?: boolean }} [opts]
   * @returns {RepoFixtureBuilder}
   */
  withFile(filePath, content, opts = {}) {
    this.operations.push({ type: 'write', filePath, content, opts });
    return this;
  }

  /**
   * Delete a file.
   * @param {string} filePath
   * @returns {RepoFixtureBuilder}
   */
  deleteFile(filePath) {
    this.operations.push({ type: 'delete', filePath });
    return this;
  }

  /**
   * Change a file mode.
   * @param {string} filePath
   * @param {number} mode
   * @returns {RepoFixtureBuilder}
   */
  chmod(filePath, mode) {
    this.operations.push({ type: 'chmod', filePath, mode });
    return this;
  }

  /**
   * Commit the current working tree.
   * @param {string} message
   * @param {{ ref?: string, allowEmpty?: boolean }} [opts]
   * @returns {RepoFixtureBuilder}
   */
  commit(message, opts = {}) {
    this.operations.push({ type: 'commit', message, opts });
    return this;
  }

  /**
   * Create a branch at HEAD.
   * @param {string} name
   * @returns {RepoFixtureBuilder}
   */
  branch(name) {
    this.operations.push({ type: 'branch', name });
    return this;
  }

  /**
   * Check out an existing branch or ref.
   * @param {string} ref
   * @returns {RepoFixtureBuilder}
   */
  checkout(ref) {
    this.operations.push({ type: 'checkout', ref });
    return this;
  }

  /**
   * Merge a branch or ref into the current branch.
   * @param {string} ref
   * @param {{ message?: string, noFf?: boolean, commitRef?: string }} [opts]
   * @returns {RepoFixtureBuilder}
   */
  merge(ref, opts = {}) {
    this.operations.push({ type: 'merge', ref, opts });
    return this;
  }

  /**
   * Create a lightweight tag.
   * @param {string} name
   * @param {string} [ref]
   * @returns {RepoFixtureBuilder}
   */
  tag(name, ref = 'HEAD') {
    this.operations.push({ type: 'tag', name, ref });
    return this;
  }

  /**
   * Record an expected semantic fact for later bootstrap assertions.
   * @param {object} fact
   * @returns {RepoFixtureBuilder}
   */
  expectSemanticFact(fact) {
    this.expected.semanticFacts.push({ ...fact });
    return this;
  }

  /**
   * Build the fixture and return a handle.
   * @returns {Promise<RepoFixtureHandle>}
   */
  async build() {
    const root = await mkdtemp(resolve(tmpdir(), `gitmind-${slug(this.name)}-`));
    const handle = new RepoFixtureHandle(root, this.name, cloneExpected(this.expected));
    const state = { commitIndex: 0 };

    try {
      initGitRepo(root);

      for (const op of this.operations) {
        await applyOperation(handle, op, state);
      }

      return handle;
    } catch (err) {
      await handle.cleanup();
      throw err;
    }
  }
}

class RepoFixtureHandle {
  constructor(root, name, expected) {
    this.root = root;
    this.name = name;
    this.expected = expected;
    this.commits = {};
  }

  /**
   * Resolve a fixture-relative path and reject path escapes.
   * @param {string} filePath
   * @returns {string}
   */
  path(filePath) {
    return safeFixturePath(this.root, filePath);
  }

  /**
   * Run a Git command in the fixture root.
   * @param {string[]} args
   * @param {{ env?: NodeJS.ProcessEnv }} [opts]
   * @returns {string}
   */
  git(args, opts = {}) {
    return runGit(this.root, args, opts);
  }

  /**
   * Return tracked files in deterministic order.
   * @returns {string[]}
   */
  listFiles() {
    const out = this.git(['ls-files']);
    if (out === '') return [];
    return out.split('\n').filter(Boolean).sort();
  }

  /**
   * Return a graph-shaped one-line commit log for assertions.
   * @returns {string}
   */
  logGraph() {
    return this.git(['log', '--graph', '--oneline', '--decorate', '--all']);
  }

  /**
   * Return the current branch name.
   * @returns {string}
   */
  currentBranch() {
    return this.git(['branch', '--show-current']);
  }

  /**
   * Resolve a ref to a full SHA.
   * @param {string} [ref]
   * @returns {string}
   */
  commitSha(ref = 'HEAD') {
    return this.git(['rev-parse', ref]);
  }

  /**
   * Read a fixture file as UTF-8.
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async read(filePath) {
    return readFile(this.path(filePath), 'utf-8');
  }

  /**
   * Remove the fixture directory. Safe to call more than once.
   * @returns {Promise<void>}
   */
  async cleanup() {
    await rm(this.root, { recursive: true, force: true });
  }
}

/**
 * Base repo: README, overview doc, and a runtime module.
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function minimalDocCodeBase() {
  return builder => {
    builder
      .withFile('README.md', '# Runtime Service\n\nSee docs/overview.md and src/runtime.js.\n')
      .withFile('docs/overview.md', '# Runtime Overview\n\nThe runtime module lives in ../src/runtime.js.\n')
      .withFile('src/runtime.js', 'export function run() {\n  return "ok";\n}\n')
      .withFile('src/index.js', 'export { run } from "./runtime.js";\n')
      .expectSemanticFact({
        source: 'doc:README',
        type: 'documents',
        target: 'module:runtime',
      })
      .expectSemanticFact({
        source: 'module:runtime',
        type: 'groups',
        target: 'file:src/runtime.js',
      })
      .commit('feat: seed minimal docs and code', { ref: 'minimal' });
  };
}

/**
 * Base repo: minimal repo plus an ADR linked to the runtime.
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function adrLinkedServiceBase() {
  return builder => {
    minimalDocCodeBase()(builder);
    withAdrOverlay()(builder);
  };
}

/**
 * Add an ADR that references the runtime module.
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function withAdrOverlay() {
  return builder => {
    builder
      .withFile(
        'docs/adr/0001-bootstrap-contract.md',
        '# ADR 0001: Bootstrap Contract\n\nThe runtime module in ../../src/runtime.js powers the bootstrap contract.\n',
      )
      .expectSemanticFact({
        source: 'adr:0001-bootstrap-contract',
        type: 'documents',
        target: 'module:runtime',
      })
      .commit('docs: add bootstrap ADR', { ref: 'adr-bootstrap-contract' });
  };
}

/**
 * Add issue and PR references for bootstrap traceability tests.
 * @param {{ issue?: number, pr?: number }} [opts]
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function withIssueRefOverlay(opts = {}) {
  const issue = opts.issue ?? 305;
  const pr = opts.pr ?? 326;

  return builder => {
    builder
      .withFile(
        'docs/issues/bootstrap-trace.md',
        `# Bootstrap Trace\n\nRelated issue: #${issue}.\nRelated PR: #${pr}.\nRuntime: ../../src/runtime.js.\n`,
      )
      .expectSemanticFact({
        source: `issue:${issue}`,
        type: 'references',
        target: 'module:runtime',
      })
      .expectSemanticFact({
        source: `pr:${pr}`,
        type: 'references',
        target: `issue:${issue}`,
      })
      .commit(`docs: add bootstrap trace refs (#${issue})`, { ref: 'issue-pr-trace' });
  };
}

/**
 * Add generated, vendored, and ambiguous files for noisy bootstrap scenarios.
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function withNoisyFilesOverlay() {
  return builder => {
    builder
      .withFile('.gitignore', 'dist/\ncoverage/\n')
      .withFile('dist/generated.js', '/* generated */\n')
      .withFile('vendor/pkg/index.js', 'module.exports = {};\n')
      .withFile('docs/notes/ambiguous.md', '# Ambiguous\n\nThis might mention runtime or run time.\n')
      .commit('test: add noisy repository artifacts', { ref: 'noisy-artifacts' });
  };
}

/**
 * Add a simple sequence of commits for history-sensitive tests.
 * @param {{ count?: number }} [opts]
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function withHistoryOverlay(opts = {}) {
  const count = opts.count ?? 3;

  return builder => {
    for (let i = 1; i <= count; i++) {
      builder
        .withFile(`docs/history/step-${i}.md`, `# History Step ${i}\n\nTouches runtime evidence ${i}.\n`)
        .commit(`docs: add history step ${i}`, { ref: `history-${i}` });
    }
  };
}

/**
 * Create a feature branch, diverge main, and merge the branch back.
 * @param {{ branch?: string }} [opts]
 * @returns {(builder: RepoFixtureBuilder) => void}
 */
export function withFeatureBranchOverlay(opts = {}) {
  const branch = opts.branch ?? 'feature/bootstrap-fixture';

  return builder => {
    builder
      .branch(branch)
      .checkout(branch)
      .withFile('docs/notes/feature-branch.md', '# Feature Branch\n\nBranch-specific bootstrap evidence.\n')
      .commit('docs: add branch fixture evidence', { ref: 'branch-evidence' })
      .checkout('main')
      .withFile('src/runtime.js', 'export function run() {\n  return "mainline";\n}\n')
      .commit('feat: update runtime on main', { ref: 'main-runtime-update' })
      .merge(branch, {
        message: 'merge: integrate fixture branch',
        commitRef: 'feature-merge',
      });
  };
}

async function applyOperation(handle, op, state) {
  switch (op.type) {
    case 'write':
      await writeFixtureFile(handle, op.filePath, op.content, op.opts);
      break;
    case 'delete':
      await rm(handle.path(op.filePath));
      break;
    case 'chmod':
      await chmod(handle.path(op.filePath), op.mode);
      break;
    case 'commit':
      commitFixture(handle, op.message, op.opts, state);
      break;
    case 'branch':
      assertClean(handle, `create branch ${op.name}`);
      handle.git(['branch', op.name]);
      break;
    case 'checkout':
      assertClean(handle, `checkout ${op.ref}`);
      handle.git(['checkout', op.ref]);
      break;
    case 'merge':
      mergeFixture(handle, op.ref, op.opts, state);
      break;
    case 'tag':
      handle.git(['tag', '--no-sign', op.name, op.ref]);
      break;
    default:
      throw new Error(`Unknown repo fixture operation: ${op.type}`);
  }
}

async function writeFixtureFile(handle, filePath, content, opts) {
  const fullPath = handle.path(filePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content);

  if (opts.executable) {
    await chmod(fullPath, 0o755);
  } else if (opts.mode !== undefined) {
    await chmod(fullPath, opts.mode);
  }
}

function commitFixture(handle, message, opts, state) {
  const dirty = statusPorcelain(handle).length > 0;
  if (!dirty && !opts.allowEmpty) {
    throw new Error(`Cannot commit "${message}" with no changes`);
  }

  if (dirty) {
    handle.git(['add', '--all']);
  }

  const args = ['commit', '-m', message];
  if (opts.allowEmpty) {
    args.splice(1, 0, '--allow-empty');
  }

  handle.git(args, { env: commitEnv(state.commitIndex++) });
  const sha = handle.commitSha('HEAD');
  if (opts.ref) {
    handle.commits[opts.ref] = sha;
  }
}

function mergeFixture(handle, ref, opts, state) {
  assertClean(handle, `merge ${ref}`);

  const noFf = opts.noFf ?? true;
  const message = opts.message ?? `merge: integrate ${ref}`;
  const args = ['merge'];
  if (noFf) args.push('--no-ff');
  args.push('-m', message, ref);

  handle.git(args, { env: commitEnv(state.commitIndex++) });
  const sha = handle.commitSha('HEAD');
  if (opts.commitRef) {
    handle.commits[opts.commitRef] = sha;
  }
}

function assertClean(handle, action) {
  const status = statusPorcelain(handle);
  if (status.length > 0) {
    throw new Error(`Cannot ${action} with uncommitted changes:\n${status}`);
  }
}

function statusPorcelain(handle) {
  return handle.git(['status', '--porcelain']);
}

function initGitRepo(root) {
  try {
    runGit(root, ['init', '--initial-branch', 'main']);
  } catch {
    runGit(root, ['init']);
    runGit(root, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  }

  runGit(root, ['config', 'user.email', TEST_AUTHOR.email]);
  runGit(root, ['config', 'user.name', TEST_AUTHOR.name]);
  runGit(root, ['config', 'commit.gpgsign', 'false']);
  runGit(root, ['config', 'tag.gpgSign', 'false']);
  runGit(root, ['config', 'gc.auto', '0']);
  runGit(root, ['config', 'core.fsmonitor', 'false']);
  runGit(root, ['config', 'core.hooksPath', 'hooks-disabled']);
}

function runGit(cwd, args, opts = {}) {
  const output = execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...opts.env },
  });
  return output.trim();
}

function commitEnv(index) {
  const date = new Date(FIRST_COMMIT_DATE_MS + index * 1000).toISOString();
  return {
    GIT_AUTHOR_NAME: TEST_AUTHOR.name,
    GIT_AUTHOR_EMAIL: TEST_AUTHOR.email,
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_NAME: TEST_AUTHOR.name,
    GIT_COMMITTER_EMAIL: TEST_AUTHOR.email,
    GIT_COMMITTER_DATE: date,
  };
}

function safeFixturePath(root, filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('Fixture path must be a non-empty string');
  }
  if (isAbsolute(filePath)) {
    throw new Error(`Fixture path must be relative: ${filePath}`);
  }

  const resolved = resolve(root, filePath);
  const insideRoot = resolved === root || resolved.startsWith(root + sep);
  if (!insideRoot) {
    throw new Error(`Fixture path escapes fixture root: ${filePath}`);
  }
  return resolved;
}

function cloneExpected(expected) {
  return JSON.parse(JSON.stringify(expected));
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'fixture';
}

export { RepoFixtureBuilder, RepoFixtureHandle };
