import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import {
  createRepoFixture,
  repoFixture,
  minimalDocCodeBase,
  withAdrOverlay,
  withIssueRefOverlay,
  withFeatureBranchOverlay,
} from './helpers/repo-fixture.js';

describe('repo fixture builder', () => {
  it('builds deterministic Git repos with stable commit handles', async () => {
    const makeRepo = () => createRepoFixture('deterministic')
      .withFile('README.md', '# Deterministic\n')
      .withFile('src/app.js', 'export const app = true;\n')
      .commit('feat: seed deterministic repo', { ref: 'seed' })
      .build();

    const first = await makeRepo();
    const second = await makeRepo();

    try {
      expect(first.root).not.toBe(second.root);
      expect(first.commits.seed).toMatch(/^[0-9a-f]{40}$/);
      expect(first.commits.seed).toBe(second.commits.seed);
      expect(first.listFiles()).toEqual(['README.md', 'src/app.js']);
    } finally {
      await first.cleanup();
      await second.cleanup();
    }
  });

  it('composes a base repo with overlays into a readable repository story', async () => {
    const repo = await repoFixture('branching-bootstrap')
      .base(minimalDocCodeBase())
      .overlay(withAdrOverlay())
      .overlay(withIssueRefOverlay({ issue: 305, pr: 326 }))
      .overlay(withFeatureBranchOverlay())
      .build();

    try {
      expect(repo.currentBranch()).toBe('main');
      expect(repo.listFiles()).toEqual([
        'README.md',
        'docs/adr/0001-bootstrap-contract.md',
        'docs/issues/bootstrap-trace.md',
        'docs/notes/feature-branch.md',
        'docs/overview.md',
        'src/index.js',
        'src/runtime.js',
      ]);
      expect(repo.expected.semanticFacts).toContainEqual({
        source: 'doc:README',
        type: 'documents',
        target: 'module:runtime',
      });
      expect(repo.expected.semanticFacts).toContainEqual({
        source: 'adr:0001-bootstrap-contract',
        type: 'documents',
        target: 'module:runtime',
      });

      const headParents = repo.git(['rev-list', '--parents', '-n', '1', 'HEAD']).split(' ');
      expect(headParents).toHaveLength(3);
      expect(repo.logGraph()).toContain('merge: integrate fixture branch');
    } finally {
      await repo.cleanup();
    }
  });

  it('supports delete, chmod, tag, and cleanup operations', async () => {
    const repo = await createRepoFixture('ops')
      .withFile('README.md', '# Ops\n')
      .withFile('scratch.txt', 'remove me\n')
      .commit('feat: seed ops repo', { ref: 'seed' })
      .deleteFile('scratch.txt')
      .withFile('scripts/run.sh', '#!/bin/sh\nexit 0\n')
      .chmod('scripts/run.sh', 0o755)
      .commit('chore: add executable script', { ref: 'script' })
      .tag('fixture-ops')
      .build();

    const root = repo.root;

    expect(repo.listFiles()).toEqual(['README.md', 'scripts/run.sh']);
    expect(repo.git(['ls-files', '-s', 'scripts/run.sh'])).toMatch(/^100755 /);
    expect(repo.git(['rev-parse', 'fixture-ops'])).toBe(repo.commits.script);

    await repo.cleanup();
    expect(existsSync(root)).toBe(false);
  });

  it('rejects path escapes before writing outside the fixture root', async () => {
    await expect(
      createRepoFixture('escape')
        .withFile('../escape.txt', 'outside\n')
        .commit('feat: should not write')
        .build(),
    ).rejects.toThrow(/escapes fixture root/);
  });

  it('rejects branch operations with uncommitted changes', async () => {
    await expect(
      createRepoFixture('dirty-checkout')
        .withFile('README.md', '# Dirty\n')
        .commit('feat: seed dirty repo')
        .branch('feature/dirty')
        .withFile('dirty.txt', 'uncommitted\n')
        .checkout('feature/dirty')
        .build(),
    ).rejects.toThrow(/uncommitted changes/);
  });
});
