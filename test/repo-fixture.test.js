import { afterEach, describe, expect, it } from 'vitest';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { adrLinkedServiceBase, minimalDocsAndCodeBase } from './helpers/repo-bases.js';
import { repoFixture } from './helpers/repo-fixture.js';
import {
  withFeatureBranchOverlay,
  withIssueRefOverlay,
  withNoisyHistoryOverlay,
  withRecentHistoryOverlay,
} from './helpers/repo-overlays.js';

const fixtures = [];

async function buildFixture(builder) {
  const repo = await builder.build();
  fixtures.push(repo);
  return repo;
}

afterEach(async () => {
  while (fixtures.length > 0) {
    const repo = fixtures.pop();
    await repo.cleanup();
  }
});

describe('repo fixtures', () => {
  it('builds a scratch repo with a fluent file + commit API', async () => {
    const repo = await buildFixture(
      repoFixture('scratch')
        .withFile('README.md', '# Scratch Fixture\n')
        .commit('docs: add readme')
        .withFile('src/app.js', 'export const app = true;\n')
        .commit('feat: add app module'),
    );

    const branch = repo.git(['branch', '--show-current'], { capture: true }).trim();
    const log = repo.git(['log', '--format=%s'], { capture: true }).trim().split('\n');
    const readme = await readFile(join(repo.root, 'README.md'), 'utf-8');

    expect(branch).toBe('main');
    expect(log).toEqual(['feat: add app module', 'docs: add readme']);
    expect(readme).toContain('Scratch Fixture');
  });

  it('composes a base repo with history and reference overlays', async () => {
    const repo = await buildFixture(
      repoFixture('minimal-doc-code')
        .base(minimalDocsAndCodeBase())
        .overlay(withIssueRefOverlay({ issue: 42, pr: 9 }))
        .overlay(withRecentHistoryOverlay())
        .overlay(withFeatureBranchOverlay())
        .overlay(withNoisyHistoryOverlay()),
    );

    const log = repo.git(['log', '--format=%s'], { capture: true });
    const references = await readFile(join(repo.root, 'docs', 'references.md'), 'utf-8');
    const todo = await readFile(join(repo.root, 'notes', 'brainstorm.txt'), 'utf-8');
    const appSource = await readFile(join(repo.root, 'src', 'app.js'), 'utf-8');

    expect(log).toContain('merge: fold feature branch overlay back to main');
    expect(log).toContain('docs: add repo-local references overlay');
    expect(references).toContain('#42');
    expect(references).toContain('PR #9');
    expect(todo).toContain('maybe move auth into a plugin?');
    expect(appSource).toContain('buildApp');
  });

  it('provides an ADR-linked service base repo', async () => {
    const repo = await buildFixture(repoFixture('adr-linked-service').base(adrLinkedServiceBase()));

    await access(join(repo.root, 'docs', 'adr', '0001-auth.md'));
    await access(join(repo.root, 'src', 'auth.js'));

    const adr = await readFile(join(repo.root, 'docs', 'adr', '0001-auth.md'), 'utf-8');
    const readme = await readFile(join(repo.root, 'README.md'), 'utf-8');

    expect(adr).toContain('token-based auth');
    expect(readme).toContain('Auth Service');
  });
});
