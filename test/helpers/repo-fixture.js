import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const DEFAULT_AUTHOR_NAME = 'Test User';
const DEFAULT_AUTHOR_EMAIL = 'test@test.com';
const BASE_COMMIT_TIME = Date.parse('2026-01-01T00:00:00Z');

function sanitizeName(name) {
  return name.replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'repo-fixture';
}

function runGit(cwd, args, options = {}) {
  const { capture = false, env = {} } = options;
  return execFileSync('git', args, {
    cwd,
    encoding: capture ? 'utf-8' : undefined,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'ignore',
    env: { ...process.env, ...env },
  });
}

function isoTimestamp(index) {
  return new Date(BASE_COMMIT_TIME + index * 60_000).toISOString();
}

export class RepoFixture {
  #commitIndex = 0;

  /**
   * @param {string} name
   * @param {string} root
   */
  constructor(name, root) {
    this.name = name;
    this.root = root;
  }

  async init() {
    runGit(this.root, ['init', '--initial-branch=main']);
    runGit(this.root, ['config', 'user.email', DEFAULT_AUTHOR_EMAIL]);
    runGit(this.root, ['config', 'user.name', DEFAULT_AUTHOR_NAME]);
    return this;
  }

  /**
   * @param {string} relativePath
   * @returns {string}
   */
  resolve(relativePath) {
    return join(this.root, relativePath);
  }

  /**
   * @param {string} relativePath
   * @param {string | Uint8Array} content
   */
  async write(relativePath, content) {
    const absolutePath = this.resolve(relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
    return this;
  }

  /**
   * @param {Record<string, string | Uint8Array>} files
   */
  async writeFiles(files) {
    for (const [relativePath, content] of Object.entries(files)) {
      await this.write(relativePath, content);
    }
    return this;
  }

  /**
   * @param {string} relativePath
   */
  async remove(relativePath) {
    await rm(this.resolve(relativePath), { recursive: true, force: true });
    return this;
  }

  /**
   * @param {string[]} args
   * @param {{ capture?: boolean, env?: Record<string, string> }} [options]
   * @returns {string | Buffer}
   */
  git(args, options = {}) {
    return runGit(this.root, args, options);
  }

  currentSha() {
    return this.git(['rev-parse', 'HEAD'], { capture: true }).trim();
  }

  currentBranch() {
    return this.git(['branch', '--show-current'], { capture: true }).trim();
  }

  /**
   * Stage and commit all current repo changes using deterministic timestamps.
   *
   * @param {string} message
   * @param {{ allowEmpty?: boolean }} [options]
   */
  async commit(message, options = {}) {
    const { allowEmpty = false } = options;
    runGit(this.root, ['add', '--all', '--', '.']);
    const timestamp = isoTimestamp(this.#commitIndex);
    const args = ['commit', '-m', message];

    if (allowEmpty) {
      args.splice(1, 0, '--allow-empty');
    }

    runGit(this.root, args, {
      env: {
        GIT_AUTHOR_DATE: timestamp,
        GIT_COMMITTER_DATE: timestamp,
      },
    });

    this.#commitIndex += 1;
    return this.currentSha();
  }

  /**
   * @param {string} ref
   */
  async checkout(ref) {
    runGit(this.root, ['checkout', ref]);
    return this;
  }

  /**
   * @param {string} name
   * @param {{ from?: string, checkout?: boolean }} [options]
   */
  async createBranch(name, options = {}) {
    const { from = 'HEAD', checkout = true } = options;

    if (checkout && from === 'HEAD') {
      runGit(this.root, ['checkout', '-b', name]);
      return this;
    }

    runGit(this.root, ['branch', name, from]);
    if (checkout) {
      await this.checkout(name);
    }
    return this;
  }

  /**
   * @param {string} ref
   * @param {string} message
   */
  async merge(ref, message) {
    runGit(this.root, ['merge', '--no-ff', '-m', message, ref]);
    return this.currentSha();
  }

  async cleanup() {
    await rm(this.root, { recursive: true, force: true });
  }
}

export class RepoFixtureBuilder {
  #name;
  #base = null;
  #steps = [];
  #overlays = [];

  /**
   * @param {string} name
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * @param {(repo: RepoFixture) => Promise<unknown>} baseFactory
   */
  base(baseFactory) {
    this.#base = baseFactory;
    return this;
  }

  /**
   * @param {(repo: RepoFixture) => Promise<unknown>} overlayFactory
   */
  overlay(overlayFactory) {
    this.#overlays.push(overlayFactory);
    return this;
  }

  /**
   * @param {(repo: RepoFixture) => Promise<unknown>} overlayFactory
   */
  applyOverlay(overlayFactory) {
    return this.overlay(overlayFactory);
  }

  /**
   * @param {string} relativePath
   * @param {string | Uint8Array} content
   */
  withFile(relativePath, content) {
    this.#steps.push(repo => repo.write(relativePath, content));
    return this;
  }

  /**
   * @param {Record<string, string | Uint8Array>} files
   */
  withFiles(files) {
    this.#steps.push(repo => repo.writeFiles(files));
    return this;
  }

  /**
   * @param {string} relativePath
   */
  removeFile(relativePath) {
    this.#steps.push(repo => repo.remove(relativePath));
    return this;
  }

  /**
   * @param {string} message
   * @param {{ allowEmpty?: boolean }} [options]
   */
  commit(message, options = {}) {
    this.#steps.push(repo => repo.commit(message, options));
    return this;
  }

  async build() {
    const prefix = sanitizeName(this.#name);
    const root = await mkdtemp(join(tmpdir(), `gitmind-${prefix}-`));
    const repo = await new RepoFixture(this.#name, root).init();

    if (this.#base) {
      await this.#base(repo);
    }

    for (const step of this.#steps) {
      await step(repo);
    }

    for (const overlay of this.#overlays) {
      await overlay(repo);
    }

    return repo;
  }
}

/**
 * @param {string} name
 */
export function repoFixture(name) {
  return new RepoFixtureBuilder(name);
}

/**
 * @param {string} name
 */
export function createRepoFixture(name) {
  return repoFixture(name);
}
