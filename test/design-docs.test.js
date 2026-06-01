import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

  it('uses concrete system-owned commit and epoch IDs in graph-model examples', () => {
    const files = [
      'docs/design/graph-data-model.md',
      ...readdirSync('docs/design/feature-profiles')
        .filter((name) => name.endsWith('.md'))
        .map((name) => join('docs/design/feature-profiles', name)),
    ];
    const abstractIds = [];

    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/\b(commit|epoch):([A-Za-z0-9._/-]+)/g)) {
        const [, prefix, identifier] = match;
        if (!/^[0-9a-f]{7,40}$/.test(identifier)) {
          abstractIds.push(`${file}: ${prefix}:${identifier}`);
        }
      }
    }

    expect(abstractIds).toEqual([]);
  });
});
