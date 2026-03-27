import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initGraph } from '../src/graph.js';
import { createEdge } from '../src/edges.js';
import { repoFixture } from './helpers/repo-fixture.js';
import {
  extractFileContext,
  extractCommitContext,
  extractGraphContext,
  buildPrompt,
  extractContext,
} from '../src/context.js';

describe('context', () => {
  let repo;
  let tempDir;
  let graph;

  beforeEach(async () => {
    repo = await repoFixture('context').build();
    tempDir = repo.root;
    graph = await initGraph(tempDir);
  });

  afterEach(async () => {
    await repo.cleanup();
  });

  // ── extractFileContext ──────────────────────────────────────

  it('extracts tracked files with inferred languages', async () => {
    await repo.write('app.js', 'console.log("hello")');
    await repo.write('README.md', '# Hello');
    await repo.commit('init');

    const files = extractFileContext(tempDir);

    expect(files).toHaveLength(2);
    const jsFile = files.find(f => f.path === 'app.js');
    expect(jsFile).toBeDefined();
    expect(jsFile.language).toBe('javascript');

    const mdFile = files.find(f => f.path === 'README.md');
    expect(mdFile).toBeDefined();
    expect(mdFile.language).toBe('markdown');
  });

  it('returns empty array for repo with no tracked files', () => {
    const files = extractFileContext(tempDir);
    expect(files).toEqual([]);
  });

  it('respects the limit option', async () => {
    await repo.write('a.js', '');
    await repo.write('b.js', '');
    await repo.write('c.js', '');
    await repo.commit('init');

    const files = extractFileContext(tempDir, { limit: 2 });
    expect(files).toHaveLength(2);
  });

  // ── extractCommitContext ────────────────────────────────────

  it('extracts recent commits with files', async () => {
    await repo.write('app.js', 'v1');
    await repo.commit('feat: initial');

    await repo.write('app.js', 'v2');
    await repo.commit('fix: update app');

    const commits = extractCommitContext(tempDir);

    expect(commits.length).toBeGreaterThanOrEqual(1);
    expect(commits[0].sha).toBeTruthy();
    expect(commits[0].message).toBeTruthy();
    const hasFiles = commits.some(c => c.files && c.files.includes('app.js'));
    expect(hasFiles).toBe(true);
  });

  it('returns empty array for repo with no commits', () => {
    const commits = extractCommitContext(tempDir);
    expect(commits).toEqual([]);
  });

  // ── extractGraphContext ─────────────────────────────────────

  it('returns all nodes and edges when no filePaths given', async () => {
    await createEdge(graph, { source: 'task:a', target: 'spec:b', type: 'implements' });
    const ctx = await extractGraphContext(graph);

    expect(ctx.nodes).toContain('task:a');
    expect(ctx.nodes).toContain('spec:b');
    expect(ctx.edges).toHaveLength(1);
  });

  // ── buildPrompt ─────────────────────────────────────────────

  it('produces a structured prompt with schema info', () => {
    const context = {
      files: [{ path: 'src/app.js', language: 'javascript' }],
      commits: [{ sha: 'abc1234', message: 'feat: init', files: ['src/app.js'] }],
      graph: {
        nodes: ['task:a', 'spec:b'],
        edges: [{ from: 'task:a', to: 'spec:b', label: 'implements' }],
      },
    };
    const prompt = buildPrompt(context);

    expect(prompt).toContain('Graph Schema');
    expect(prompt).toContain('implements');
    expect(prompt).toContain('task:a');
    expect(prompt).toContain('JSON array');
  });

  it('truncates prompt to maxLength', () => {
    const context = {
      files: Array.from({ length: 100 }, (_, i) => ({ path: `file${i}.js`, language: 'javascript' })),
      commits: [],
      graph: { nodes: [], edges: [] },
    };
    const prompt = buildPrompt(context, { maxLength: 500 });
    expect(prompt.length).toBeLessThanOrEqual(500);
  });

  // ── security: sanitizeGitArg ───────────────────────────────

  it('rejects range values with shell metacharacters', () => {
    expect(() => extractCommitContext(tempDir, { range: 'HEAD; rm -rf /' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: 'HEAD | cat /etc/passwd' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: '$(whoami)' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: 'HEAD > /tmp/output' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: 'HEAD\necho pwned' })).toThrow(/Unsafe characters/);
  });

  it('rejects range values with spaces, tabs, and backslashes', () => {
    expect(() => extractCommitContext(tempDir, { range: 'HEAD --pretty=format:%H' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: 'HEAD\t--exec=whoami' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: 'HEAD\\necho' })).toThrow(/Unsafe characters/);
  });

  it('rejects range values with leading hyphens (option injection)', () => {
    expect(() => extractCommitContext(tempDir, { range: '--all' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: '--all-match' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: '-n99999' })).toThrow(/Unsafe characters/);
    expect(() => extractCommitContext(tempDir, { range: '--pretty=format:%H' })).toThrow(/Unsafe characters/);
  });

  it('uses exact match for file node association', async () => {
    await createEdge(graph, { source: 'file:src/app.js', target: 'spec:main', type: 'implements' });
    await createEdge(graph, { source: 'file:src/app.json', target: 'spec:other', type: 'implements' });

    // "app.js" should match "file:app.js" or "file:src/app.js" but NOT "file:src/app.json"
    const ctx = await extractGraphContext(graph, ['app.js']);
    const matchedNodes = ctx.nodes.filter(n => n.startsWith('file:'));
    expect(matchedNodes).toContain('file:src/app.js');
    expect(matchedNodes).not.toContain('file:src/app.json');
  });

  it('buildPrompt handles partial context gracefully', () => {
    // Missing graph, commits, files should not throw
    const prompt = buildPrompt({});
    expect(prompt).toContain('Graph Schema');
    expect(prompt).toContain('JSON array');
  });

  // ── extractContext orchestrator ─────────────────────────────

  it('assembles full context with prompt', async () => {
    await repo.write('app.js', 'console.log("hi")');
    await repo.commit('init');

    await createEdge(graph, { source: 'file:app.js', target: 'spec:main', type: 'implements' });
    const ctx = await extractContext(tempDir, graph);

    expect(ctx.files).toBeDefined();
    expect(ctx.commits).toBeDefined();
    expect(ctx.graph).toBeDefined();
    expect(ctx.prompt).toContain('Graph Schema');
  });
});
