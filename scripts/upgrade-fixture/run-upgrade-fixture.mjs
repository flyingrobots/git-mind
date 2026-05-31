#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const FIXTURE_NAME = 'gitmind-v5-warp14';
const FIXTURE_PATH = `/fixtures/${FIXTURE_NAME}.bundle`;
const METADATA_PATH = `/fixtures/${FIXTURE_NAME}.fixture.json`;
const WORK_ROOT = '/work';
const REPO_DIR = join(WORK_ROOT, 'repo');
const SCRUBBED_ENV = {
  ...process.env,
  HOME: '/tmp/home',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  SSH_AUTH_SOCK: '',
  GITHUB_TOKEN: '',
  NPM_TOKEN: '',
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(command, args, options = {}) {
  try {
    const result = await execFile(command, args, {
      ...options,
      env: SCRUBBED_ENV,
      maxBuffer: 20 * 1024 * 1024,
    });
    return result.stdout.trim();
  } catch (err) {
    const stdout = err.stdout ? `\nstdout:\n${err.stdout}` : '';
    const stderr = err.stderr ? `\nstderr:\n${err.stderr}` : '';
    throw new Error(
      `Command failed: ${command} ${args.join(' ')}${stdout}${stderr}`,
      { cause: err },
    );
  }
}

async function sha256File(filePath) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse ${label} as JSON:\n${text}`, { cause: err });
  }
}

async function fetchFixtureRefs(metadata) {
  const refspecs = metadata.refs.map(ref => {
    if (ref.name === 'HEAD') {
      return 'HEAD:refs/heads/fixture';
    }
    return `${ref.name}:${ref.name}`;
  });

  await run('git', ['init', REPO_DIR]);
  await run('git', ['-C', REPO_DIR, 'fetch', '--no-tags', FIXTURE_PATH, ...refspecs]);
  await run('git', ['-C', REPO_DIR, 'checkout', 'fixture']);
  await run('git', ['-C', REPO_DIR, 'config', 'user.name', 'Git Mind Upgrade Fixture']);
  await run('git', ['-C', REPO_DIR, 'config', 'user.email', 'git-mind-upgrade-fixture@example.invalid']);
}

async function assertFixtureRefs(metadata) {
  const head = await run('git', ['-C', REPO_DIR, 'rev-parse', 'HEAD']);
  assert(
    head === metadata.source.commit,
    `expected HEAD ${metadata.source.commit}, got ${head}`,
  );

  for (const ref of metadata.refs) {
    if (ref.name === 'HEAD') continue;
    const actual = await run('git', ['-C', REPO_DIR, 'rev-parse', ref.name]);
    assert(actual === ref.oid, `expected ${ref.name} ${ref.oid}, got ${actual}`);
  }
}

async function runGitWarpUpgrade(metadata) {
  const packageRoot = process.env.GIT_MIND_PACKAGE_ROOT
    ?? join(await run('npm', ['root', '-g']), '@neuroglyph', 'git-mind');
  const upgradeScript = join(
    packageRoot,
    'node_modules',
    '@git-stunts',
    'git-warp',
    'dist',
    'scripts',
    'upgrade-v16-to-v17.js',
  );

  const result = parseJson(
    await run('node', [
      upgradeScript,
      '--repo',
      REPO_DIR,
      '--graph',
      metadata.migration.graphName,
      '--json',
    ]),
    'git-warp upgrade',
  );

  assert(result.graphCount === 1, `expected one migrated graph, got ${result.graphCount}`);

  const graph = result.graphs[0];
  assert(graph.graphName === metadata.migration.graphName, 'migrated graph name changed');
  assert(graph.checkpoint.status === 'upgraded', 'checkpoint was not upgraded');
  assert(
    graph.checkpoint.previousSchema === metadata.migration.previousCheckpointSchema,
    'previous checkpoint schema changed',
  );
  assert(
    graph.checkpoint.currentSchema === metadata.migration.currentCheckpointSchema,
    'current checkpoint schema changed',
  );

  const legacyCheckpoint = metadata.refs.find(
    ref => ref.name === 'refs/warp/gitmind/checkpoints/head',
  );
  assert(legacyCheckpoint, 'fixture metadata missing legacy checkpoint ref');
  assert(
    graph.checkpoint.previousCheckpointSha === legacyCheckpoint.oid,
    'migration did not start from the fixture checkpoint',
  );
  assert(
    graph.checkpoint.upgradedCheckpointSha !== legacyCheckpoint.oid,
    'migration did not write a new checkpoint',
  );
}

async function assertGitMindStatus(metadata) {
  const status = parseJson(
    await run('git-mind', ['status', '--json'], { cwd: REPO_DIR }),
    'git-mind status',
  );

  assert(status.nodes.total === metadata.expected.status.nodes, 'node count changed');
  assert(status.edges.total === metadata.expected.status.edges, 'edge count changed');
  assert(
    status.health.blockedItems === metadata.expected.status.blockedItems,
    'blocked item count changed',
  );
  assert(
    status.health.lowConfidence === metadata.expected.status.lowConfidence,
    'low-confidence count changed',
  );
  assert(
    status.health.orphanNodes === metadata.expected.status.orphanNodes,
    'orphan node count changed',
  );
}

async function assertSentinelNodes(metadata) {
  const nodes = parseJson(
    await run('git-mind', ['nodes', '--json'], { cwd: REPO_DIR }),
    'git-mind nodes',
  );

  for (const node of metadata.expected.sentinelNodes) {
    assert(nodes.nodes.includes(node), `missing sentinel node: ${node}`);
  }
}

async function assertExport(metadata) {
  const exported = parseJson(
    await run('git-mind', ['export', '--json'], { cwd: REPO_DIR }),
    'git-mind export',
  );

  assert(exported.nodes.length === metadata.expected.export.nodes, 'export node count changed');
  assert(exported.edges.length === metadata.expected.export.edges, 'export edge count changed');
}

async function assertContentBoundary() {
  const content = parseJson(
    await run('git-mind', ['content', 'meta', 'doc:ROADMAP', '--json'], { cwd: REPO_DIR }),
    'git-mind content meta',
  );

  assert(content.hasContent === false, 'expected doc:ROADMAP to have no attached content');
}

async function main() {
  const metadata = parseJson(await readFile(METADATA_PATH, 'utf8'), 'fixture metadata');
  const initialHash = await sha256File(FIXTURE_PATH);
  assert(initialHash === metadata.artifact.sha256, 'fixture checksum mismatch');

  await rm(WORK_ROOT, { recursive: true, force: true });
  await mkdir(WORK_ROOT, { recursive: true });
  await mkdir('/tmp/home', { recursive: true });

  await fetchFixtureRefs(metadata);
  await run('git', ['-C', REPO_DIR, 'fsck', '--full']);
  await assertFixtureRefs(metadata);
  await runGitWarpUpgrade(metadata);
  await assertGitMindStatus(metadata);
  await assertSentinelNodes(metadata);
  await assertExport(metadata);
  await assertContentBoundary();

  const finalHash = await sha256File(FIXTURE_PATH);
  assert(finalHash === initialHash, 'fixture bundle changed during test');

  console.log(JSON.stringify({
    fixture: metadata.name,
    sourceCommit: metadata.source.commit,
    nodes: metadata.expected.status.nodes,
    edges: metadata.expected.status.edges,
    result: 'ok',
  }, null, 2));
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exitCode = 1;
});
