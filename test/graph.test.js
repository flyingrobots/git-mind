import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { initGraph } from '../src/graph.js';
import { getProp } from '../src/prop-bag.js';

describe('graph', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'gitmind-test-'));
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('initGraph creates a WarpGraph', async () => {
    const graph = await initGraph(tempDir);
    expect(graph).toBeDefined();
    expect(typeof graph.createPatch).toBe('function');
    expect(typeof graph.getNodes).toBe('function');
  });

  it('initGraph is idempotent — calling twice returns a valid graph', async () => {
    await initGraph(tempDir);
    const graph = await initGraph(tempDir);
    expect(graph).toBeDefined();
  });

  it('round-trip: add node, reload via initGraph, verify', async () => {
    const graph = await initGraph(tempDir);

    const patch = await graph.createPatch();
    patch.addNode('test-node');
    patch.setProperty('test-node', 'label', 'hello');
    await patch.commit();

    // Reload in a new instance
    const graph2 = await initGraph(tempDir);
    const hasNode = await graph2.hasNode('test-node');
    expect(hasNode).toBe(true);

    const props = await graph2.getNodeProps('test-node');
    expect(getProp(props, 'label')).toBe('hello');
  });

  it('observer returns a read-compatible filtered graph surface', async () => {
    const graph = await initGraph(tempDir);

    const patch = await graph.createPatch();
    patch.addNode('task:one');
    patch.addNode('task:two');
    patch.addNode('spec:one');
    patch.setProperty('task:one', 'status', 'todo');
    patch.setProperty('task:one', 'secret', 'hidden');
    patch.addEdge('task:one', 'task:two', 'blocks');
    patch.addEdge('task:one', 'spec:one', 'implements');
    await patch.commit();

    const observer = await graph.observer('tasks', { match: 'task:*', expose: ['status'] });
    const nodes = await observer.getNodes();
    const edges = await observer.getEdges();
    const props = await observer.getNodeProps('task:one');

    expect(nodes.sort()).toEqual(['task:one', 'task:two']);
    expect(edges.map(({ from, to, label }) => ({ from, to, label }))).toEqual([
      { from: 'task:one', to: 'task:two', label: 'blocks' },
    ]);
    expect(getProp(props, 'status')).toBe('todo');
    expect(getProp(props, 'secret')).toBeUndefined();
    await expect(observer.getNodeProps('spec:one')).resolves.toBeNull();
  });
});
