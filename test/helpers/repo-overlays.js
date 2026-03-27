/**
 * Reusable overlays for repository-shaped test fixtures.
 */

export function withIssueRefOverlay(options = {}) {
  const { issue = 42, pr = 9 } = options;

  return async repo => {
    await repo.write(
      'docs/references.md',
      [
        '# References',
        '',
        `Follow-up tracked in issue #${issue}.`,
        `Initial change discussed in PR #${pr}.`,
        '',
      ].join('\n'),
    );
    await repo.commit('docs: add repo-local references overlay');
  };
}

export function withRecentHistoryOverlay() {
  return async repo => {
    await repo.write(
      'src/app.js',
      [
        'export function buildApp() {',
        '  return { ok: true, version: 2 };',
        '}',
        '',
        'export function buildHealthcheck() {',
        '  return { status: "healthy" };',
        '}',
        '',
      ].join('\n'),
    );
    await repo.commit('feat: add healthcheck helper');

    await repo.write(
      'docs/overview.md',
      [
        '# Overview',
        '',
        'The service entry point lives in `src/app.js`.',
        'Recent change: `buildHealthcheck()` reports service readiness.',
        '',
      ].join('\n'),
    );
    await repo.commit('docs: capture recent fixture history');
  };
}

export function withFeatureBranchOverlay(options = {}) {
  const { branchName = 'feature/bootstrap-overlay' } = options;

  return async repo => {
    await repo.createBranch(branchName);
    await repo.write(
      'src/feature.js',
      'export const featureBranchNote = "branch overlay";\n',
    );
    await repo.commit('feat: add feature branch overlay note');
    await repo.checkout('main');
    await repo.merge(branchName, 'merge: fold feature branch overlay back to main');
  };
}

export function withNoisyHistoryOverlay() {
  return async repo => {
    await repo.write(
      'notes/brainstorm.txt',
      [
        'maybe move auth into a plugin?',
        'this might relate to issue #77 or maybe not',
        'check if docs/overview.md is still accurate',
        '',
      ].join('\n'),
    );
    await repo.commit('wip: add noisy brainstorming notes');
  };
}
