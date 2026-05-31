import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const dockerfileUrl = new URL('../scripts/upgrade-fixture/Dockerfile', import.meta.url);
const fixtureScriptUrl = new URL('../scripts/test-upgrade-fixture.sh', import.meta.url);
const runnerUrl = new URL('../scripts/upgrade-fixture/run-upgrade-fixture.mjs', import.meta.url);

describe('upgrade fixture harness', () => {
  it('pins the Docker base image by digest', async () => {
    const dockerfile = await readFile(dockerfileUrl, 'utf8');

    expect(dockerfile).toMatch(/^FROM node:22-bookworm-slim@sha256:[a-f0-9]{64}$/m);
  });

  it('installs the packed package with the audited lockfile', async () => {
    const dockerfile = await readFile(dockerfileUrl, 'utf8');
    const fixtureScript = await readFile(fixtureScriptUrl, 'utf8');
    const runner = await readFile(runnerUrl, 'utf8');

    expect(fixtureScript).toContain(
      'cp "$repo_root/package-lock.json" "$context/artifacts/package-lock.json"',
    );
    expect(dockerfile).toContain('COPY artifacts/package-lock.json /tmp/package-lock.json');
    expect(dockerfile).toContain('npm ci --omit=dev');
    expect(dockerfile).toContain('ENV GIT_MIND_PACKAGE_ROOT=/opt/git-mind');
    expect(runner).toContain('process.env.GIT_MIND_PACKAGE_ROOT');
    expect(dockerfile).not.toContain('npm install -g /tmp/git-mind-package.tgz');
  });
});
