import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('design docs integrity', () => {
  it('keeps the git-warp upgrade audit aligned with completed dependency reality', () => {
    const audit = readFileSync('docs/design/git-warp-upgrade-audit.md', 'utf8');
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    expect(audit).toMatch(/^Status: completed\./m);
    expect(audit).toContain(
      `- \`@git-stunts/git-warp\`: \`${packageJson.dependencies['@git-stunts/git-warp']}\``,
    );
    expect(audit).toContain(
      `- \`@git-stunts/plumbing\`: \`${packageJson.dependencies['@git-stunts/plumbing']}\``,
    );
    expect(audit).not.toMatch(
      /active execution|is running on|modernization is now needed|the next substrate upgrade should/,
    );
  });
});
