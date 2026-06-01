/**
 * @module graph
 * Wraps @git-stunts/git-warp graph operations for git-mind.
 */

import WarpGraph, { GitGraphAdapter, NodeCryptoAdapter } from '@git-stunts/git-warp';
import GitPlumbing from '@git-stunts/plumbing';
import { resolve } from 'node:path';

const GRAPH_NAME = 'gitmind';

function bind(owner, methodName) {
  if (!owner || typeof owner[methodName] !== 'function') {
    throw new Error(`git-warp surface missing ${methodName}()`);
  }
  return owner[methodName].bind(owner);
}

function bindOptional(owner, methodName) {
  if (owner && typeof owner[methodName] === 'function') {
    return owner[methodName].bind(owner);
  }
  return async () => {
    throw new Error(`git-warp surface missing ${methodName}()`);
  };
}

function unwrapCore(graph) {
  return typeof graph.core === 'function' ? graph.core() : graph;
}

/**
 * Provide the v14-shaped graph methods Git Mind currently uses while the
 * substrate exposes those capabilities through v17 app/core/query surfaces.
 *
 * @param {import('@git-stunts/git-warp').default | Record<string, unknown>} graph
 * @returns {import('@git-stunts/git-warp').default}
 */
function compatGraph(graph) {
  const core = unwrapCore(graph);
  const query = graph.query && typeof graph.query === 'object' ? graph.query : core;
  const patches = graph.patches && typeof graph.patches === 'object' ? graph.patches : core;
  let materialized = false;

  async function ensureMaterialized() {
    if (!materialized && typeof core.materialize === 'function') {
      await core.materialize();
      materialized = true;
    }
  }

  function read(methodName) {
    const fn = bind(query, methodName);
    return async (...args) => {
      await ensureMaterialized();
      return fn(...args);
    };
  }

  function readOptional(methodName) {
    const fn = query && typeof query[methodName] === 'function'
      ? query[methodName].bind(query)
      : null;
    return async (...args) => {
      if (!fn) {
        throw new Error(`git-warp surface missing ${methodName}()`);
      }
      await ensureMaterialized();
      return fn(...args);
    };
  }

  function markDirtyPatch(patch) {
    if (!patch || typeof patch.commit !== 'function') return patch;

    return new Proxy(patch, {
      get(target, prop, receiver) {
        if (prop === 'commit') {
          return async (...args) => {
            const result = await target.commit(...args);
            materialized = false;
            return result;
          };
        }

        const value = Reflect.get(target, prop, receiver);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  }

  return {
    graphName: graph.graphName ?? core.graphName,
    writerId: graph.writerId ?? core.writerId,
    core: () => core,

    createPatch: async (...args) => {
      await ensureMaterialized();
      return markDirtyPatch(await bind(patches, 'createPatch')(...args));
    },
    patch: async (...args) => {
      const result = await bindOptional(patches, 'patch')(...args);
      materialized = false;
      return result;
    },
    patchMany: async (...args) => {
      const result = await bindOptional(patches, 'patchMany')(...args);
      materialized = false;
      return result;
    },
    discoverTicks: bindOptional(patches, 'discoverTicks'),

    hasNode: read('hasNode'),
    getNodeProps: read('getNodeProps'),
    getEdgeProps: readOptional('getEdgeProps'),
    getNodes: read('getNodes'),
    getEdges: read('getEdges'),
    getContentOid: readOptional('getContentOid'),
    getContent: readOptional('getContent'),
    getContentMeta: readOptional('getContentMeta'),

    materialize: async (...args) => {
      const result = await bindOptional(core, 'materialize')(...args);
      materialized = true;
      return result;
    },
    worldline: bindOptional(query, 'worldline'),
    observer: async (...args) => {
      await ensureMaterialized();
      return compatGraph(await bind(query, 'observer')(...args));
    },
  };
}

/**
 * Initialize a new git-mind graph in a repository.
 * @param {string} repoPath - Path to the Git repository
 * @param {{ writerId?: string }} [opts]
 * @returns {Promise<import('@git-stunts/git-warp').default>}
 */
export async function initGraph(repoPath, opts = {}) {
  const cwd = resolve(repoPath);
  const writerId = opts.writerId ?? 'local';

  const plumbing = await GitPlumbing.createDefault({ cwd });
  const persistence = new GitGraphAdapter({ plumbing });

  const graph = await WarpGraph.open({
    graphName: GRAPH_NAME,
    persistence,
    writerId,
    autoMaterialize: true,
    crypto: new NodeCryptoAdapter(),
  });

  return compatGraph(graph);
}

/**
 * Load an existing git-mind graph from a repository.
 * @deprecated Use initGraph — WarpGraph.open is idempotent (init and load are the same call).
 * @param {string} repoPath - Path to the Git repository
 * @param {{ writerId?: string }} [opts]
 * @returns {Promise<import('@git-stunts/git-warp').default>}
 */
export async function loadGraph(repoPath, opts = {}) {
  return initGraph(repoPath, opts);
}
